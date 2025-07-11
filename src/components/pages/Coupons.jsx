// components/pages/Coupons.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import DataTable from '../common/DataTable';
import ModalForm from '../common/ModalForm';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingSpinner from '../common/LoadingSpinner';
import adminApi from '../../services/adminApi';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data } = await adminApi.fetchCoupons();
      setCoupons(data.coupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCoupon) {
        await adminApi.updateCoupon(selectedCoupon._id, formData);
      } else {
        await adminApi.createCoupon(formData);
      }
      fetchCoupons();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving coupon:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteCoupon(selectedCoupon._id);
      fetchCoupons();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await adminApi.updateCoupon(coupon._id, { isActive: !coupon.isActive });
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCoupon(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      isActive: true
    });
  };

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      isActive: coupon.isActive
    });
    setShowModal(true);
  };

  const columns = [
    {
      key: 'code',
      label: 'Coupon Code',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Tag className="h-4 w-4 text-purple-600" />
          <span className="font-mono font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'discountType',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span className="capitalize">{value}</span>
      )
    },
    {
      key: 'discountValue',
      label: 'Discount',
      sortable: true,
      render: (value, coupon) => (
        coupon.discountType === 'percentage' ? `${value}%` : `₹${value}`
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  const actions = (coupon) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleToggleActive(coupon);
        }}
        className="p-1 rounded hover:bg-gray-100"
        title={coupon.isActive ? 'Deactivate' : 'Activate'}
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{coupons.length}</p>
            </div>
            <Tag className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Coupons</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{coupons.filter(c => c.isActive).length}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <Tag className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Coupons</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{coupons.filter(c => !c.isActive).length}</p>
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

      <ModalForm
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedCoupon ? 'Edit Coupon' : 'Add Coupon'}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
              placeholder="e.g., SAVE20"
              disabled={!!selectedCoupon}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
            <select
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="percentage">Percentage</option>
              <option value="flat">Flat Amount</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
            </label>
            <input
              type="number"
              required
              min="0"
              max={formData.discountType === 'percentage' ? '100' : undefined}
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 100'}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
              Active
            </label>
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
              {selectedCoupon ? 'Update' : 'Add'} Coupon
            </button>
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Coupon"
        message={`Are you sure you want to delete the coupon "${selectedCoupon?.code}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default Coupons;