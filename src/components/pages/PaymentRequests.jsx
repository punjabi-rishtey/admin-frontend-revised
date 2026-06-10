// components/pages/PaymentRequests.jsx
import { useCallback, useEffect, useState } from "react";
import { Check, X, Eye, Clock } from "lucide-react";
import DataTable from "../common/DataTable";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingSpinner from "../common/LoadingSpinner";
import adminApi from "../../services/api";

const PaymentRequests = () => {
  const [payments, setPayments] = useState([]);
  const [summaryCounts, setSummaryCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    expired: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [filter, setFilter] = useState("pending");
  const [notice, setNotice] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const [filteredResponse, allResponse] = await Promise.all([
        adminApi.fetchPaymentRequests({
          status: filter,
        }),
        filter === "all"
          ? Promise.resolve(null)
          : adminApi.fetchPaymentRequests({ status: "all" }),
      ]);

      const filteredPayments = filteredResponse.payments || [];
      const allPayments = filter === "all" ? filteredPayments : allResponse?.payments || [];

      setPayments(filteredPayments);
      setSummaryCounts({
        pending: allPayments.filter((payment) => payment.paymentStatus === "pending")
          .length,
        approved: allPayments.filter(
          (payment) => payment.paymentStatus === "approved"
        ).length,
        rejected: allPayments.filter(
          (payment) => payment.paymentStatus === "rejected"
        ).length,
        expired: allPayments.filter((payment) => payment.paymentStatus === "expired")
          .length,
        total: allPayments.length,
      });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to load payment requests.",
      });
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const getPaymentUserId = (payment) =>
    typeof payment?.user === "object" ? payment.user?._id : payment?.user;

  const getPaymentDurationMonths = (payment) => {
    const storedDuration = Number(payment?.membershipDurationMonths);

    if (Number.isInteger(storedDuration) && storedDuration > 0) {
      return storedDuration;
    }

    const start = new Date(payment?.createdAt);
    const end = new Date(payment?.expiresAt);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      return null;
    }

    let months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    if (months < 1) {
      return 1;
    }

    const adjustedEnd = new Date(start);
    adjustedEnd.setMonth(adjustedEnd.getMonth() + months);

    if (adjustedEnd < end) {
      months += 1;
    }

    return months;
  };

  const formatDurationMonths = (months) =>
    months ? `${months} month${months === 1 ? "" : "s"}` : "the saved duration";

  const handleApprove = async () => {
    try {
      if (!selectedPayment?._id) {
        throw new Error("This payment request is missing its ID.");
      }

      setActionLoading(true);
      await adminApi.approvePayment(selectedPayment);
      setNotice({ type: "success", message: "Payment approved." });
      setSelectedPayment(null);
      setShowApproveDialog(false);
      await fetchPayments();
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Unable to approve payment.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      const userId = getPaymentUserId(selectedPayment);
      if (!userId) {
        throw new Error("This payment is not linked to a user.");
      }

      setActionLoading(true);
      await adminApi.rejectPayment(userId);
      setNotice({ type: "success", message: "Payment rejected." });
      setSelectedPayment(null);
      setShowRejectDialog(false);
      await fetchPayments();
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Unable to reject payment.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      key: "fullName",
      label: "User",
      sortable: true,
      render: (value, payment) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{payment.phoneNumber}</div>
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Request Date",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "couponCode",
      label: "Coupon",
      render: (value) => value || "-",
    },
    {
      key: "discountAmount",
      label: "Discount",
      render: (value) => (value > 0 ? `₹${value}` : "-"),
    },
    // {
    //   key: "status",
    //   label: "Status",
    //   render: (value) => {
    //     const statusColors = {
    //       pending: "bg-yellow-100 text-yellow-800",
    //       approved: "bg-green-100 text-green-800",
    //       rejected: "bg-red-100 text-red-800",
    //     };
    //     return (
    //       <span
    //         className={`px-2 py-1 text-xs rounded-full font-medium ${
    //           statusColors[value] || "bg-gray-100 text-gray-800"
    //         }`}
    //       >
    //         {value}
    //       </span>
    //     );
    //   },
    // },
    {
      key: "expiresAt",
      label: "Expires",
      render: (value) =>
        value ? new Date(value).toLocaleDateString() : "Not set",
    },
    {
      key: "paymentStatus",
      label: "Status",
      render: (value) => {
        const statusColors = {
          pending: "bg-yellow-100 text-yellow-800",
          approved: "bg-green-100 text-green-800",
          expired: "bg-orange-100 text-orange-800",
          rejected: "bg-red-100 text-red-800",
        };
        return (
          <span
            className={`px-2 py-1 text-xs rounded-full font-medium ${
              statusColors[value?.toLowerCase()] || "bg-gray-100 text-gray-800"
            }`}
          >
            {value}
          </span>
        );
      },
    },
  ];

  const actions = (payment) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedPayment(payment);
        }}
        className="p-1 rounded hover:bg-gray-100"
        title="View Screenshot"
      >
        <Eye className="h-4 w-4 text-gray-600" />
      </button>
      {payment.paymentStatus === "pending" && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPayment(payment);
              setShowApproveDialog(true);
            }}
            disabled={actionLoading}
            className="p-1 rounded hover:bg-gray-100 disabled:cursor-wait disabled:opacity-40"
            title="Approve"
          >
            <Check className="h-4 w-4 text-green-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPayment(payment);
              setShowRejectDialog(true);
            }}
            disabled={actionLoading}
            className="p-1 rounded hover:bg-gray-100 disabled:cursor-wait disabled:opacity-40"
            title="Reject"
          >
            <X className="h-4 w-4 text-red-600" />
          </button>
        </>
      )}
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Payment Requests</h1>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-yellow-500" />
          <span className="text-sm text-gray-600">
            {filter === "all"
              ? `${summaryCounts.pending} pending approvals`
              : `${payments.length} ${filter} requests shown • ${summaryCounts.pending} pending approvals`}
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

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex space-x-2">
            {["all", "pending", "approved", "rejected", "expired"].map(
              (status) => (
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
              )
            )}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        actions={actions}
        onRowClick={setSelectedPayment}
        searchPlaceholder="Search payments..."
      />

      <ConfirmDialog
        isOpen={showApproveDialog}
        onClose={() => setShowApproveDialog(false)}
        onConfirm={handleApprove}
        title="Approve Payment"
        message={`Approve payment for ${selectedPayment?.fullName}? This will activate their profile for ${formatDurationMonths(
          getPaymentDurationMonths(selectedPayment)
        )}.`}
      />

      <ConfirmDialog
        isOpen={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        onConfirm={handleReject}
        title="Reject Payment"
        message={`Are you sure you want to reject payment for ${selectedPayment?.fullName}?`}
      />

      {selectedPayment && !showApproveDialog && !showRejectDialog && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
};

// Payment Detail Modal
const PaymentDetailModal = ({ payment, onClose }) => {
  const [screenshotFailed, setScreenshotFailed] = useState(false);
  const hasScreenshot = Boolean(payment.screenshotUrl);
  const storedDuration = Number(payment.membershipDurationMonths);
  let durationMonths = Number.isInteger(storedDuration) && storedDuration > 0
    ? storedDuration
    : null;

  if (!durationMonths) {
    const start = new Date(payment?.createdAt);
    const end = new Date(payment?.expiresAt);

    if (
      !Number.isNaN(start.getTime()) &&
      !Number.isNaN(end.getTime()) &&
      end > start
    ) {
      durationMonths =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());

      if (durationMonths < 1) {
        durationMonths = 1;
      }

      const adjustedEnd = new Date(start);
      adjustedEnd.setMonth(adjustedEnd.getMonth() + durationMonths);

      if (adjustedEnd < end) {
        durationMonths += 1;
      }
    }
  }

  const hasDuration = Number.isInteger(durationMonths) && durationMonths > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Payment Details</h2>
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
                <p className="text-gray-900">{payment.fullName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Phone
                </label>
                <p className="text-gray-900">{payment.phoneNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Request Date
                </label>
                <p className="text-gray-900">
                  {new Date(payment.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <p className="text-gray-900 capitalize">
                  {payment.paymentStatus}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Duration
                </label>
                <p className="text-gray-900">
                  {hasDuration
                    ? `${durationMonths} month${durationMonths === 1 ? "" : "s"}`
                    : "Not saved"}
                </p>
              </div>
            </div>

            {payment.couponCode && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Coupon Applied
                </label>
                <p className="text-gray-900">
                  {payment.couponCode} (₹{payment.discountAmount} off)
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500 mb-2 block">
                Payment Screenshot
              </label>
              {hasScreenshot && !screenshotFailed ? (
                <a
                  href={payment.screenshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={payment.screenshotUrl}
                    alt="Payment Screenshot"
                    onError={() => setScreenshotFailed(true)}
                    className="max-h-[420px] w-full rounded-lg border border-gray-200 object-contain"
                  />
                </a>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">
                    {hasScreenshot
                      ? "Screenshot could not be loaded in the preview."
                      : "No screenshot available."}
                  </p>
                  {hasScreenshot && (
                    <a
                      href={payment.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm font-medium text-purple-700 hover:text-purple-800"
                    >
                      Open screenshot
                    </a>
                  )}
                </div>
              )}
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

export default PaymentRequests;
