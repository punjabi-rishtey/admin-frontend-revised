// components/pages/MembershipPlans.jsx
import { useCallback, useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Award } from "lucide-react";
import DataTable from "../common/DataTable";
import ModalForm from "../common/ModalForm";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingSpinner from "../common/LoadingSpinner";
import adminApi from "../../services/api";

const MembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [notice, setNotice] = useState(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    premiumProfilesView: "Unlimited",
  });

  const fetchPlans = useCallback(async () => {
    try {
      const { data } = await adminApi.fetchMembershipPlans();
      setPlans(data.plans || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      setNotice({
        type: "error",
        message: "Could not load membership plans. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const validatePlanForm = () => {
    const name = formData.name.trim();
    const price = Number(formData.price);
    const duration = Number(formData.duration);

    if (!name) return "Plan name is required.";
    if (!Number.isFinite(price) || price < 0) {
      return "Price must be 0 or more.";
    }
    if (!Number.isInteger(duration) || duration <= 0) {
      return "Duration must be a whole number of months.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validatePlanForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      duration: Number(formData.duration),
      premiumProfilesView:
        String(formData.premiumProfilesView || "").trim() || "Unlimited",
    };

    setSaving(true);
    setFormError("");
    try {
      if (selectedPlan) {
        await adminApi.updateMembershipPlan(selectedPlan._id, payload);
      } else {
        await adminApi.createMembershipPlan(payload);
      }
      setNotice({
        type: "success",
        message: selectedPlan
          ? "Membership plan updated."
          : "Membership plan created.",
      });
      await fetchPlans();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving plan:", error);
      setFormError(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Could not save this membership plan."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteMembershipPlan(selectedPlan._id);
      setNotice({
        type: "success",
        message: `${selectedPlan.name} plan deleted.`,
      });
      await fetchPlans();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting plan:", error);
      setNotice({
        type: "error",
        message:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Could not delete this membership plan.",
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
    setFormError("");
    setFormData({
      name: "",
      price: "",
      duration: "",
      premiumProfilesView: "Unlimited",
    });
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      premiumProfilesView: plan.premiumProfilesView || "Unlimited",
    });
    setShowModal(true);
  };

  const columns = [
    {
      key: "name",
      label: "Plan Name",
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Award className="h-4 w-4 text-purple-600" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (value) => `₹${value}`,
    },
    {
      key: "duration",
      label: "Duration",
      sortable: true,
      render: (value) => `${value} month${Number(value) === 1 ? "" : "s"}`,
    },
    {
      key: "premiumProfilesView",
      label: "Profile Views",
      render: (value) => value || "Unlimited",
    },
    // {
    //   key: "created_at",
    //   label: "Created",
    //   sortable: true,
    //   render: (value) => new Date(value).toLocaleDateString(),
    // },
  ];

  const actions = (plan) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleEdit(plan);
        }}
        className="p-1 rounded hover:bg-gray-100"
      >
        <Edit2 className="h-4 w-4 text-gray-600" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedPlan(plan);
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
        <h1 className="text-3xl font-bold text-gray-900">Membership Plans</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Plan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className="bg-white rounded-lg shadow p-6 border-2 border-gray-100 hover:border-purple-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ₹{plan.price}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              {plan.duration} month{Number(plan.duration) === 1 ? "" : "s"} validity
            </div>
            <div className="text-sm text-gray-600">
              {/* <strong>Profile Views:</strong> {plan.premiumProfilesView} */}
            </div>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={plans}
        actions={actions}
        searchPlaceholder="Search plans..."
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
        title={selectedPlan ? "Edit Membership Plan" : "Add Membership Plan"}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Premium Plan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹)
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (months)
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              step="1"
              placeholder="e.g., 6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Views
            </label>
            <input
              type="text"
              value={formData.premiumProfilesView}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  premiumProfilesView: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Unlimited"
            />
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
                : `${selectedPlan ? "Update" : "Add"} Plan`}
            </button>
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Membership Plan"
        message={`Delete the ${selectedPlan?.name} plan? People will no longer be able to select it for new payments. Existing users are not automatically changed.`}
        confirmText="Delete Plan"
      />
    </div>
  );
};

export default MembershipPlans;
