// components/common/ConfirmDialog.jsx
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  confirmVariant = "danger",
}) => {
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const confirmClasses =
    confirmVariant === "success"
      ? "bg-green-600 hover:bg-green-700"
      : confirmVariant === "primary"
      ? "bg-purple-600 hover:bg-purple-700"
      : "bg-red-600 hover:bg-red-700";

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      await Promise.resolve(onConfirm());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">{message}</p>
          
          <div className="flex space-x-3 justify-end">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:cursor-wait disabled:opacity-70 ${confirmClasses}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
