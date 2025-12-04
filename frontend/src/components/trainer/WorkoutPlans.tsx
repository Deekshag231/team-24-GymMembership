import { useState, useEffect } from 'react';
import { Plus, Copy, Edit2, Trash2, Eye, X } from 'lucide-react';
import api from '../../services/api';

interface WorkoutPlan {
  _id: string;
  name: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  exercises: number;
  assignedTo: string[];
  category: string;
}

export function WorkoutPlans() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'strength' | 'cardio' | 'flexibility'>('all');
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    duration: '8 weeks',
    difficulty: 'Intermediate' as 'Beginner' | 'Intermediate' | 'Advanced',
    category: 'strength' as 'strength' | 'cardio' | 'flexibility' | 'mixed',
    exercises: [{ name: '', sets: 3, reps: 10, weight: 0 }],
  });

  useEffect(() => {
    fetchPlans();
  }, [activeFilter]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await api.getAllPlans(activeFilter === 'all' ? undefined : activeFilter);
      if (response.data?.plans) {
        setPlans(response.data.plans.map((p: any) => ({
          ...p,
          exercises: p.exercises?.length || 0,
          assignedTo: p.assignedTo?.length || 0,
        })));
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createPlan(newPlan);
      setShowCreateModal(false);
      setNewPlan({
        name: '',
        description: '',
        duration: '8 weeks',
        difficulty: 'Intermediate',
        category: 'strength',
        exercises: [{ name: '', sets: 3, reps: 10, weight: 0 }],
      });
      fetchPlans();
      alert('Workout plan created successfully!');
    } catch (error: any) {
      alert('Error creating plan: ' + error.message);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await api.deletePlan(id);
      fetchPlans();
      alert('Plan deleted successfully!');
    } catch (error: any) {
      alert('Error deleting plan: ' + error.message);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'Advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-20 md:pb-6">
        <div className="bg-white rounded-2xl p-12 shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="mb-2">Workout Plans</h2>
          <p className="text-gray-600">Create and manage workout programs</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 justify-center"
        >
          <Plus className="w-5 h-5" />
          Create New Plan
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-3xl text-emerald-600 mb-1">{plans.length}</div>
          <div className="text-gray-600 text-sm">Total Plans</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-3xl text-blue-600 mb-1">
            {plans.reduce((sum, p) => sum + (p.assignedTo?.length || 0), 0)}
          </div>
          <div className="text-gray-600 text-sm">Active Assignments</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-3xl text-purple-600 mb-1">
            {plans.filter(p => p.category === 'strength').length}
          </div>
          <div className="text-gray-600 text-sm">Strength Plans</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <div className="text-3xl text-orange-600 mb-1">
            {plans.filter(p => p.category === 'cardio').length}
          </div>
          <div className="text-gray-600 text-sm">Cardio Plans</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl p-2 shadow-md flex gap-2 overflow-x-auto">
        {[
          { id: 'all' as const, label: 'All Plans' },
          { id: 'strength' as const, label: 'Strength' },
          { id: 'cardio' as const, label: 'Cardio' },
          { id: 'flexibility' as const, label: 'Flexibility' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              activeFilter === filter.id
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div key={plan._id} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="mb-2">{plan.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{plan.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(plan.difficulty)}`}>
                    {plan.difficulty}
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                    {plan.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Duration</div>
                <div className="text-sm">{plan.duration}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Exercises</div>
                <div className="text-sm">{plan.exercises}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Assigned</div>
                <div className="text-sm text-emerald-600">{plan.assignedTo?.length || 0}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => handleDeletePlan(plan._id)}
                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="bg-white rounded-2xl p-12 shadow-md text-center">
          <h3 className="text-gray-400 mb-2">No Workout Plans Yet</h3>
          <p className="text-gray-500">Create your first workout plan to get started!</p>
        </div>
      )}

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3>Create New Workout Plan</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreatePlan} className="p-6 space-y-4">
              <div>
                <label className="block text-sm mb-2">Plan Name</label>
                <input
                  type="text"
                  value={newPlan.name}
                  onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                  placeholder="e.g., Full Body Workout"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Description</label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  placeholder="Describe the workout plan..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Duration</label>
                  <select
                    value={newPlan.duration}
                    onChange={(e) => setNewPlan({ ...newPlan, duration: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option>4 weeks</option>
                    <option>6 weeks</option>
                    <option>8 weeks</option>
                    <option>12 weeks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-2">Difficulty</label>
                  <select
                    value={newPlan.difficulty}
                    onChange={(e) => setNewPlan({ ...newPlan, difficulty: e.target.value as any })}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Category</label>
                <select
                  value={newPlan.category}
                  onChange={(e) => setNewPlan({ ...newPlan, category: e.target.value as any })}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option>strength</option>
                  <option>cardio</option>
                  <option>flexibility</option>
                  <option>mixed</option>
                </select>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4">
                <h4 className="mb-3">Exercises</h4>
                {newPlan.exercises.map((ex, index) => (
                  <div key={index} className="mb-3 grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Exercise name"
                      value={ex.name}
                      onChange={(e) => {
                        const exercises = [...newPlan.exercises];
                        exercises[index].name = e.target.value;
                        setNewPlan({ ...newPlan, exercises });
                      }}
                      className="p-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Sets"
                      value={ex.sets}
                      onChange={(e) => {
                        const exercises = [...newPlan.exercises];
                        exercises[index].sets = parseInt(e.target.value);
                        setNewPlan({ ...newPlan, exercises });
                      }}
                      className="p-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Reps"
                      value={ex.reps}
                      onChange={(e) => {
                        const exercises = [...newPlan.exercises];
                        exercises[index].reps = parseInt(e.target.value);
                        setNewPlan({ ...newPlan, exercises });
                      }}
                      className="p-2 border border-gray-300 rounded-lg"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Weight"
                      value={ex.weight}
                      onChange={(e) => {
                        const exercises = [...newPlan.exercises];
                        exercises[index].weight = parseFloat(e.target.value);
                        setNewPlan({ ...newPlan, exercises });
                      }}
                      className="p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setNewPlan({ ...newPlan, exercises: [...newPlan.exercises, { name: '', sets: 3, reps: 10, weight: 0 }] })}
                  className="w-full py-3 border-2 border-dashed border-emerald-300 rounded-xl text-emerald-600 hover:bg-emerald-100 transition-colors"
                >
                  + Add Exercise
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Create Plan
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
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
