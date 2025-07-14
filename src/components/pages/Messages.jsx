// components/pages/Messages.jsx
import { useState, useEffect } from "react";
import { Plus, Trash2, MessageSquare, Clock } from "lucide-react";
import DataTable from "../common/DataTable";
import ModalForm from "../common/ModalForm";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingSpinner from "../common/LoadingSpinner";
import adminApi from "../../services/adminApi";

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

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const {
        data: { messages },
      } = await adminApi.fetchMessages();
      setMessages(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]); // fallback to empty array to prevent crash
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createMessage(formData);
      fetchMessages();
      handleCloseModal();
    } catch (error) {
      console.error("Error creating message:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteMessage(selectedMessage._id);
      fetchMessages();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      message: "",
      expiresAt: "",
    });
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
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "expiresAt",
      label: "Expires",
      sortable: true,
      render: (value) => {
        const expiryDate = new Date(value);
        const isExpired = expiryDate < new Date();
        return (
          <span className={isExpired ? "text-red-600" : ""}>
            {expiryDate.toLocaleDateString()}
            {isExpired && " (Expired)"}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (_, message) => {
        const isExpired = new Date(message.expiresAt) < new Date();
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
      onClick={(e) => {
        e.stopPropagation();
        setSelectedMessage(message);
        setShowDeleteDialog(true);
      }}
      className="p-1 rounded hover:bg-gray-100"
    >
      <Trash2 className="h-4 w-4 text-red-600" />
    </button>
  );

  if (loading) return <LoadingSpinner />;

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Messages
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {
                  messages.filter((m) => new Date(m.expiresAt) > new Date())
                    .length
                }
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
                {
                  messages.filter((m) => new Date(m.expiresAt) <= new Date())
                    .length
                }
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
      />

      <ModalForm
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Create Broadcast Message"
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
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
              onChange={(e) =>
                setFormData({ ...formData, expiresAt: e.target.value })
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
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              Create Message
            </button>
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
      />
    </div>
  );
};

export default Messages;
