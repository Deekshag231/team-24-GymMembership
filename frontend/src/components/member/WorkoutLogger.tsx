import { useState } from 'react';
import { Plus, Trash2, Save, Dumbbell, Clock, TrendingUp } from 'lucide-react';
import api from '../../services/api';

interface Exercise {
  id?: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  notes?: string;
}

export function WorkoutLogger() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: 3,
    reps: 10,
    weight: 0
  });

  const popularExercises = [
    'Bench Press',
    'Squats',
    'Deadlift',
    'Shoulder Press',
    'Barbell Row',
    'Pull-ups',
    'Lunges',
    'Bicep Curls'
  ];

  const addExercise = () => {
    if (newExercise.name) {
      const exercise: Exercise = {
        id: Date.now().toString(),
        ...newExercise
      };
      setExercises([...exercises, exercise]);
      setNewExercise({ name: '', sets: 3, reps: 10, weight: 0 });
      setShowAddForm(false);
    }
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const updateExercise = (id: string, field: keyof Exercise, value: string | number) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const saveWorkout = async () => {
    if (exercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }

    setSaving(true);
    try {
      const totalVolume = exercises.reduce((sum, ex) => 
        sum + (ex.sets * ex.reps * ex.weight), 0
      );

      await api.createWorkout({
        exercises: exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
        })),
        duration: 45, // You can add a duration input
        totalVolume,
        date: new Date(),
      });

      alert('Workout saved successfully! 💪');
      setExercises([]);
    } catch (error: any) {
      alert('Error saving workout: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const totalVolume = exercises.reduce((sum, ex) => 
    sum + (ex.sets * ex.reps * ex.weight), 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="mb-2">Today's Workout</h2>
        <p className="text-blue-100">Log your exercises and track your progress</p>
      </div>

      {/* Workout Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <Dumbbell className="w-6 h-6 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl mb-1">{exercises.length}</div>
          <div className="text-gray-600 text-sm">Exercises</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <div className="text-2xl mb-1">{totalVolume}</div>
          <div className="text-gray-600 text-sm">Total Volume</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md text-center">
          <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl mb-1">45</div>
          <div className="text-gray-600 text-sm">Minutes</div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-4">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="bg-white rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <input
                type="text"
                value={exercise.name}
                onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                className="text-lg border-none outline-none bg-transparent"
              />
              <button
                onClick={() => removeExercise(exercise.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Sets</label>
                <input
                  type="number"
                  value={exercise.sets}
                  onChange={(e) => updateExercise(exercise.id, 'sets', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Reps</label>
                <input
                  type="number"
                  value={exercise.reps}
                  onChange={(e) => updateExercise(exercise.id, 'reps', parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={exercise.weight}
                  onChange={(e) => updateExercise(exercise.id, 'weight', parseFloat(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Exercise Button */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Exercise
        </button>
      ) : (
        <div className="bg-white rounded-xl p-5 shadow-md">
          <h3 className="mb-4">Add New Exercise</h3>
          
          <div className="mb-4">
            <label className="text-sm text-gray-600 block mb-2">Exercise Name</label>
            <input
              type="text"
              value={newExercise.name}
              onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
              placeholder="Enter exercise name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-600 block mb-2">Quick Select</label>
            <div className="grid grid-cols-2 gap-2">
              {popularExercises.map((name) => (
                <button
                  key={name}
                  onClick={() => setNewExercise({ ...newExercise, name })}
                  className="p-2 text-sm bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Sets</label>
              <input
                type="number"
                value={newExercise.sets}
                onChange={(e) => setNewExercise({ ...newExercise, sets: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Reps</label>
              <input
                type="number"
                value={newExercise.reps}
                onChange={(e) => setNewExercise({ ...newExercise, reps: parseInt(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Weight (kg)</label>
              <input
                type="number"
                value={newExercise.weight}
                onChange={(e) => setNewExercise({ ...newExercise, weight: parseFloat(e.target.value) })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={addExercise}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Save Workout Button */}
      {exercises.length > 0 && (
        <button
          onClick={saveWorkout}
          disabled={saving}
          className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Workout'}
        </button>
      )}
    </div>
  );
}
