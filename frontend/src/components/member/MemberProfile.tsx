import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, CreditCard, Edit2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export function MemberProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [memberInfo, setMemberInfo] = useState({
    name: '',
    email: '',
    phone: '',
    joinDate: '',
    membershipType: 'N/A',
    membershipStatus: 'expired',
    expiryDate: '',
  });
  const [personalStats, setPersonalStats] = useState({
    currentWeight: 'N/A',
    targetWeight: 'N/A',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const [homeData, progressData] = await Promise.all([
        api.getMemberHomeData(),
        api.getMyProgress(),
      ]);

      if (homeData.data) {
        const membership = homeData.data.membership;
        setMemberInfo({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          joinDate: membership?.startDate ? new Date(membership.startDate).toLocaleDateString() : 'N/A',
          membershipType: membership?.plan || 'N/A',
          membershipStatus: membership?.status || 'expired',
          expiryDate: membership?.endDate ? new Date(membership.endDate).toLocaleDateString() : 'N/A',
        });
      }

      if (progressData.data?.progress && progressData.data.progress.length > 0) {
        const latest = progressData.data.progress[0];
        setPersonalStats({
          currentWeight: latest.weight ? `${latest.weight} kg` : 'N/A',
          targetWeight: 'N/A',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-12 shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="mb-2">My Profile</h2>
        <p className="text-blue-100">Manage your personal information</p>
      </div>

      {/* Profile Picture & Name */}
      <div className="bg-white rounded-2xl p-6 shadow-md text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto mb-4">
          {memberInfo.name.split(' ').map(n => n[0]).join('') || 'U'}
        </div>
        <h2 className="mb-1">{memberInfo.name || 'Member'}</h2>
        <p className="text-gray-600">Member since {memberInfo.joinDate}</p>
        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto">
          <Edit2 className="w-4 h-4" />
          Edit Profile
        </button>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="mb-4">Contact Information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600">Email</div>
              <div>{memberInfo.email || 'N/A'}</div>
            </div>
          </div>
          {memberInfo.phone && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600">Phone</div>
                <div>{memberInfo.phone}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Membership Details */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="mb-4">Membership Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Plan Type</span>
            <span className="text-blue-600">{memberInfo.membershipType}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Status</span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
              memberInfo.membershipStatus === 'active' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {memberInfo.membershipStatus.charAt(0).toUpperCase() + memberInfo.membershipStatus.slice(1)}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Expiry Date</span>
            <span>{memberInfo.expiryDate}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-600">Member Since</span>
            <span>{memberInfo.joinDate}</span>
          </div>
        </div>
        <button className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          <CreditCard className="w-5 h-5" />
          Renew Membership
        </button>
      </div>

      {/* Personal Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="mb-4">Personal Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Current Weight</div>
            <div className="text-xl text-orange-700">{personalStats.currentWeight}</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Target Weight</div>
            <div className="text-xl text-purple-700">{personalStats.targetWeight}</div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="mb-4">Settings</h3>
        <div className="space-y-3">
          <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
            Change Password
          </button>
          <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
            Notification Preferences
          </button>
          <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
            Privacy Settings
          </button>
          <button className="w-full text-left p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            Freeze Membership
          </button>
        </div>
      </div>
    </div>
  );
}
