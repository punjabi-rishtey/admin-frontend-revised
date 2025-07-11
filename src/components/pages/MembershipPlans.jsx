// components/pages/MembershipPlans.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Award } from 'lucide-react';
import DataTable from '../common/DataTable';
import ModalForm from '../common/ModalForm';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingSpinner from '../common/LoadingSpinner';
import adminApi from '../../services/adminApi';

const MembershipPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '',
    premiumProfilesView: 'Unlimited'
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await adminApi.fetchMembershipPlans();
      setPlans(data.plans);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPlan) {
        await adminApi.updateMembershipPlan(selectedPlan._id, formData);
      } else {
        await adminApi.createMembershipPlan(formData);
      }
      fetchPlans();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteMembershipPlan(selectedPlan._id);
      fetchPlans();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting plan:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPlan(null);
    setFormData({
      name: '',
      price: '',
      duration: '',
      premiumProfilesView: 'Unlimited'
    });
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      premiumProfilesView: plan.premiumProfilesView
    });
    setShowModal(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Plan Name',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Award className="h-4 w-4 text-purple-600" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (value) => `₹${value}`
    },
    {
      key: 'duration',
      label: 'Duration',
      sortable: true,
      render: (value) => `${value} days`
    },
    {
      key: 'premiumProfilesView',
      label: 'Profile Views',
      render: (value) => value || 'Unlimited'
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
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
          <div key={plan._id} className="bg-white rounded-lg shadow p-6 border-2 border-gray-100 hover:border-purple-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <Award className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">₹{plan.price}</div>
            <div className="text-sm text-gray-600 mb-4">{plan.duration} days validity</div>
            <div className="text-sm text-gray-600">
              <strong>Profile Views:</strong> {plan.premiumProfilesView}
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

      <ModalForm
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedPlan ? 'Edit Membership Plan' : 'Add Membership Plan'}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Premium Plan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input
              type="number"
              required
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
            <input
              type="number"
              required
              min="1"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., 365"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Views</label>
            <input
              type="text"
              value={formData.premiumProfilesView}
              onChange={(e) => setFormData({ ...formData, premiumProfilesView: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., Unlimited"
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
              {selectedPlan ? 'Update' : 'Add'} Plan
            </button>
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Membership Plan"
        message={`Are you sure you want to delete the ${selectedPlan?.name} plan? This action cannot be undone.`}
      />
    </div>
  );
};

export default MembershipPlans;