import { useEffect, useState } from "react";
import {
  Users,
  Award,
  AlertCircle,
  Clock,
  PieChart,
  Ticket,
  MessageSquare,
  Mail,
  Heart,
  Star,
} from "lucide-react";
import Chart from "../common/Chart";
import StatCard from "../common/StatCard";
import LoadingSpinner from "../common/LoadingSpinner";
import adminApi from "../../services/api";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.response?.data?.error || fallback;

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const { data } = await adminApi.fetchAnalytics({ days: dateRange });
        setAnalytics(data);
        setErrorMessage("");
      } catch (error) {
        setErrorMessage(
          getErrorMessage(error, "Unable to load analytics right now.")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dateRange]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <select
          value={dateRange}
          onChange={(event) => setDateRange(event.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics?.totalUsers || 0}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Approved Profiles"
          value={analytics?.approvedUsers || 0}
          icon={Award}
          color="green"
        />
        <StatCard
          title="Needs Review"
          value={analytics?.needsReviewUsers || 0}
          icon={AlertCircle}
          color="yellow"
        />
        <StatCard
          title="Expiring Soon"
          value={analytics?.expiringSubscriptions || 0}
          icon={Clock}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Avg Completion"
          value={`${analytics?.avgProfileCompletion || 0}%`}
          icon={PieChart}
          color="blue"
        />
        <StatCard
          title="Active Coupons"
          value={analytics?.activeCoupons || 0}
          icon={Ticket}
          color="green"
        />
        <StatCard
          title="Open Inquiries"
          value={analytics?.openInquiries || 0}
          icon={Mail}
          color="yellow"
        />
        <StatCard
          title="Active Messages"
          value={analytics?.activeMessages || 0}
          icon={MessageSquare}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart
          type="pie"
          title="User Status Distribution"
          data={analytics?.userStatusData || []}
        />
        <Chart
          type="line"
          title={`New Profiles (Last ${analytics?.days || dateRange} Days)`}
          data={analytics?.signupData || []}
          dataKey="signups"
          xKey="label"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Support Overview
          </h3>
          <div className="space-y-3">
            <MetricRow label="Open Inquiries" value={analytics?.openInquiries || 0} />
            <MetricRow
              label="Replied Inquiries"
              value={analytics?.repliedInquiries || 0}
            />
            <MetricRow
              label="Closed Inquiries"
              value={analytics?.closedInquiries || 0}
            />
            <MetricRow
              label="Broadcast Messages"
              value={analytics?.totalMessages || 0}
            />
            <MetricRow
              label="Recent Approvals"
              value={analytics?.recentApprovals || 0}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Offers & Content
          </h3>
          <div className="space-y-4">
            <SummaryBadge
              icon={Heart}
              label="Testimonials"
              value={analytics?.successStories || 0}
            />
            <SummaryBadge
              icon={Star}
              label="Reviews"
              value={analytics?.reviewCount || 0}
            />
            <SummaryBadge
              icon={Ticket}
              label="Coupon Uses"
              value={analytics?.couponUsageCount || 0}
            />
            <SummaryBadge
              icon={Ticket}
              label="Total Discount Given"
              value={`₹${(analytics?.totalDiscountAmount || 0).toLocaleString(
                "en-IN"
              )}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricRow = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
    <span className="text-sm text-gray-700">{label}</span>
    <span className="text-sm font-semibold text-gray-900">{value}</span>
  </div>
);

const SummaryBadge = ({ icon, label, value }) => {
  const Icon = icon;

  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
};

export default Analytics;
