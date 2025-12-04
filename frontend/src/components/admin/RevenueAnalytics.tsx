import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

export function RevenueAnalytics() {
  const [loading, setLoading] = useState(true);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [planDistribution, setPlanDistribution] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyGrowth: 0,
    averagePerMember: 0,
    projectedAnnual: 0,
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [dashboardStats, revenueData] = await Promise.all([
        api.getDashboardStats(),
        api.getRevenueAnalytics(6),
      ]);

      if (dashboardStats.data?.stats) {
        const todayRevenue = dashboardStats.data.stats.todayRevenue || 0;
        setStats({
          totalRevenue: todayRevenue,
          monthlyGrowth: 7.0, // This would be calculated from actual data
          averagePerMember: 198,
          projectedAnnual: todayRevenue * 365,
        });
      }

      if (revenueData.data?.monthlyRevenue) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        setMonthlyRevenue(
          revenueData.data.monthlyRevenue.map((r: any, index: number) => ({
            month: months[index] || `M${index + 1}`,
            revenue: r.revenue || 0,
            members: r.count || 0,
          }))
        );
      }

      if (revenueData.data?.planDistribution) {
        setPlanDistribution(revenueData.data.planDistribution);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B'];

  if (loading) {
    return (
      <div className="space-y-6 pb-20 md:pb-6">
        <div className="bg-white rounded-2xl p-12 shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h2 className="mb-2">Revenue Analytics</h2>
        <p className="text-gray-600">Track revenue, growth, and financial performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
          <DollarSign className="w-8 h-8 mb-3" />
          <div className="text-3xl mb-1">${stats.totalRevenue.toLocaleString()}</div>
          <div className="text-green-100">This Month</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
          <TrendingUp className="w-8 h-8 mb-3" />
          <div className="text-3xl mb-1">+{stats.monthlyGrowth}%</div>
          <div className="text-blue-100">Monthly Growth</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
          <DollarSign className="w-8 h-8 mb-3" />
          <div className="text-3xl mb-1">${stats.averagePerMember}</div>
          <div className="text-purple-100">Avg per Member</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
          <Calendar className="w-8 h-8 mb-3" />
          <div className="text-3xl mb-1">${(stats.projectedAnnual / 1000).toFixed(0)}K</div>
          <div className="text-orange-100">Annual Projection</div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      {monthlyRevenue.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3>Revenue Trend (6 Months)</h3>
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              <span>+29% from last 6 months</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10B981"
                strokeWidth={3}
                name="Revenue ($)"
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        {planDistribution.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="mb-6">Membership Plan Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Revenue by Plan */}
        {planDistribution.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="mb-6">Revenue by Plan Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={planDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
