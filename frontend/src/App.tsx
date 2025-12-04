import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { MemberDashboard } from './components/member/MemberDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TrainerDashboard } from './components/trainer/TrainerDashboard';

function AppContent() {
  const { user, logout, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    if (user.role === 'member') {
      return <MemberDashboard onLogout={logout} />;
    }
    if (user.role === 'admin') {
      return <AdminDashboard onLogout={logout} />;
    }
    if (user.role === 'trainer') {
      return <TrainerDashboard onLogout={logout} />;
    }
  }

  return <LandingPage onRoleSelect={() => setShowLogin(true)} showLogin={showLogin} onCloseLogin={() => setShowLogin(false)} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
