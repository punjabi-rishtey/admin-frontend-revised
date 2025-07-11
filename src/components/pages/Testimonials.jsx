// components/pages/Testimonials.jsx
import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Image } from 'lucide-react';
import DataTable from '../common/DataTable';
import ModalForm from '../common/ModalForm';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingSpinner from '../common/LoadingSpinner';
import adminApi from '../../services/adminApi';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    user_name: '',
    message: '',
    image_url: '',
    groom_registration_date: '',
    bride_registration_date: '',
    marriage_date: ''
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data } = await adminApi.fetchTestimonials();
      setTestimonials(data.testimonials);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTestimonial) {
        await adminApi.updateTestimonial(selectedTestimonial._id, formData);
      } else {
        await adminApi.createTestimonial(formData);
      }
      fetchTestimonials();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteTestimonial(selectedTestimonial._id);
      fetchTestimonials();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTestimonial(null);
    setFormData({
      user_name: '',
      message: '',
      image_url: '',
      groom_registration_date: '',
      bride_registration_date: '',
      marriage_date: ''
    });
  };

  const handleEdit = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setFormData({
      user_name: testimonial.user_name,
      message: testimonial.message,
      image_url: testimonial.image_url || '',
      groom_registration_date: testimonial.groom_registration_date?.split('T')[0] || '',
      bride_registration_date: testimonial.bride_registration_date?.split('T')[0] || '',
      marriage_date: testimonial.marriage_date?.split('T')[0] || ''
    });
    setShowModal(true);
  };

  const columns = [
    {
      key: 'user_name',
      label: 'Couple Name',
      sortable: true
    },
    {
      key: 'message',
      label: 'Message',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'marriage_date',
      label: 'Marriage Date',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : 'Not specified'
    },
    {
      key: 'created_at',
      label: 'Added On',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'image_url',
      label: 'Has Image',
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    }
  ];

  const actions = (testimonial) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleEdit(testimonial);
        }}
        className="p-1 rounded hover:bg-gray-100"
      >
        <Edit2 className="h-4 w-4 text-gray-600" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTestimonial(testimonial);
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
        <h1 className="text-3xl font-bold text-gray-900">Owner's Creatives (Testimonials)</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={testimonials}
        actions={actions}
        searchPlaceholder="Search testimonials..."
      />

      <ModalForm
        isOpen={showModal}
        onClose={handleCloseModal}
        title={selectedTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Couple Name</label>
            <input
              type="text"
              required
              value={formData.user_name}
              onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Groom Registration</label>
              <input
                type="date"
                value={formData.groom_registration_date}
                onChange={(e) => setFormData({ ...formData, groom_registration_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bride Registration</label>
              <input
                type="date"
                value={formData.bride_registration_date}
                onChange={(e) => setFormData({ ...formData, bride_registration_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marriage Date</label>
            <input
              type="date"
              value={formData.marriage_date}
              onChange={(e) => setFormData({ ...formData, marriage_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              {selectedTestimonial ? 'Update' : 'Add'} Testimonial
            </button>
          </div>
        </div>
      </ModalForm>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial? This action cannot be undone."
      />
    </div>
  );
};

export default Testimonials;