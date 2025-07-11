// components/pages/Analytics.jsx
import { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Award, Calendar, PieChart } from 'lucide-react';
import Chart from '../common/Chart';
import StatCard from '../common/StatCard';
import LoadingSpinner from '../common/LoadingSpinner';
import adminApi from '../../services/adminApi';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const { data } = await adminApi.fetchAnalytics({ days: dateRange });
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics?.totalUsers || 0}
          icon={Users}
          trend={analytics?.userGrowth}
          color="purple"
        />
        <StatCard
          title="Active Subscriptions"
          value={analytics?.activeSubscriptions || 0}
          icon={Award}
          trend={analytics?.subscriptionGrowth}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${analytics?.totalRevenue || 0}`}
          icon={DollarSign}
          trend={analytics?.revenueGrowth}
          color="blue"
        />
        <StatCard
          title="Avg Profile Completion"
          value={`${analytics?.avgProfileCompletion || 0}%`}
          icon={PieChart}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart
          type="pie"
          title="User Status Distribution"
          data={analytics?.userStatusData || []}
        />
        <Chart
          type="bar"
          title="Subscription Revenue by Plan"
          data={analytics?.revenueByPlan || []}
          dataKey="revenue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart
          type="line"
          title="Daily Signups"
          data={analytics?.signupData || []}
          dataKey="signups"
          xKey="date"
        />
        <Chart
          type="line"
          title="Monthly Revenue Trend"
          data={analytics?.monthlyRevenueData || []}
          dataKey="revenue"
          xKey="month"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">User Engagement</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Daily Active Users</span>
                <span className="text-sm font-medium">{analytics?.dailyActiveUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Session Duration</span>
                <span className="text-sm font-medium">{analytics?.avgSessionDuration || '0m'}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Conversion Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Free to Paid</span>
                <span className="text-sm font-medium">{analytics?.conversionRate || 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Avg Time to Convert</span>
                <span className="text-sm font-medium">{analytics?.avgTimeToConvert || '0'} days</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Coupon Analytics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Coupons Used</span>
                <span className="text-sm font-medium">{analytics?.couponsUsed || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Discount Given</span>
                <span className="text-sm font-medium">₹{analytics?.totalDiscountGiven || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;