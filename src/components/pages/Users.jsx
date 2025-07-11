// components/pages/Users.jsx
import { useState, useEffect } from 'react';
import { Eye, Trash2, RotateCcw, Filter, Download } from 'lucide-react';
import DataTable from '../common/DataTable';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingSpinner from '../common/LoadingSpinner';
import adminApi from '../../services/adminApi';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [filters, setFilters] = useState({ status: 'all' });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const { data } = await adminApi.fetchUsers(filters);
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminApi.deleteUser(userToDelete._id);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleRestore = async (userId) => {
    try {
      await adminApi.restoreUser(userId);
      fetchUsers();
    } catch (error) {
      console.error('Error restoring user:', error);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, user) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      )
    },
    {
      key: 'mobile',
      label: 'Mobile',
      sortable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusColors = {
          Approved: 'bg-green-100 text-green-800',
          Pending: 'bg-yellow-100 text-yellow-800',
          Expired: 'bg-red-100 text-red-800',
          Incomplete: 'bg-gray-100 text-gray-800'
        };
        return (
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'gender',
      label: 'Gender',
      sortable: true
    },
    {
      key: 'age',
      label: 'Age',
      sortable: true
    },
    {
      key: 'metadata.register_date',
      label: 'Registered',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const actions = (user) => (
    <div className="flex items-center space-x-2">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedUser(user);
        }}
        className="p-1 rounded hover:bg-gray-100"
        title="View Details"
      >
        <Eye className="h-4 w-4 text-gray-600" />
      </button>
      {user.is_deleted ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRestore(user._id);
          }}
          className="p-1 rounded hover:bg-gray-100"
          title="Restore User"
        >
          <RotateCcw className="h-4 w-4 text-green-600" />
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setUserToDelete(user);
            setShowDeleteDialog(true);
          }}
          className="p-1 rounded hover:bg-gray-100"
          title="Delete User"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </button>
      )}
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Expired">Expired</option>
            <option value="Incomplete">Incomplete</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        actions={actions}
        onRowClick={setSelectedUser}
        searchPlaceholder="Search by name, email, or mobile..."
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}? This action can be reversed.`}
      />

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};

// User Detail Modal Component
const UserDetailModal = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg max-w-3xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-gray-900">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Gender</label>
              <p className="text-gray-900">{user.gender}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Mobile</label>
              <p className="text-gray-900">{user.mobile}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Date of Birth</label>
              <p className="text-gray-900">{new Date(user.dob).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Age</label>
              <p className="text-gray-900">{user.age} years</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Height</label>
              <p className="text-gray-900">{user.height || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Religion</label>
              <p className="text-gray-900">{user.religion}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Caste</label>
              <p className="text-gray-900">{user.caste}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Marital Status</label>
              <p className="text-gray-900">{user.marital_status}</p>
            </div>
          </div>

          {user.location && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Location</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p>{user.location.address}</p>
                <p>{user.location.city} - {user.location.pincode}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
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
  );
};

export default Users;