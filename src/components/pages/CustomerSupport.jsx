// components/pages/CustomerSupport.jsx
import { useCallback, useEffect, useState } from "react";
import { Reply, Check, Clock, AlertCircle, X } from "lucide-react";
import DataTable from "../common/DataTable";
import ModalForm from "../common/ModalForm";
import LoadingSpinner from "../common/LoadingSpinner";
import adminApi from "../../services/api";

const statusConfig = {
  open: { label: "Open", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  replied: { label: "Replied", color: "bg-blue-100 text-blue-800", icon: Reply },
  closed: { label: "Closed", color: "bg-green-100 text-green-800", icon: Check },
};

const normalizeInquiry = (inquiry) => ({
  ...inquiry,
  status: statusConfig[inquiry.status] ? inquiry.status : "open",
  replies: Array.isArray(inquiry.replies) ? inquiry.replies : [],
});

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.response?.data?.error || fallback;

const CustomerSupport = () => {
  const [inquiries, setInquiries] = useState([]);
  const [summaryCounts, setSummaryCounts] = useState({
    open: 0,
    replied: 0,
    closed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState(null);
  const [replyError, setReplyError] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [closingId, setClosingId] = useState(null);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      const [filteredResponse, allResponse] = await Promise.all([
        adminApi.fetchInquiries({ status: filter }),
        filter === "all"
          ? Promise.resolve(null)
          : adminApi.fetchInquiries({ status: "all" }),
      ]);

      const filteredInquiries = (filteredResponse.inquiries || []).map(
        normalizeInquiry
      );
      const allInquiries =
        filter === "all"
          ? filteredInquiries
          : (allResponse?.inquiries || []).map(normalizeInquiry);

      setInquiries(filteredInquiries);
      setSummaryCounts({
        open: allInquiries.filter((inquiry) => inquiry.status === "open").length,
        replied: allInquiries.filter((inquiry) => inquiry.status === "replied")
          .length,
        closed: allInquiries.filter((inquiry) => inquiry.status === "closed")
          .length,
        total: allInquiries.length,
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Unable to load support inquiries."),
      });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const openReplyModal = (inquiry) => {
    setSelectedInquiry(normalizeInquiry(inquiry));
    setReplyMessage("");
    setReplyError("");
    setShowReplyModal(true);
  };

  const closeReplyModal = () => {
    setShowReplyModal(false);
    setReplyMessage("");
    setReplyError("");
  };

  const handleReply = async (event) => {
    event.preventDefault();

    if (!replyMessage.trim()) {
      setReplyError("Please type a reply before sending.");
      return;
    }

    try {
      setIsReplying(true);
      setReplyError("");
      const response = await adminApi.replyToInquiry(selectedInquiry._id, {
        message: replyMessage.trim(),
      });
      const updatedInquiry = normalizeInquiry(response.data.inquiry);

      setSelectedInquiry(updatedInquiry);
      setNotice({ type: "success", message: "Reply sent and saved." });
      closeReplyModal();
      await fetchInquiries();
    } catch (error) {
      setReplyError(
        getErrorMessage(error, "Unable to send the reply. Please try again.")
      );
    } finally {
      setIsReplying(false);
    }
  };

  const handleClose = async (inquiryId) => {
    try {
      setClosingId(inquiryId);
      const response = await adminApi.closeInquiry(inquiryId);
      const updatedInquiry = normalizeInquiry(response.data.inquiry);

      if (selectedInquiry?._id === inquiryId) {
        setSelectedInquiry(updatedInquiry);
      }

      setNotice({ type: "success", message: "Inquiry closed." });
      await fetchInquiries();
    } catch (error) {
      setNotice({
        type: "error",
        message: getErrorMessage(error, "Unable to close the inquiry."),
      });
    } finally {
      setClosingId(null);
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
        const config = statusConfig[value] || statusConfig.open;
        const Icon = config.icon;

        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${config.color}`}
          >
            <Icon className="h-3 w-3" />
            <span>{config.label}</span>
          </span>
        );
      },
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: formatDate,
    },
  ];

  const actions = (inquiry) => {
    const isClosed = inquiry.status === "closed";
    const isClosing = closingId === inquiry._id;

    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={(event) => {
            event.stopPropagation();
            openReplyModal(inquiry);
          }}
          disabled={isClosed}
          className="rounded p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          title={isClosed ? "Closed inquiries cannot be replied to" : "Reply"}
        >
          <Reply className="h-4 w-4 text-blue-600" />
        </button>
        {!isClosed && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              handleClose(inquiry._id);
            }}
            disabled={isClosing}
            className="rounded p-1 hover:bg-gray-100 disabled:cursor-wait disabled:opacity-40"
            title="Mark as Closed"
          >
            <Check className="h-4 w-4 text-green-600" />
          </button>
        )}
      </div>
    );
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Customer Support</h1>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <span className="text-sm text-gray-600">
            {filter === "all"
              ? `${summaryCounts.open} open inquiries`
              : `${inquiries.length} ${filter} inquiries shown • ${summaryCounts.open} open overall`}
          </span>
        </div>
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

      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex flex-wrap gap-2">
            {["all", "open", "replied", "closed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                  filter === status
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status === "all" ? "All" : statusConfig[status].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={inquiries}
        actions={actions}
        onRowClick={(inquiry) => setSelectedInquiry(normalizeInquiry(inquiry))}
        searchPlaceholder="Search inquiries..."
      />

      <ModalForm
        isOpen={showReplyModal}
        onClose={closeReplyModal}
        title="Reply to Inquiry"
        onSubmit={handleReply}
      >
        {selectedInquiry && (
          <div className="space-y-4">
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-medium text-gray-900">
                {selectedInquiry.subject}
              </h4>
              <p className="mb-2 text-sm text-gray-600">
                From: {selectedInquiry.name} ({selectedInquiry.email})
              </p>
              <p className="whitespace-pre-wrap text-gray-700">
                {selectedInquiry.message}
              </p>
            </div>

            {selectedInquiry.replies.length > 0 && (
              <ReplyHistory replies={selectedInquiry.replies} compact />
            )}

            {replyError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {replyError}
              </div>
            )}

            <div>
              <label
                htmlFor="support-reply"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Your Reply
              </label>
              <textarea
                id="support-reply"
                required
                rows={4}
                value={replyMessage}
                onChange={(event) => setReplyMessage(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-purple-500"
                placeholder="Type your reply here..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={closeReplyModal}
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isReplying}
                className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:cursor-wait disabled:opacity-70"
              >
                {isReplying ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        )}
      </ModalForm>

      {selectedInquiry && !showReplyModal && (
        <InquiryDetailModal
          inquiry={selectedInquiry}
          onReply={() => openReplyModal(selectedInquiry)}
          onCloseInquiry={() => handleClose(selectedInquiry._id)}
          isClosing={closingId === selectedInquiry._id}
          onClose={() => setSelectedInquiry(null)}
        />
      )}
    </div>
  );
};

const ReplyHistory = ({ replies, compact = false }) => (
  <div className="space-y-2">
    <h4 className="text-sm font-medium text-gray-700">Reply History</h4>
    <div className="space-y-2">
      {replies.map((reply) => (
        <div
          key={reply._id || reply.sentAt}
          className={`rounded-lg border border-gray-200 bg-white ${
            compact ? "p-3" : "p-4"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm text-gray-800">
            {reply.message}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Sent {formatDate(reply.sentAt)}
            {reply.admin?.email ? ` by ${reply.admin.email}` : ""}
          </p>
        </div>
      ))}
    </div>
  </div>
);

const InquiryDetailModal = ({
  inquiry,
  onClose,
  onReply,
  onCloseInquiry,
  isClosing,
}) => {
  const config = statusConfig[inquiry.status] || statusConfig.open;
  const isClosed = inquiry.status === "closed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Inquiry Details</h2>
              <span
                className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ${config.color}`}
              >
                {config.label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close details"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            <div className="grid gap-4 sm:grid-cols-2">
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
                <p className="break-all text-gray-900">{inquiry.email}</p>
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
                <p className="text-gray-900">{formatDate(inquiry.createdAt)}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Subject
              </label>
              <p className="font-medium text-gray-900">{inquiry.subject}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">
                Message
              </label>
              <p className="whitespace-pre-wrap text-gray-900">
                {inquiry.message}
              </p>
            </div>

            {inquiry.replies.length > 0 && (
              <ReplyHistory replies={inquiry.replies} />
            )}

            <div className="flex flex-wrap justify-end gap-3 border-t pt-4">
              {!isClosed && (
                <>
                  <button
                    type="button"
                    onClick={onReply}
                    className="rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    onClick={onCloseInquiry}
                    disabled={isClosing}
                    className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-wait disabled:opacity-70"
                  >
                    {isClosing ? "Closing..." : "Mark Closed"}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
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
