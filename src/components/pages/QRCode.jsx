import { useEffect, useState } from "react";
import { UploadCloud, QrCode } from "lucide-react";
import adminApi from "../../services/api";

const QRCode = () => {
  const [qr, setQr] = useState(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [fileInputKey, setFileInputKey] = useState(0);

  const fetchQR = async () => {
    try {
      setIsFetching(true);
      setErrorMsg("");
      const data = await adminApi.fetchQR();
      setQr(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setQr(null);
        return;
      }

      setErrorMsg(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Unable to load the current QR code."
      );
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchQR();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName || !image) {
      setErrorMsg("Both UPI ID and QR image are required.");
      return;
    }

    if (trimmedName.length > 100) {
      setErrorMsg("UPI ID must be 100 characters or less.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const data = await adminApi.uploadQR({ name: trimmedName, image });
      setQr(data);
      setName("");
      setImage(null);
      setFileInputKey((current) => current + 1);
      setSuccessMsg("QR code updated successfully.");
    } catch (err) {
      setErrorMsg(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Upload failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const nextFile = e.target.files?.[0] || null;
    setSuccessMsg("");

    if (!nextFile) {
      setImage(null);
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      setImage(null);
      setErrorMsg("Please choose a valid image file.");
      setFileInputKey((current) => current + 1);
      return;
    }

    if (nextFile.size > 5 * 1024 * 1024) {
      setImage(null);
      setErrorMsg("QR image must be 5MB or smaller.");
      setFileInputKey((current) => current + 1);
      return;
    }

    setErrorMsg("");
    setImage(nextFile);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md space-y-6">
      <div className="flex items-center justify-center space-x-2">
        <QrCode className="h-6 w-6 text-purple-600 dark:text-purple-400" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Manage QR Code
        </h1>
      </div>

      {qr && (
        <div className="text-center space-y-2">
          <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
            Current QR
          </h2>
          <p className="text-sm text-gray-500">{qr.name}</p>
          <img
            src={qr.imageUrl}
            alt="QR Code"
            className="w-48 h-48 mx-auto rounded-lg border border-gray-300 dark:border-gray-700 object-contain"
          />
        </div>
      )}

      {!isFetching && !qr && !errorMsg && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-600">
          No QR code is configured yet.
        </div>
      )}

      {successMsg && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            UPI ID
          </label>
          <input
            id="name"
            type="text"
            placeholder="yourcompany@upi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            QR Image
          </label>
          <input
            key={fileInputKey}
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-gray-700 dark:file:text-purple-300"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Use a JPG, PNG, or WebP image up to 5MB.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UploadCloud className="h-5 w-5 mr-2" />
          {loading ? "Uploading..." : "Upload New QR"}
        </button>
      </form>
    </div>
  );
};

export default QRCode;
