import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Plus, Filter, X, Edit2, Trash2 } from 'lucide-react';
import api from '../../services/api';

interface Session {
  _id: string;
  date: string;
  time: string;
  client?: any;
  bookings?: any[];
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export function TrainerSchedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSession, setNewSession] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    duration: 60,
    maxSpots: 1,
  });

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.getTrainerSessions();
      if (response.data?.sessions) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSession(newSession);
      setShowCreateModal(false);
      setNewSession({
        type: '',
        date: new Date().toISOString().split('T')[0],
        time: '',
        duration: 60,
        maxSpots: 1,
      });
      fetchSessions();
      alert('Session created successfully!');
    } catch (error: any) {
      alert('Error creating session: ' + error.message);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      await api.deleteSession(id);
      fetchSessions();
      alert('Session deleted successfully!');
    } catch (error: any) {
      alert('Error deleting session: ' + error.message);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === today);
  const upcomingSessions = sessions.filter(s => s.date > today).slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-500';
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-500';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-500';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20 md:pb-6">
        <div className="bg-white rounded-2xl p-12 shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="mb-2">My Schedule</h2>
          <p className="text-gray-600">Manage your training sessions and availability</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 justify-center"
        >
          <Plus className="w-5 h-5" />
          Add Session
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-3xl text-blue-600 mb-1">{todaySessions.length}</div>
          <div className="text-gray-600 text-sm">Today's Sessions</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-3xl text-green-600 mb-1">
            {sessions.filter(s => s.status === 'completed').length}
          </div>
          <div className="text-gray-600 text-sm">Completed</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-3xl text-orange-600 mb-1">
            {sessions.filter(s => s.status === 'scheduled').length}
          </div>
          <div className="text-gray-600 text-sm">Upcoming</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-3xl text-emerald-600 mb-1">{sessions.length}</div>
          <div className="text-gray-600 text-sm">Total Sessions</div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="bg-white rounded-xl p-2 shadow-md flex gap-2">
        <button
          onClick={() => setViewMode('day')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            viewMode === 'day'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Day View
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            viewMode === 'week'
              ? 'bg-emerald-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Week View
        </button>
      </div>

      {/* Day View */}
      {viewMode === 'day' && (
        <>
          {/* Today's Sessions */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3>Today's Sessions</h3>
              <span className="text-sm text-gray-600">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="space-y-3">
              {todaySessions.length > 0 ? (
                todaySessions.map((session) => (
                  <div
                    key={session._id}
                    className={`p-4 rounded-xl border-l-4 ${getStatusColor(session.status)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <span>{session.time}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteSession(session._id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">{session.type}</span>
                    </div>
                    {session.bookings && session.bookings.length > 0 && (
                      <div className="text-sm text-gray-600">
                        {session.bookings.length} {session.bookings.length === 1 ? 'booking' : 'bookings'}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No sessions scheduled for today</p>
              )}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <h3 className="mb-4">Upcoming Sessions</h3>
            <div className="space-y-3">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <div
                    key={session._id}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <span>{new Date(session.date).toLocaleDateString()}</span>
                      </div>
                      <span className="text-gray-600">{session.time}</span>
                    </div>
                    <div className="mb-1">
                      <span className="font-semibold">{session.type}</span>
                    </div>
                    {session.bookings && session.bookings.length > 0 && (
                      <div className="text-sm text-gray-600">
                        {session.bookings.length} {session.bookings.length === 1 ? 'booking' : 'bookings'}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No upcoming sessions</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3>Create New Session</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateSession} className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-2">Session Type</label>
                <input
                  type="text"
                  value={newSession.type}
                  onChange={(e) => setNewSession({ ...newSession, type: e.target.value })}
                  placeholder="e.g., Personal Training, Yoga Class"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Date</label>
                  <input
                    type="date"
                    value={newSession.date}
                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Time</label>
                  <input
                    type="time"
                    value={newSession.time}
                    onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    value={newSession.duration}
                    onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Max Spots</label>
                  <input
                    type="number"
                    value={newSession.maxSpots}
                    onChange={(e) => setNewSession({ ...newSession, maxSpots: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                    min={1}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Create Session
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
