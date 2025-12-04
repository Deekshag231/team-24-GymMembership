import { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

export function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeMembers: 0,
    expiringThisMonth: 0,
    todayRevenue: 0,
    todayCheckIns: 0
  });

  const [revenueData, setRevenueData] = useState([
    { day: 'Mon', revenue: 0 },
    { day: 'Tue', revenue: 0 },
    { day: 'Wed', revenue: 0 },
    { day: 'Thu', revenue: 0 },
    { day: 'Fri', revenue: 0 },
    { day: 'Sat', revenue: 0 },
    { day: 'Sun', revenue: 0 }
  ]);
  const [checkInData] = useState([
    { time: '6AM', count: 15 },
    { time: '8AM', count: 28 },
    { time: '10AM', count: 18 },
    { time: '12PM', count: 22 },
    { time: '2PM', count: 12 },
    { time: '4PM', count: 16 },
    { time: '6PM', count: 32 },
    { time: '8PM', count: 24 }
  ]);
  const [expiringMembers, setExpiringMembers] = useState<any[]>([]);
  const [recentActivities] = useState([
    { id: 1, type: 'new_member', message: 'Alex Morgan joined with Premium Annual plan', time: '2 hours ago' },
    { id: 2, type: 'renewal', message: 'David Chen renewed Monthly membership', time: '3 hours ago' },
    { id: 3, type: 'payment', message: 'Payment received from Lisa Johnson - $99', time: '5 hours ago' },
    { id: 4, type: 'check_in', message: `${stats.todayCheckIns} members checked in today`, time: '6 hours ago' }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardStats, membersResponse] = await Promise.all([
          api.getDashboardStats(),
          api.getAllMembers('all')
        ]);

        if (dashboardStats.data?.stats) {
          setStats(dashboardStats.data.stats);
        }

        if (membersResponse.data?.members) {
          const members = membersResponse.data.members;
          const expiring = members
            .filter((m: any) => m.status === 'active' && m.expiryDate)
            .map((m: any) => {
              const endDate = new Date(m.expiryDate);
              const today = new Date();
              const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
              return {
                id: m.id,
                name: m.name,
                plan: m.plan,
                expiryDate: m.expiryDate,
                daysLeft
              };
            })
            .filter((m: any) => m.daysLeft > 0 && m.daysLeft <= 30)
            .sort((a: any, b: any) => a.daysLeft - b.daysLeft)
            .slice(0, 4);
          setExpiringMembers(expiring);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pb-20 md:pb-6">
        <div className="bg-white rounded-2xl p-12 shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h2 className="mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8" />
            <TrendingUp className="w-5 h-5 text-blue-200" />
          </div>
          <div className="text-3xl mb-1">{stats.activeMembers}</div>
          <div className="text-blue-100">Active Members</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="w-8 h-8" />
            <Clock className="w-5 h-5 text-orange-200" />
          </div>
          <div className="text-3xl mb-1">{stats.expiringThisMonth}</div>
          <div className="text-orange-100">Expiring Soon</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8" />
            <TrendingUp className="w-5 h-5 text-green-200" />
          </div>
          <div className="text-3xl mb-1">${stats.todayRevenue}</div>
          <div className="text-green-100">Today's Revenue</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <Activity className="w-8 h-8" />
            <CheckCircle2 className="w-5 h-5 text-purple-200" />
          </div>
          <div className="text-3xl mb-1">{stats.todayCheckIns}</div>
          <div className="text-purple-100">Today's Check-ins</div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="mb-4">Weekly Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Check-in Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="mb-4">Today's Check-in Pattern</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={checkInData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expiring Memberships */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3>Expiring Memberships</h3>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
            {expiringMembers.length} Members
          </span>
        </div>
        <div className="space-y-3">
          {expiringMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div>
                <div className="mb-1">{member.name}</div>
                <div className="text-sm text-gray-600">{member.plan} Plan</div>
              </div>
              <div className="text-right">
                <div className={`text-sm mb-1 ${
                  member.daysLeft <= 3 ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {member.daysLeft} {member.daysLeft === 1 ? 'day' : 'days'} left
                </div>
                <div className="text-xs text-gray-500">{member.expiryDate}</div>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors">
          Send Renewal Reminders
        </button>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="mb-4">Recent Activities</h3>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div className="flex-1">
                <p className="text-gray-700">{activity.message}</p>
                <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
