import { useEffect, useState } from "react";
import {
  Users,
  Award,
  Clock,
  Heart,
  AlertCircle,
  MessageSquare,
  Ticket,
  Star,
} from "lucide-react";
import StatCard from "../common/StatCard";
import Chart from "../common/Chart";
import LoadingSpinner from "../common/LoadingSpinner";
import adminApi from "../../services/api";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.response?.data?.error || fallback;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await adminApi.fetchAnalytics({ days: 30 });
        setStats(data);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(
          getErrorMessage(error, "Unable to load dashboard insights.")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Approved Profiles"
          value={stats?.approvedUsers || 0}
          icon={Award}
          color="green"
        />
        <StatCard
          title="Needs Review"
          value={stats?.needsReviewUsers || 0}
          icon={AlertCircle}
          color="yellow"
        />
        <StatCard
          title="Expiring Soon"
          value={stats?.expiringSubscriptions || 0}
          icon={Clock}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart
          type="pie"
          title="User Status Distribution"
          data={stats?.userStatusData || []}
        />
        <Chart
          type="line"
          title="New Profiles (Last 30 Days)"
          data={stats?.signupData || []}
          dataKey="signups"
          xKey="label"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Profile Completion
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Average Completion</span>
                <span className="font-medium">
                  {stats?.avgProfileCompletion || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${stats?.avgProfileCompletion || 0}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-gray-500">Recent Approvals</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">
                  {stats?.recentApprovals || 0}
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3">
                <div className="text-gray-500">Success Stories</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">
                  {stats?.successStories || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Support Queue
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Open Inquiries</span>
              <span className="text-sm font-medium">
                {stats?.openInquiries || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Replied</span>
              <span className="text-sm font-medium">
                {stats?.repliedInquiries || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Closed</span>
              <span className="text-sm font-medium">
                {stats?.closedInquiries || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Messages</span>
              <span className="text-sm font-medium">
                {stats?.activeMessages || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Content & Offers
          </h3>
          <div className="space-y-4">
            <SummaryRow
              icon={Heart}
              label="Testimonials"
              value={stats?.successStories || 0}
            />
            <SummaryRow
              icon={Star}
              label="Reviews"
              value={stats?.reviewCount || 0}
            />
            <SummaryRow
              icon={Ticket}
              label="Active Coupons"
              value={stats?.activeCoupons || 0}
            />
            <SummaryRow
              icon={MessageSquare}
              label="Broadcast Messages"
              value={stats?.totalMessages || 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryRow = ({ icon, label, value }) => {
  const Icon = icon;

  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-white p-2 text-purple-600 shadow-sm">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
};

export default Dashboard;
