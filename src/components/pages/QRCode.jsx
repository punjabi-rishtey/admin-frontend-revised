import React, { useState, useEffect } from "react";
import { UploadCloud, QrCode } from "lucide-react";

const API_URL = "https://backend-nm1z.onrender.com/api/admin/auth/qr";

const QRCode = () => {
  const [qr, setQr] = useState(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchQR = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("No QR code found");
      const data = await res.json();
      setQr(data);
    } catch (err) {
      console.warn("No existing QR:", err.message);
    }
  };

  useEffect(() => {
    fetchQR();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !image) {
      setErrorMsg("Both UPI ID and QR image are required.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("image", image);

    try {
      setLoading(true);
      setErrorMsg("");

      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setQr(data);
      setName("");
      setImage(null);
    } catch (err) {
      setErrorMsg("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
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
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-gray-700 dark:file:text-purple-300"
            required
          />
        </div>

        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

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
