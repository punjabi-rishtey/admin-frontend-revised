import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Clock,
  Check,
} from "lucide-react";
import DataTable from "../common/DataTable";
import LoadingSpinner from "../common/LoadingSpinner";
import adminApi from "../../services/api";

const Requests = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { users } = await adminApi.fetchUsers({ status: "Unapproved" });
      const usersWithFlatDate = users.map((u) => ({
        ...u,
        register_date: u?.metadata?.register_date || null,
      }));
      const unapprovedUsers = usersWithFlatDate.filter((user) => !user.is_deleted);
      setUsers(unapprovedUsers);
    } catch (error) {
      console.error("Error fetching unapproved users:", error);
      setNotice({
        type: "error",
        message: "Could not load registration requests. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const handleApprove = async (user) => {
    setApprovingId(user._id);
    setNotice(null);
    try {
      await adminApi.updateUserToPending(user._id);
      setNotice({
        type: "success",
        message: `${user.name || "User"} moved to Pending review.`,
      });
      await fetchPendingUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      setNotice({
        type: "error",
        message:
          error.response?.data?.message ||
          "Could not move this user to Pending. Please try again.",
      });
    } finally {
      setApprovingId(null);
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
        </div>
      ),
    },
    { key: "mobile", label: "Mobile", sortable: true },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (value) => (
        <span className="px-2 py-1 text-xs rounded-full font-medium bg-red-100 text-red-800">
          {value}
        </span>
      ),
    },
    { key: "gender", label: "Gender", sortable: true },
    { key: "age", label: "Age", sortable: true },
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
        type="button"
        disabled={approvingId === user._id}
        onClick={(e) => {
          e.stopPropagation();
          handleApprove(user);
        }}
        className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        title="Move user to Pending review"
      >
        <Check className="h-4 w-4" />
        <span>{approvingId === user._id ? "Moving..." : "Move to Pending"}</span>
      </button>
    </div>
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Clock className="h-8 w-8 text-yellow-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Requests</h1>
            <p className="text-gray-600">
              New registrations waiting for review
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
          <User className="h-4 w-4" />
          <span className="font-medium">{users.length} unapproved</span>
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

      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No unapproved users
          </h3>
          <p className="text-gray-500">
            All new registrations have been moved forward or processed.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          actions={actions}
          onRowClick={handleRowClick}
          searchPlaceholder="Search unapproved users by name, email, or mobile..."
        />
      )}

    </div>
  );
};

export default Requests;
