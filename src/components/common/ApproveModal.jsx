import { useEffect, useState } from "react";

const ApproveModal = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  title = "Approve Membership",
}) => {
  const [startDate, setStartDate] = useState("");
  const [expiryMonths, setExpiryMonths] = useState(6);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError("");
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setError("");
    if (!startDate || !expiryMonths) {
      setError("Start date and membership duration are required.");
      return;
    }

    const start = new Date(startDate);
    const months = Number(expiryMonths);
    if (Number.isNaN(start.getTime()) || Number.isNaN(months) || months <= 0) {
      setError("Please enter a valid start date and duration.");
      return;
    }

    try {
      setSubmitting(true);
      await onConfirm(start.toISOString(), months);
    } catch (approvalError) {
      setError(
        approvalError.response?.data?.message ||
          approvalError.message ||
          "Could not approve the membership. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-1">{title}</h2>
        <p className="text-sm text-gray-600 mb-4">
          {userName
            ? `Choose the start date and duration for ${userName}.`
            : "Choose the membership start date and duration."}
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Number of Months (Expiry)
            </label>
            <input
              type="number"
              value={expiryMonths}
              min="1"
              onChange={(e) => setExpiryMonths(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {submitting ? "Approving..." : "Approve Membership"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveModal;
