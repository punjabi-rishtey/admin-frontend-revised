// components/pages/Coupons.jsx
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import DataTable from "../common/DataTable";
import ModalForm from "../common/ModalForm";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingSpinner from "../common/LoadingSpinner";
import adminApi from "../../services/api";

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [statusConfirm, setStatusConfirm] = useState(null);
  const [notice, setNotice] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    isActive: true,
  });

  const fetchCoupons = useCallback(async () => {
    try {
      const {
        data: { coupons },
      } = await adminApi.fetchCoupons();
      setCoupons(coupons || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      setNotice({
        type: "error",
        message: "Could not load coupons. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const validateCouponForm = () => {
    const code = formData.code.trim().toUpperCase();
    const discountValue = Number(formData.discountValue);

    if (!code) return "Coupon code is required.";
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
      return "Coupon code must be 3-30 characters using letters, numbers, hyphen, or underscore.";
    }
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return "Discount value must be greater than 0.";
    }
    if (formData.discountType === "percentage" && discountValue > 100) {
      return "Percentage discount cannot be more than 100%.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateCouponForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = {
      code: formData.code.trim().toUpperCase(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      isActive: Boolean(formData.isActive),
    };

    setSaving(true);
    setFormError("");
    try {
      if (selectedCoupon) {
        await adminApi.updateCoupon(selectedCoupon._id, payload);
      } else {
        await adminApi.createCoupon(payload);
      }
      setNotice({
        type: "success",
        message: selectedCoupon ? "Coupon updated." : "Coupon created.",
      });
      await fetchCoupons();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving coupon:", error);
      setFormError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Could not save this coupon."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteCoupon(selectedCoupon._id);
      setNotice({
        type: "success",
        message: `${selectedCoupon.code} coupon deleted.`,
      });
      await fetchCoupons();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting coupon:", error);
      setNotice({
        type: "error",
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Could not delete this coupon.",
      });
    }
  };

  const handleToggleActive = async (coupon) => {
    setStatusConfirm({
      coupon,
      nextActive: !coupon.isActive,
      title: coupon.isActive ? "Deactivate Coupon" : "Activate Coupon",
      message: coupon.isActive
        ? `Deactivate ${coupon.code}? Users will no longer be able to apply this coupon.`
        : `Activate ${coupon.code}? Users will be able to apply this coupon again.`,
      confirmText: coupon.isActive ? "Deactivate Coupon" : "Activate Coupon",
      confirmVariant: coupon.isActive ? "danger" : "success",
    });
  };

  const handleConfirmToggleActive = async () => {
    if (!statusConfirm?.coupon) return;

    try {
      await adminApi.updateCoupon(statusConfirm.coupon._id, {
        isActive: statusConfirm.nextActive,
      });
      setNotice({
        type: "success",
        message: `${statusConfirm.coupon.code} ${
          statusConfirm.nextActive ? "activated" : "deactivated"
        }.`,
      });
      setStatusConfirm(null);
      await fetchCoupons();
    } catch (error) {
      console.error("Error toggling coupon:", error);
      setNotice({
        type: "error",
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Could not update this coupon.",
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCoupon(null);
    setFormError("");
    setFormData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      isActive: true,
    });
  };

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  const columns = [
    {
      key: "code",
      label: "Coupon Code",
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-purple-600" />
          <span className="font-mono font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "discountType",
      label: "Type",
      sortable: true,
      render: (value) => <span className="capitalize">{value}</span>,
    },
    {
      key: "discountValue",
      label: "Discount",
      sortable: true,
      render: (value, coupon) =>
        coupon.discountType === "percentage" ? `${value}%` : `₹${value}`,
    },
    {
      key: "isActive",
      label: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const actions = (coupon) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleToggleActive(coupon);
        }}
        className="p-1 rounded hover:bg-gray-100"
        title={coupon.isActive ? "Deactivate" : "Activate"}
      >
        {coupon.isActive ? (
          <ToggleRight className="h-4 w-4 text-green-600" />
        ) : (
          <ToggleLeft className="h-4 w-4 text-gray-400" />
        )}
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleEdit(coupon);
        }}
        className="p-1 rounded hover:bg-gray-100"
      >
        <Edit2 className="h-4 w-4 text-gray-600" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedCoupon(coupon);
          setShowDeleteDialog(true);
        }}
        className="p-1 rounded hover:bg-gray-100"
      >
        <Trash2 className="h-4 w-4 text-red-600" />
      </button>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Coupons</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {coupons.length}
              </p>
            </div>
            <Tag className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Coupons
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {coupons.filter((c) => c.isActive).length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Tag className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Inactive Coupons
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {coupons.filter((c) => !c.isActive).length}
              </p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <Tag className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={coupons}
        actions={actions}
        searchPlaceholder="Search coupons..."
      />

      {notice && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            notice.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {notice.message}
        </div>
      )}

      <ModalForm
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedCoupon ? "Edit Coupon" : "Add Coupon"}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coupon Code
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
              placeholder="e.g., SAVE20"
              disabled={!!selectedCoupon}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Type
            </label>
            <select
              value={formData.discountType}
              onChange={(e) =>
                setFormData({ ...formData, discountType: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="percentage">Percentage</option>
              <option value="flat">Flat Amount</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Value{" "}
              {formData.discountType === "percentage" ? "(%)" : "(₹)"}
            </label>
            <input
              type="number"
              required
              min="1"
              max={formData.discountType === "percentage" ? "100" : undefined}
              value={formData.discountValue}
              onChange={(e) =>
                setFormData({ ...formData, discountValue: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={
                formData.discountType === "percentage"
                  ? "e.g., 20"
                  : "e.g., 100"
              }
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isActive"
              className="text-sm font-medium text-gray-700"
            >
              Active
            </label>
          </div>

          {formError && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

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
              disabled={saving}
              className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {saving
                ? "Saving..."
                : `${selectedCoupon ? "Update" : "Add"} Coupon`}
            </button>
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message={`Delete coupon "${selectedCoupon?.code}"? Users will no longer be able to apply it. Deactivate instead if you may need it later.`}
        confirmText="Delete Coupon"
      />
      <ConfirmDialog
        isOpen={Boolean(statusConfirm)}
        onClose={() => setStatusConfirm(null)}
        onConfirm={handleConfirmToggleActive}
        title={statusConfirm?.title}
        message={statusConfirm?.message}
        confirmText={statusConfirm?.confirmText}
        confirmVariant={statusConfirm?.confirmVariant}
      />
    </div>
  );
};

export default Coupons;
