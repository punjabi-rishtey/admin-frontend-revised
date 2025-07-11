// components/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Users, Heart, DollarSign, TrendingUp, UserCheck, UserX, Clock, Award } from 'lucide-react';
import StatCard from '../common/StatCard';
import Chart from '../common/Chart';
import LoadingSpinner from '../common/LoadingSpinner';
import adminApi from '../../services/adminApi';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await adminApi.fetchAnalytics();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          trend={stats?.userGrowth}
          color="purple"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats?.activeSubscriptions || 0}
          icon={Award}
          trend={stats?.subscriptionGrowth}
          color="green"
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${(stats?.monthlyRevenue || 0).toLocaleString('en-IN')}`}
          icon={DollarSign}
          trend={stats?.revenueGrowth}
          color="blue"
        />
        <StatCard
          title="Success Stories"
          value={stats?.successStories || 0}
          icon={Heart}
          trend={stats?.storiesGrowth}
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
          title="Daily Signups (Last 30 Days)"
          data={stats?.signupData || []}
          dataKey="signups"
          xKey="date"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Average Completion</span>
                <span className="font-medium">{stats?.avgProfileCompletion || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${stats?.avgProfileCompletion || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <UserCheck className="h-5 w-5 text-green-500" />
              <span className="text-sm text-gray-600">{stats?.recentApprovals || 0} profiles approved today</span>
            </div>
            <div className="flex items-center space-x-3">
              <UserX className="h-5 w-5 text-red-500" />
              <span className="text-sm text-gray-600">{stats?.pendingProfiles || 0} profiles pending review</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-600">{stats?.expiringSubscriptions || 0} subscriptions expiring soon</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Coupon Usage</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Coupons</span>
              <span className="text-sm font-medium">{stats?.activeCoupons || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Used This Month</span>
              <span className="text-sm font-medium">{stats?.couponsUsedThisMonth || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Discount</span>
              <span className="text-sm font-medium">₹{stats?.totalDiscountAmount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;