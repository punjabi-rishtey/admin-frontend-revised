import { useState } from "react";

const ApproveModal = ({ isOpen, onClose, onConfirm }) => {
  const [startDate, setStartDate] = useState("");
  const [expiryMonths, setExpiryMonths] = useState(6);

  const handleSubmit = () => {
    if (!startDate || !expiryMonths) return alert("All fields required");
    const start = new Date(startDate);
    const expiresAt = new Date(start);
    expiresAt.setMonth(start.getMonth() + parseInt(expiryMonths));
    onConfirm(start.toISOString(), expiryMonths);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[90%] max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Approve User</h2>

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

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveModal;
