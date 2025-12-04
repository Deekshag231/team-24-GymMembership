import { useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, Star, Clock, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export function TrainerHome() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeClients: 0,
    sessionsToday: 0,
    completedThisWeek: 0,
    rating: 0,
  });
  const [sessions, setSessions] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsResponse, clientsResponse] = await Promise.all([
        api.getTrainerSessions(),
        api.getTrainerClients(),
      ]);

      if (sessionsResponse.data?.sessions) {
        const allSessions = sessionsResponse.data.sessions;
        setSessions(allSessions);
        
        const today = new Date().toISOString().split('T')[0];
        const todaySessions = allSessions.filter((s: any) => s.date === today);
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const completedThisWeek = allSessions.filter(
          (s: any) => s.status === 'completed' && new Date(s.date) >= weekStart
        ).length;

        setStats({
          activeClients: clientsResponse.data?.clients?.length || 0,
          sessionsToday: todaySessions.length,
          completedThisWeek,
          rating: 4.8, // This would come from reviews/ratings if implemented
        });
      }

      if (clientsResponse.data?.clients) {
        setClients(clientsResponse.data.clients);
      }
    } catch (error) {
      console.error('Error fetching trainer data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20 md:pb-6">
        <div className="bg-white rounded-2xl p-12 shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const todaySessions = sessions.filter((s: any) => {
    const today = new Date().toISOString().split('T')[0];
    return s.date === today;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="mb-2">Welcome back, {user?.name || 'Trainer'}! 👋</h2>
        <p className="text-emerald-100">You have {stats.sessionsToday} sessions scheduled today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
          <Users className="w-8 h-8 mb-3" />
          <div className="text-3xl mb-1">{stats.activeClients}</div>
          <div className="text-blue-100">Active Clients</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg">
          <Calendar className="w-8 h-8 mb-3" />
          <div className="text-3xl mb-1">{stats.sessionsToday}</div>
          <div className="text-emerald-100">Sessions Today</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
          <CheckCircle2 className="w-8 h-8 mb-3" />
          <div className="text-3xl mb-1">{stats.completedThisWeek}</div>
          <div className="text-purple-100">Completed (Week)</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-5 text-white shadow-lg">
          <Star className="w-8 h-8 mb-3" />
          <div className="text-3xl mb-1">{stats.rating}</div>
          <div className="text-yellow-100">Average Rating</div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="mb-4">Today's Schedule</h3>
        <div className="space-y-3">
          {todaySessions.length > 0 ? (
            todaySessions.map((session: any) => (
              <div
                key={session._id}
                className={`p-4 rounded-xl flex items-center justify-between ${
                  session.status === 'completed'
                    ? 'bg-green-50 border-l-4 border-green-500'
                    : 'bg-blue-50 border-l-4 border-blue-500'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <Clock className={`w-5 h-5 mx-auto mb-1 ${
                      session.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                    }`} />
                    <div className="text-sm">{session.time}</div>
                  </div>
                  <div>
                    <div className="mb-1">{session.type}</div>
                    {session.bookings && session.bookings.length > 0 && (
                      <div className="text-sm text-gray-600">
                        {session.bookings.length} {session.bookings.length === 1 ? 'booking' : 'bookings'}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  {session.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Completed
                    </span>
                  ) : (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Start Session
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No sessions scheduled for today</p>
          )}
        </div>
      </div>

      {/* Recent Client Achievements */}
      {clients.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="mb-4">Your Clients 🏆</h3>
          <div className="space-y-3">
            {clients.slice(0, 3).map((client: any) => (
              <div
                key={client.id}
                className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-1 font-semibold">{client.name}</div>
                    <div className="text-sm text-gray-600">
                      {client.sessionsCompleted} sessions completed
                      {client.streak > 0 && ` • ${client.streak} day streak`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ClipboardList(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <path d="M12 11h4"></path>
      <path d="M12 16h4"></path>
      <path d="M8 11h.01"></path>
      <path d="M8 16h.01"></path>
    </svg>
  );
}
