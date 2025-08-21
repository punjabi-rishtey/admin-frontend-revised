import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Clock,
  Check,
} from "lucide-react";
import DataTable from "../common/DataTable";
import LoadingSpinner from "../common/LoadingSpinner";
import ApproveModal from "../common/ApproveModal";
import adminApi from "../../services/api";

const Requests = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const { users } = await adminApi.fetchUsers({ status: "all" });
      const usersWithFlatDate = users.map((u) => ({
        ...u,
        register_date: u?.metadata?.register_date || null,
      }));
      const unapprovedUsers = usersWithFlatDate.filter(user => user.status === "Unapproved");
      setUsers(unapprovedUsers);
    } catch (error) {
      console.error("Error fetching unapproved users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (user) => {
    try {
      await adminApi.updateUserToPending(user._id);
      fetchPendingUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("Failed to approve user");
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
        onClick={(e) => {
          e.stopPropagation();
          handleApprove(user);
        }}
        className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
        title="Approve User"
      >
        <Check className="h-4 w-4" />
        <span>Approve</span>
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
            <p className="text-gray-600">Users awaiting approval</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
          <User className="h-4 w-4" />
          <span className="font-medium">{users.length} unapproved</span>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No unapproved users
          </h3>
          <p className="text-gray-500">
            All users have been approved or processed.
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