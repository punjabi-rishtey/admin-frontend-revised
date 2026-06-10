import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, MessageSquare, Clock } from "lucide-react";
import DataTable from "../common/DataTable";
import ModalForm from "../common/ModalForm";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingSpinner from "../common/LoadingSpinner";
import adminApi from "../../services/api";

const formatDateTime = (value) => {
  if (!value) return "-";

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleString();
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.response?.data?.error || fallback;

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [formData, setFormData] = useState({
    message: "",
    expiresAt: "",
  });
  const [notice, setNotice] = useState(null);
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const { messages: loadedMessages } = await adminApi.fetchMessages();
      setMessages(Array.isArray(loadedMessages) ? loadedMessages : []);
    } catch (error) {
      setMessages([]);
      setNotice({
        type: "error",
        message: getErrorMessage(
          error,
          "Unable to load broadcast messages right now."
        ),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleCloseModal = () => {
    setShowModal(false);
    setFormError("");
    setFormData({
      message: "",
      expiresAt: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const message = formData.message.trim();
    if (!message) {
      setFormError("Please enter the broadcast message.");
      return;
    }

    if (!formData.expiresAt) {
      setFormError("Please choose when the message should expire.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError("");
      await adminApi.createMessage({
        message,
        expiresAt: formData.expiresAt,
      });
      setNotice({ type: "success", message: "Broadcast message created." });
      handleCloseModal();
      await fetchMessages();
    } catch (error) {
      setFormError(
        getErrorMessage(error, "Unable to create the broadcast message.")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMessage?._id) return;

    try {
      setDeletingId(selectedMessage._id);
      await adminApi.deleteMessage(selectedMessage._id);
      setNotice({ type: "success", message: "Broadcast message deleted." });
      setShowDeleteDialog(false);
      setSelectedMessage(null);
      await fetchMessages();
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Unable to delete this message."),
      });
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      key: "message",
      label: "Message",
      render: (value) => (
        <div className="max-w-md">
          <p className="text-sm text-gray-900">{value}</p>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: formatDateTime,
    },
    {
      key: "expiresAt",
      label: "Expires",
      sortable: true,
      render: (value) => {
        const expiryDate = new Date(value);
        const isExpired =
          !Number.isNaN(expiryDate.getTime()) && expiryDate < new Date();

        return (
          <span className={isExpired ? "text-red-600" : "text-gray-900"}>
            {formatDateTime(value)}
            {isExpired ? " (Expired)" : ""}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (_, message) => {
        const isExpired =
          message.expiresAt && new Date(message.expiresAt) < new Date();

        return (
          <span
            className={`px-2 py-1 text-xs rounded-full font-medium ${
              isExpired
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {isExpired ? "Expired" : "Active"}
          </span>
        );
      },
    },
  ];

  const actions = (message) => (
    <button
      onClick={(event) => {
        event.stopPropagation();
        setSelectedMessage(message);
        setShowDeleteDialog(true);
      }}
      className="p-1 rounded hover:bg-gray-100"
      title="Delete Message"
    >
      <Trash2 className="h-4 w-4 text-red-600" />
    </button>
  );

  if (loading) return <LoadingSpinner />;

  const activeCount = messages.filter(
    (message) => message.expiresAt && new Date(message.expiresAt) > new Date()
  ).length;
  const expiredCount = messages.length - activeCount;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Broadcast Messages</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          <span>New Message</span>
        </button>
      </div>

      {notice && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {notice.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Messages
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {activeCount}
              </p>
            </div>
            <MessageSquare className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Expired Messages
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {expiredCount}
              </p>
            </div>
            <Clock className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={messages}
        actions={actions}
        searchPlaceholder="Search messages..."
        defaultSort={{ key: "createdAt", direction: "desc" }}
      />

      <ModalForm
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Create Broadcast Message"
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(event) =>
                setFormData({ ...formData, message: event.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your broadcast message..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="datetime-local"
              required
              value={formData.expiresAt}
              onChange={(event) =>
                setFormData({ ...formData, expiresAt: event.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:cursor-wait disabled:opacity-70"
            >
              {isSubmitting ? "Creating..." : "Create Message"}
            </button>
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Message"
        message="Delete this broadcast message? This action cannot be undone."
        confirmText={deletingId ? "Deleting..." : "Delete Message"}
      />
    </div>
  );
};

export default Messages;
