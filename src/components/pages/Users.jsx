// components/pages/Users.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, RotateCcw, Filter, Download, ToggleLeft, ToggleRight } from 'lucide-react';
import DataTable from '../common/DataTable';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingSpinner from '../common/LoadingSpinner';
import adminApi from '../../services/adminApi';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [filters, setFilters] = useState({ status: 'all', includeDeleted: false });

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
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
      setShowDeleteDialog(false);
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

  const handleToggleMembership = async (user) => {
    try {
      const newStatus = user.status === 'Approved' ? 'Expired' : 'Approved';
      await adminApi.updateUserStatus(user._id, newStatus);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling membership:', error);
    }
  };

  const handleRowClick = (user) => {
    navigate(`/users/${user._id}`);
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, user) => (
        <div className="flex items-center space-x-2">
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
          {user.is_deleted && (
            <span className="px-2 py-1 text-xs rounded-full font-medium bg-red-100 text-red-800">
              Deleted
            </span>
          )}
        </div>
      )
    },
    { key: 'mobile', label: 'Mobile', sortable: true },
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
          <span
            className={`px-2 py-1 text-xs rounded-full font-medium ${
              statusColors[value] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {value}
          </span>
        );
      }
    },
    { key: 'gender', label: 'Gender', sortable: true },
    { key: 'age', label: 'Age', sortable: true },
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
          navigate(`/users/${user._id}`);
        }}
        className="p-1 rounded hover:bg-gray-100"
        title="View Details"
      >
        <Eye className="h-4 w-4 text-gray-600" />
      </button>

      {!user.is_deleted && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleMembership(user);
          }}
          className="p-1 rounded hover:bg-gray-100"
          title={
            user.status === 'Approved'
              ? 'Deactivate Membership'
              : 'Activate Membership'
          }
        >
          {user.status === 'Approved' ? (
            <ToggleRight className="h-4 w-4 text-green-600" />
          ) : (
            <ToggleLeft className="h-4 w-4 text-gray-400" />
          )}
        </button>
      )}

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
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Expired">Expired</option>
            <option value="Incomplete">Incomplete</option>
          </select>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.includeDeleted}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  includeDeleted: e.target.checked
                })
              }
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">
              Show deleted users
            </span>
          </label>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={
          filters.includeDeleted
            ? users
            : users.filter((u) => !u.is_deleted)
        }
        actions={actions}
        onRowClick={handleRowClick}
        searchPlaceholder="Search by name, email, or mobile..."
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}? This will soft delete the user and they can be restored later.`}
      />
    </div>
  );
};

export default Users;
