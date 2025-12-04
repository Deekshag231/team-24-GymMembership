import { useState, useEffect } from 'react';
import { 
  QrCode, 
  Calendar, 
  CreditCard, 
  Flame, 
  Trophy,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { QRCheckIn } from './QRCheckIn';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export function MemberHome() {
  const { user } = useAuth();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [membershipData, setMembershipData] = useState({
    plan: 'N/A',
    startDate: null as string | null,
    endDate: null as string | null,
    daysRemaining: 0,
    status: 'expired'
  });
  const [todayStats, setTodayStats] = useState({
    streak: 0,
    workoutsThisWeek: 0,
    caloriesBurned: 0,
    minutesExercised: 0
  });
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homeData, stats] = await Promise.all([
          api.getMemberHomeData(),
          api.getWorkoutStats()
        ]);

        if (homeData.data) {
          setMembershipData(homeData.data.membership || membershipData);
          setTodayStats(homeData.data.todayStats || todayStats);
          setUpcomingSessions(homeData.data.upcomingSessions || []);
        }

        if (stats.data?.stats) {
          setTodayStats(prev => ({
            ...prev,
            workoutsThisWeek: stats.data.stats.workoutsThisWeek || 0,
            streak: stats.data.stats.streak || 0
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const recentAchievements = [
    { id: 1, title: '7 Day Streak', icon: Flame, color: 'text-orange-500' },
    { id: 2, title: '50 Workouts', icon: Trophy, color: 'text-yellow-500' },
    { id: 3, title: 'Early Bird', icon: CheckCircle2, color: 'text-green-500' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-md text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="mb-2">Welcome back, {user?.name || 'Member'}! 👋</h2>
        <p className="text-blue-100">Ready to crush your workout today?</p>
      </div>

      {/* QR Check-in Card */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="mb-1">Quick Check-in</h3>
            <p className="text-gray-600">Scan to mark your attendance</p>
          </div>
          <QrCode className="w-12 h-12 text-blue-600" />
        </div>
        <button
          onClick={() => setShowQRScanner(true)}
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Scan QR Code
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-md">
          <Flame className="w-8 h-8 mb-2" />
          <div className="text-3xl mb-1">{todayStats.streak}</div>
          <div className="text-orange-100 text-sm">Day Streak 🔥</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-md">
          <Trophy className="w-8 h-8 mb-2" />
          <div className="text-3xl mb-1">{todayStats.workoutsThisWeek}</div>
          <div className="text-green-100 text-sm">Workouts This Week</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-md">
          <Flame className="w-8 h-8 mb-2" />
          <div className="text-3xl mb-1">{todayStats.caloriesBurned}</div>
          <div className="text-purple-100 text-sm">Calories Burned</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-md">
          <Calendar className="w-8 h-8 mb-2" />
          <div className="text-3xl mb-1">{todayStats.minutesExercised}</div>
          <div className="text-blue-100 text-sm">Minutes Exercised</div>
        </div>
      </div>

      {/* Membership Status */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-6 h-6 text-blue-600" />
          <h3>Membership Status</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Plan</span>
            <span className="text-blue-600">{membershipData.plan}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Active
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Valid Until</span>
            <span>{membershipData.endDate ? new Date(membershipData.endDate).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-700 text-sm">
              <strong>{membershipData.daysRemaining} days</strong> remaining in your membership
            </p>
          </div>
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="mb-4">Recent Achievements</h3>
        <div className="grid grid-cols-3 gap-3">
          {recentAchievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div
                key={achievement.id}
                className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl"
              >
                <Icon className={`w-8 h-8 ${achievement.color}`} />
                <span className="text-sm text-center text-gray-700">{achievement.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="mb-4">Upcoming Sessions</h3>
        <div className="space-y-3">
          {upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div>
                  <div className="mb-1">{session.title}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(session.date).toLocaleDateString()} at {session.time}
                  </div>
                  <div className="text-sm text-blue-600">with {session.trainer}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming sessions</p>
          )}
        </div>
      </div>

      {/* QR Check-in Modal */}
      {showQRScanner && <QRCheckIn onClose={() => setShowQRScanner(false)} />}
    </div>
  );
}
