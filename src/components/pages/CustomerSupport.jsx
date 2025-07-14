// components/pages/CustomerSupport.jsx
import { useState, useEffect } from "react";
import { Reply, Check, Clock, AlertCircle } from "lucide-react";
import DataTable from "../common/DataTable";
import ModalForm from "../common/ModalForm";
import LoadingSpinner from "../common/LoadingSpinner";
import adminApi from "../../services/api";

const CustomerSupport = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchInquiries();
  }, [filter]);

  const fetchInquiries = async () => {
    try {
      const { inquiries } = await adminApi.fetchInquiries();

      // Patch each inquiry with a default status for frontend logic
      const inquiriesWithStatus = inquiries.map((inq) => ({
        ...inq,
        status: inq.status || "open", // default to 'open' if missing
      }));

      setInquiries(
        filter === "all"
          ? inquiriesWithStatus
          : inquiriesWithStatus.filter((i) => i.status === filter)
      );
    } catch (error) {
      console.error("Error fetching inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    try {
      await adminApi.replyToInquiry(selectedInquiry._id, {
        message: replyMessage,
      });
      setShowReplyModal(false);
      setReplyMessage("");
      fetchInquiries();
    } catch (error) {
      console.error("Error replying to inquiry:", error);
    }
  };

  const handleClose = async (inquiryId) => {
    try {
      await adminApi.closeInquiry(inquiryId);
      fetchInquiries();
    } catch (error) {
      console.error("Error closing inquiry:", error);
    }
  };

  const columns = [
    {
      key: "name",
      label: "Customer",
      sortable: true,
      render: (value, inquiry) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{inquiry.email}</div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      sortable: true,
    },
    {
      key: "subject",
      label: "Subject",
      sortable: true,
    },
    {
      key: "message",
      label: "Message",
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const statusConfig = {
          open: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
          replied: { color: "bg-blue-100 text-blue-800", icon: Reply },
          closed: { color: "bg-green-100 text-green-800", icon: Check },
        };
        const config = statusConfig[value] || statusConfig.open;
        const Icon = config.icon;

        return (
          <span
            className={`px-2 py-1 text-xs rounded-full font-medium flex items-center space-x-1 ${config.color}`}
          >
            <Icon className="h-3 w-3" />
            <span>{value}</span>
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  const actions = (inquiry) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedInquiry(inquiry);
          setShowReplyModal(true);
        }}
        className="p-1 rounded hover:bg-gray-100"
        title="Reply"
      >
        <Reply className="h-4 w-4 text-blue-600" />
      </button>
      {inquiry.status !== "closed" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClose(inquiry._id);
          }}
          className="p-1 rounded hover:bg-gray-100"
          title="Mark as Closed"
        >
          <Check className="h-4 w-4 text-green-600" />
        </button>
      )}
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Customer Support</h1>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <span className="text-sm text-gray-600">
            {inquiries.filter((i) => i.status === "open").length} open inquiries
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex space-x-2">
            {["all", "open", "replied", "closed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filter === status
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={inquiries}
        actions={actions}
        onRowClick={setSelectedInquiry}
        searchPlaceholder="Search inquiries..."
      />

      <ModalForm
        isOpen={showReplyModal}
        onClose={() => {
          setShowReplyModal(false);
          setReplyMessage("");
        }}
        title="Reply to Inquiry"
        onSubmit={handleReply}
      >
        {selectedInquiry && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">
                {selectedInquiry.subject}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                From: {selectedInquiry.name} ({selectedInquiry.email})
              </p>
              <p className="text-gray-700">{selectedInquiry.message}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Reply
              </label>
              <textarea
                required
                rows={4}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Type your reply here..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyMessage("");
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                Send Reply
              </button>
            </div>
          </div>
        )}
      </ModalForm>

      {selectedInquiry && !showReplyModal && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onClose={() => setSelectedInquiry(null)}
        />
      )}
    </div>
  );
};

// Inquiry Detail Modal
const InquiryDetailModal = ({ inquiry, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Inquiry Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Name
                </label>
                <p className="text-gray-900">{inquiry.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-gray-900">{inquiry.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Phone
                </label>
                <p className="text-gray-900">{inquiry.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Date
                </label>
                <p className="text-gray-900">
                  {new Date(inquiry.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Subject
              </label>
              <p className="text-gray-900 font-medium">{inquiry.subject}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Message
              </label>
              <p className="text-gray-900 whitespace-pre-wrap">
                {inquiry.message}
              </p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;
