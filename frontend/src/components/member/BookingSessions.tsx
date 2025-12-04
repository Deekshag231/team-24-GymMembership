import { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle2, X } from 'lucide-react';
import api from '../../services/api';

interface Session {
  id: string;
  _id?: string;
  type: string;
  trainer: any;
  date: string;
  time: string;
  duration: number;
  spots?: number;
  maxSpots?: number;
  bookedSpots?: number;
}

export function BookingSessions() {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'booked'>('available');
  const [availableSessions, setAvailableSessions] = useState<Session[]>([]);
  const [bookedSessions, setBookedSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, [activeTab]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      if (activeTab === 'available') {
        const response = await api.getAvailableSessions();
        if (response.data?.sessions) {
          setAvailableSessions(response.data.sessions);
        }
      } else {
        const response = await api.getMyBookings();
        if (response.data?.bookings) {
          setBookedSessions(response.data.bookings);
        }
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = (session: Session) => {
    setSelectedSession(session);
    setShowBookingModal(true);
  };

  const confirmBooking = async () => {
    if (!selectedSession) return;

    try {
      const sessionId = selectedSession._id || selectedSession.id;
      await api.bookSession(sessionId);
      setShowBookingModal(false);
      setSelectedSession(null);
      alert('Session booked successfully! 🎉');
      fetchSessions();
    } catch (error: any) {
      alert('Error booking session: ' + error.message);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await api.cancelBooking(bookingId);
      alert('Booking cancelled successfully');
      fetchSessions();
    } catch (error: any) {
      alert('Error cancelling booking: ' + error.message);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="mb-2">Book Sessions</h2>
        <p className="text-blue-100">
          Reserve your spot in classes and training sessions
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl p-2 shadow-md flex gap-2">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-3 rounded-lg transition-colors ${
            activeTab === 'available'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Available Sessions
        </button>

        <button
          onClick={() => setActiveTab('booked')}
          className={`flex-1 py-3 rounded-lg transition-colors ${
            activeTab === 'booked'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          My Bookings
        </button>
      </div>

      {/* ✅ FIXED AVAILABLE SESSIONS SECTION */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading sessions...</p>
            </div>
          ) : availableSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No available sessions
            </div>
          ) : (
            availableSessions.map((session) => (
              <div
                key={session._id || session.id}
                className="bg-white rounded-xl p-5 shadow-md"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="mb-1">{session.type}</h3>
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{session.trainer?.name || 'Trainer'}</span>
                    </div>
                  </div>

                  {session.spots !== undefined && session.maxSpots && (
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        Available Spots
                      </div>
                      <div
                        className={`${
                          (session.spots || 0) < 5
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}
                      >
                        {session.spots} / {session.maxSpots}
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {formatDate(session.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{session.time}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleBookSession(session)}
                  disabled={(session.spots || 0) === 0}
                  className={`w-full py-3 rounded-lg transition-colors ${
                    (session.spots || 0) === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {(session.spots || 0) === 0
                    ? 'Fully Booked'
                    : 'Book Now'}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Booked Sessions */}
      {activeTab === 'booked' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading bookings...</div>
          ) : bookedSessions.length > 0 ? (
            bookedSessions.map((booking: any) => {
              const session = booking.session;
              if (!session) return null;

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-xl p-5 shadow-md border-l-4 border-green-500"
                >
                  <h3>{session.type}</h3>

                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    className="w-full py-3 bg-red-50 text-red-600 rounded-lg"
                  >
                    Cancel Booking
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500">
              No Bookings Yet
            </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedSession && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6">
            <h3>Confirm Booking</h3>

            <button onClick={confirmBooking}>Confirm</button>
            <button onClick={() => setShowBookingModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

