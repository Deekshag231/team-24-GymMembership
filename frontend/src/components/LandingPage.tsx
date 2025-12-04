import { useState } from 'react';
import { Dumbbell, Users, UserCog } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

type UserRole = 'member' | 'admin' | 'trainer';

interface LandingPageProps {
  onRoleSelect: (role: UserRole) => void;
  showLogin?: boolean;
  onCloseLogin?: () => void;
}

export function LandingPage({ onRoleSelect, showLogin, onCloseLogin }: LandingPageProps) {
  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    {
      id: 'member' as UserRole,
      title: 'Member',
      description: 'Track workouts, view progress, and book sessions',
      icon: Dumbbell,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      id: 'admin' as UserRole,
      title: 'Admin',
      description: 'Manage members, staff, and view analytics',
      icon: UserCog,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700'
    },
    {
      id: 'trainer' as UserRole,
      title: 'Trainer',
      description: 'Manage clients and create workout plans',
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      hoverColor: 'hover:from-emerald-600 hover:to-emerald-700'
    }
  ];

  const handleRoleClick = (role: UserRole) => {
    setSelectedRole(role);
    setShowLogin?.(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(email, password);
      setSuccess('Login successful!');
      setTimeout(() => {
        onCloseLogin?.();
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.register({
        name,
        email,
        password,
        phone: phone || undefined,
        role: selectedRole || 'member',
      });
      setSuccess('Account created successfully! Please login.');
      setIsSignup(false);
      setName('');
      setPhone('');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Dumbbell className="w-16 h-16 text-blue-500" />
          </div>
          <h1 className="text-white mb-4">FitTrack Pro</h1>
          <p className="text-gray-400 text-xl">Your Complete Gym Management & Fitness Tracking Solution</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleRoleClick(role.id)}
                className={`bg-gradient-to-br ${role.color} ${role.hoverColor} p-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 text-left`}
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6">
                  <Icon className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-white mb-3">{role.title}</h2>
                <p className="text-white/80">{role.description}</p>
                <div className="mt-6 text-white/60 text-sm">Click to login as {role.title}</div>
              </button>
            );
          })}
        </div>

        {(showLogin || selectedRole) && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl">{isSignup ? 'Sign Up' : 'Login'} as {selectedRole}</h2>
                <button
                  onClick={() => {
                    onCloseLogin?.();
                    setSelectedRole(null);
                    setIsSignup(false);
                    setEmail('');
                    setPassword('');
                    setName('');
                    setPhone('');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setIsSignup(false)}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    !isSignup ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignup(true)}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    isSignup ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {isSignup ? (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Phone (Optional)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password (min 6 characters)"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                      minLength={6}
                    />
                  </div>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  {success && <p className="text-green-600 text-sm">{success}</p>}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignup(false);
                        setError('');
                        setSuccess('');
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Back to Login
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      required
                    />
                  </div>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  {success && <p className="text-green-600 text-sm">{success}</p>}
                  <div className="text-sm text-gray-600 mb-4">
                    <p className="font-semibold mb-2">Demo credentials:</p>
                    <p>Admin: admin@fittrack.com / admin123</p>
                    <p>Trainer: sarah.j@fittrack.com / trainer123</p>
                    <p>Member: alex.morgan@email.com / member123</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onCloseLogin?.();
                        setSelectedRole(null);
                        setEmail('');
                        setPassword('');
                        setError('');
                        setSuccess('');
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        <div className="mt-16 text-center text-gray-500">
          <p>Select a role and login to explore the platform</p>
        </div>
      </div>
    </div>
  );
}
