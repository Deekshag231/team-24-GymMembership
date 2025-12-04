import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, MessageSquare, Eye } from 'lucide-react';
import api from '../../services/api';

interface Client {
  id: string;
  name: string;
  email: string;
  goal?: string;
  progress: number;
  sessionsCompleted: number;
  totalSessions: number;
  lastSession: string | null;
  streak: number;
  trend?: 'up' | 'down' | 'stable';
}

export function ClientManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await api.getTrainerClients();
      if (response.data?.clients) {
        setClients(response.data.clients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 bg-gray-400 rounded-full"></div>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20 md:pb-6">
        <div className="bg-white rounded-2xl p-12 shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div>
        <h2 className="mb-2">Client Management</h2>
        <p className="text-gray-600">Monitor and manage your client's progress</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-3xl text-emerald-600 mb-1">{clients.length}</div>
          <div className="text-gray-600 text-sm">Total Clients</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-3xl text-blue-600 mb-1">
            {clients.filter(c => c.streak > 0).length}
          </div>
          <div className="text-gray-600 text-sm">Active</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-3xl text-orange-600 mb-1">
            {clients.filter(c => c.streak > 7).length}
          </div>
          <div className="text-gray-600 text-sm">On Streak</div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Clients List */}
      <div className="space-y-4">
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white rounded-2xl p-5 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white">
                  {client.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="mb-1">{client.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{client.email}</p>
                  <div className="flex items-center gap-2">
                    {client.goal && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                        {client.goal}
                      </span>
                    )}
                    {client.streak > 0 && (
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                        🔥 {client.streak} day streak
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getTrendIcon(client.trend)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Overall Progress</span>
                <span className="text-sm text-emerald-600">{client.progress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                  style={{ width: `${client.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Sessions</div>
                <div className="text-lg">
                  {client.sessionsCompleted} / {client.totalSessions}
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Last Session</div>
                <div className="text-lg text-sm">
                  {client.lastSession ? new Date(client.lastSession).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedClient(client)}
                className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Progress
              </button>
              <button className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Message
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-md text-center">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-400 mb-2">No Clients Found</h3>
          <p className="text-gray-500">Clients will appear here when they book sessions with you</p>
        </div>
      )}

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3>{selectedClient.name}'s Progress</h3>
                <button
                  onClick={() => setSelectedClient(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Email</div>
                    <div>{selectedClient.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Progress</div>
                    <div className="text-emerald-600">{selectedClient.progress}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Current Streak</div>
                    <div>{selectedClient.streak} days</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Sessions Completed</div>
                    <div>{selectedClient.sessionsCompleted} / {selectedClient.totalSessions}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
