import { useState } from 'react';
import { 
  Home, 
  Dumbbell, 
  TrendingUp, 
  Calendar, 
  LogOut,
  QrCode,
  User
} from 'lucide-react';
import { MemberHome } from './MemberHome';
import { WorkoutLogger } from './WorkoutLogger';
import { ProgressTracker } from './ProgressTracker';
import { BookingSessions } from './BookingSessions';
import { MemberProfile } from './MemberProfile';

interface MemberDashboardProps {
  onLogout: () => void;
}

type TabType = 'home' | 'workout' | 'progress' | 'booking' | 'profile';

export function MemberDashboard({ onLogout }: MemberDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'workout' as TabType, label: 'Workout', icon: Dumbbell },
    { id: 'progress' as TabType, label: 'Progress', icon: TrendingUp },
    { id: 'booking' as TabType, label: 'Booking', icon: Calendar },
    { id: 'profile' as TabType, label: 'Profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-8 h-8" />
            <div>
              <h1 className="text-xl">FitTrack Pro</h1>
              <p className="text-blue-100 text-sm">Member Portal</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 pb-24">
        {activeTab === 'home' && <MemberHome />}
        {activeTab === 'workout' && <WorkoutLogger />}
        {activeTab === 'progress' && <ProgressTracker />}
        {activeTab === 'booking' && <BookingSessions />}
        {activeTab === 'profile' && <MemberProfile />}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-around items-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-blue-500'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
