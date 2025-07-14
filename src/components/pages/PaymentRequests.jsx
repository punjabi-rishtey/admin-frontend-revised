// components/pages/PaymentRequests.jsx
import { useState, useEffect } from "react";
import { Check, X, Eye, Clock, Calendar } from "lucide-react";
import DataTable from "../common/DataTable";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingSpinner from "../common/LoadingSpinner";
import adminApi from "../../services/api";

const PaymentRequests = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    try {
      const { payments } = await adminApi.fetchPaymentRequests({
        status: filter,
      });
      setPayments(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await adminApi.approvePayment(selectedPayment._id);
      fetchPayments();
      setShowApproveDialog(false);
    } catch (error) {
      console.error("Error approving payment:", error);
    }
  };

  const handleReject = async () => {
    try {
      await adminApi.rejectPayment(selectedPayment._id);
      fetchPayments();
      setShowRejectDialog(false);
    } catch (error) {
      console.error("Error rejecting payment:", error);
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
          rejected: "bg-red-100 text-red-800",
          canceled: "bg-red-100 text-red-800",
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
            className="p-1 rounded hover:bg-gray-100"
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
            className="p-1 rounded hover:bg-gray-100"
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
            {payments.filter((p) => p.paymentStatus === "pending").length}
            pending approvals
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          <div className="flex space-x-2">
            {["all", "pending", "approved", "rejected"].map((status) => (
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
        message={`Are you sure you want to approve payment for ${selectedPayment?.fullName}? This will activate their subscription for 1 year.`}
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
              {payment.screenshotUrl ? (
                <img
                  src={payment.screenshotUrl}
                  alt="Payment Screenshot"
                  className="w-full rounded-lg border border-gray-200"
                />
              ) : (
                <p className="text-gray-500 italic">No screenshot available</p>
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
