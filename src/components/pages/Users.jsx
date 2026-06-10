// components/pages/Users.jsx
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Trash2,
  RotateCcw,
  Filter,
  ToggleLeft,
  ToggleRight,
  UserPlus,
} from "lucide-react";
import DataTable from "../common/DataTable";
import ConfirmDialog from "../common/ConfirmDialog";
import LoadingSpinner from "../common/LoadingSpinner";
import ApproveModal from "../common/ApproveModal";
import adminApi from "../../services/api";

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [userToApprove, setUserToApprove] = useState(null);
  const [statusConfirm, setStatusConfirm] = useState(null);
  const [notice, setNotice] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
    includeDeleted: false,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { users } = await adminApi.fetchUsers(filters);
      // setUsers(users);
      const usersWithFlatDate = users.map((u) => ({
        ...u,
        register_date: u?.metadata?.register_date || null,
      }));
      setUsers(usersWithFlatDate);
    } catch (error) {
      console.error("Error fetching users:", error);
      setNotice({
        type: "error",
        message: "Could not load users. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    try {
      await adminApi.deleteUser(userToDelete._id);
      setShowDeleteDialog(false);
      setNotice({
        type: "success",
        message: `${userToDelete.name} was deactivated. You can restore them from deleted users.`,
      });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setNotice({
        type: "error",
        message:
          error.response?.data?.message ||
          "Could not deactivate this user. Please try again.",
      });
    }
  };

  const handleRestore = async (user) => {
    setStatusConfirm({
      type: "restore",
      user,
      title: "Restore User",
      message: `Restore ${user.name}? Their previous status will be restored where possible.`,
      confirmText: "Restore User",
      confirmVariant: "success",
    });
  };

  const handleConfirmStatusAction = async () => {
    if (!statusConfirm?.user) return;

    try {
      if (statusConfirm.type === "restore") {
        await adminApi.restoreUser(statusConfirm.user._id);
        setNotice({
          type: "success",
          message: `${statusConfirm.user.name} was restored.`,
        });
      }

      if (statusConfirm.type === "expire") {
        await adminApi.updateUserStatus(statusConfirm.user._id, "Expired");
        setNotice({
          type: "success",
          message: `${statusConfirm.user.name}'s membership was expired.`,
        });
      }

      setStatusConfirm(null);
      await fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      setNotice({
        type: "error",
        message:
          error.response?.data?.message ||
          "Could not update this user. Please try again.",
      });
    }
  };

  const handleToggleMembership = (user) => {
    if (user.status === "Approved") {
      setStatusConfirm({
        type: "expire",
        user,
        title: "Expire Membership",
        message: `Expire ${user.name}'s membership? They will no longer have active membership access.`,
        confirmText: "Expire Membership",
        confirmVariant: "danger",
      });
    } else {
      setUserToApprove(user);
      setApproveModalOpen(true);
    }
  };

  const handleRowClick = (user) => {
    navigate(`/users/${user._id}`);
  };

  const columns = [
    {
      key: "name",
      label: "Name",
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
      ),
    },
    { key: "mobile", label: "Mobile", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => {
        const statusColors = {
          Approved: "bg-green-100 text-green-800",
          Pending: "bg-yellow-100 text-yellow-800",
          Expired: "bg-red-100 text-red-800",
          Incomplete: "bg-gray-100 text-gray-800",
          Unapproved: "bg-red-100 text-red-800",
          Canceled: "bg-gray-100 text-gray-800",
        };
        return (
          <span
            className={`px-2 py-1 text-xs rounded-full font-medium ${
              statusColors[value] || "bg-gray-100 text-gray-800"
            }`}
          >
            {value}
          </span>
        );
      },
    },
    { key: "gender", label: "Gender", sortable: true },
    { key: "age", label: "Age", sortable: true },
    // {
    //   key: "metadata.register_date",
    //   label: "Registered",
    //   sortable: true,
    //   render: (_, user) => {
    //     const date = user?.metadata?.register_date;
    //     if (!date) return "-";
    //     return new Date(date).toLocaleDateString("en-IN", {
    //       year: "numeric",
    //       month: "short",
    //       day: "numeric",
    //     });
    //   },
    // },
    {
      key: "register_date",
      label: "Registered",
      sortable: true,
      render: (_, user) => {
        const date = user?.register_date;
        if (!date) return "-";
        return new Date(date).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
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
            user.status === "Approved"
              ? "Expire Membership"
              : "Approve Membership"
          }
        >
          {user.status === "Approved" ? (
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
            handleRestore(user);
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
        {/* <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button> */}
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
            <option value="Unapproved">Unapproved</option>
            <option value="Canceled">Canceled</option>
          </select>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.includeDeleted}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  includeDeleted: e.target.checked,
                })
              }
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Show deleted users</span>
          </label>
          <button
            type="button"
            onClick={() => navigate("/add-user")}
            className="ml-auto mr-2 flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 "
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Users</span>
          </button>
        </div>
      </div>

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

      <DataTable
        columns={columns}
        data={
          filters.includeDeleted ? users : users.filter((u) => !u.is_deleted)
        }
        actions={actions}
        onRowClick={handleRowClick}
        searchPlaceholder="Search by name, email, or mobile..."
        defaultSort={{ key: 'register_date', direction: 'desc' }}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Deactivate ${userToDelete?.name}? They will be hidden from normal user lists, their membership will be canceled, and they can be restored later.`}
        confirmText="Deactivate User"
      />
      <ConfirmDialog
        isOpen={Boolean(statusConfirm)}
        onClose={() => setStatusConfirm(null)}
        onConfirm={handleConfirmStatusAction}
        title={statusConfirm?.title}
        message={statusConfirm?.message}
        confirmText={statusConfirm?.confirmText}
        confirmVariant={statusConfirm?.confirmVariant}
      />
      <ApproveModal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        userName={userToApprove?.name}
        onConfirm={async (startDateIso, expiryMonths) => {
          await adminApi.approveUserWithDates(
            userToApprove._id,
            startDateIso,
            expiryMonths
          );
          setNotice({
            type: "success",
            message: `${userToApprove.name}'s membership was approved.`,
          });
          setApproveModalOpen(false);
          setUserToApprove(null);
          await fetchUsers();
        }}
      />
    </div>
  );
};

export default Users;
