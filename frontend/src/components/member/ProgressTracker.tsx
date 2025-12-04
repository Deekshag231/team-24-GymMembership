import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Scale, Ruler, Percent, Plus } from 'lucide-react';
import api from '../../services/api';

export function ProgressTracker() {
  const [activeMetric, setActiveMetric] = useState<'weight' | 'strength' | 'body'>('weight');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [newProgress, setNewProgress] = useState({
    weight: '',
    bodyFat: '',
    muscle: '',
    chest: '',
    waist: '',
    arms: '',
    notes: '',
  });

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const [progressData, statsData] = await Promise.all([
        api.getMyProgress(),
        api.getProgressStats(),
      ]);

      if (progressData.data?.progress) {
        setProgress(progressData.data.progress);
      }
      if (statsData.data?.stats) {
        setStats(statsData.data.stats);
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createProgress({
        ...newProgress,
        weight: newProgress.weight ? parseFloat(newProgress.weight) : undefined,
        bodyFat: newProgress.bodyFat ? parseFloat(newProgress.bodyFat) : undefined,
        muscle: newProgress.muscle ? parseFloat(newProgress.muscle) : undefined,
        chest: newProgress.chest ? parseFloat(newProgress.chest) : undefined,
        waist: newProgress.waist ? parseFloat(newProgress.waist) : undefined,
        arms: newProgress.arms ? parseFloat(newProgress.arms) : undefined,
        date: new Date(),
      });
      setShowAddForm(false);
      setNewProgress({
        weight: '',
        bodyFat: '',
        muscle: '',
        chest: '',
        waist: '',
        arms: '',
        notes: '',
      });
      fetchProgress();
      alert('Progress entry added successfully!');
    } catch (error: any) {
      alert('Error adding progress: ' + error.message);
    }
  };

  // Transform progress data for charts
  const weightData = progress
    .filter((p) => p.weight)
    .slice(-6)
    .map((p, index) => ({
      month: new Date(p.date).toLocaleDateString('en-US', { month: 'short' }),
      weight: p.weight,
      target: stats?.weight?.start || 80,
    }));

  const bodyData = progress
    .filter((p) => p.chest || p.waist || p.arms)
    .slice(-6)
    .map((p) => ({
      month: new Date(p.date).toLocaleDateString('en-US', { month: 'short' }),
      chest: p.chest || 0,
      waist: p.waist || 0,
      arms: p.arms || 0,
    }));

  const metrics = [
    { id: 'weight' as const, label: 'Weight Loss', icon: Scale },
    { id: 'strength' as const, label: 'Strength Gain', icon: TrendingUp },
    { id: 'body' as const, label: 'Body Measurements', icon: Ruler },
  ];

  const currentStats = stats || {
    weight: { current: null, start: null, change: null },
    bodyFat: { current: null, start: null, change: null },
    muscle: { current: null, start: null, change: null },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-12 shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mb-2">Progress Tracker</h2>
            <p className="text-blue-100">Visualize your fitness journey</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Entry
          </button>
        </div>
      </div>

      {/* Add Progress Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="mb-4">Add Progress Entry</h3>
          <form onSubmit={handleAddProgress} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newProgress.weight}
                  onChange={(e) => setNewProgress({ ...newProgress, weight: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Body Fat (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newProgress.bodyFat}
                  onChange={(e) => setNewProgress({ ...newProgress, bodyFat: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Muscle (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newProgress.muscle}
                  onChange={(e) => setNewProgress({ ...newProgress, muscle: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Chest (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newProgress.chest}
                  onChange={(e) => setNewProgress({ ...newProgress, chest: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Waist (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newProgress.waist}
                  onChange={(e) => setNewProgress({ ...newProgress, waist: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Arms (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newProgress.arms}
                  onChange={(e) => setNewProgress({ ...newProgress, arms: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">Notes</label>
              <textarea
                value={newProgress.notes}
                onChange={(e) => setNewProgress({ ...newProgress, notes: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Progress
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <Scale className="w-6 h-6 text-blue-600 mb-2" />
          <div className="text-2xl mb-1">{currentStats.weight?.current || 'N/A'}</div>
          <div className="text-gray-600 text-sm mb-1">Weight (kg)</div>
          {currentStats.weight?.change !== null && (
            <div className={`flex items-center gap-1 text-sm ${
              currentStats.weight.change < 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingDown className="w-4 h-4" />
              {Math.abs(currentStats.weight.change)} kg
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <Percent className="w-6 h-6 text-orange-600 mb-2" />
          <div className="text-2xl mb-1">{currentStats.bodyFat?.current || 'N/A'}</div>
          <div className="text-gray-600 text-sm mb-1">Body Fat %</div>
          {currentStats.bodyFat?.change !== null && (
            <div className={`flex items-center gap-1 text-sm ${
              currentStats.bodyFat.change < 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingDown className="w-4 h-4" />
              {Math.abs(currentStats.bodyFat.change)}%
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md">
          <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
          <div className="text-2xl mb-1">{currentStats.muscle?.current || 'N/A'}</div>
          <div className="text-gray-600 text-sm mb-1">Muscle (kg)</div>
          {currentStats.muscle?.change !== null && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              +{currentStats.muscle.change} kg
            </div>
          )}
        </div>
      </div>

      {/* Metric Selector */}
      <div className="bg-white rounded-xl p-2 shadow-md flex gap-2">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <button
              key={metric.id}
              onClick={() => setActiveMetric(metric.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors ${
                activeMetric === metric.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline">{metric.label}</span>
            </button>
          );
        })}
      </div>

      {/* Charts */}
      {activeMetric === 'weight' && weightData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="mb-6">Weight Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3B82F6"
                strokeWidth={3}
                name="Current Weight"
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target Weight"
                dot={{ r: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeMetric === 'body' && bodyData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="mb-6">Body Measurements (cm)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bodyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="chest" stroke="#3B82F6" strokeWidth={2} name="Chest" />
              <Line type="monotone" dataKey="waist" stroke="#F59E0B" strokeWidth={2} name="Waist" />
              <Line type="monotone" dataKey="arms" stroke="#10B981" strokeWidth={2} name="Arms" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {progress.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-md text-center">
          <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-400 mb-2">No Progress Data Yet</h3>
          <p className="text-gray-500">Start tracking your progress by adding your first entry!</p>
        </div>
      )}
    </div>
  );
}
