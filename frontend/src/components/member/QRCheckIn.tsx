import { useState, useEffect } from 'react';
import { QrCode, CheckCircle2, X, MapPin, Clock } from 'lucide-react';
import api from '../../services/api';

interface QRCheckInProps {
  onClose: () => void;
}

export function QRCheckIn({ onClose }: QRCheckInProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [checkInSuccess, setCheckInSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Simulate QR scan and check in after 2 seconds
    const timer = setTimeout(async () => {
      try {
        await api.checkIn('FitTrack Downtown');
        setIsScanning(false);
        setCheckInSuccess(true);
      } catch (err: any) {
        setIsScanning(false);
        setError(err.message || 'Check-in failed');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const checkInData = {
    location: 'FitTrack Downtown',
    time: new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    date: new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3>Check-in</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isScanning ? (
            <div className="text-center">
              <div className="mb-6">
                <div className="relative inline-block">
                  <QrCode className="w-32 h-32 text-blue-600 animate-pulse" />
                  <div className="absolute inset-0 border-4 border-blue-600 rounded-lg animate-ping opacity-25"></div>
                </div>
              </div>
              <h3 className="mb-2">Scanning QR Code...</h3>
              <p className="text-gray-600">Please hold steady</p>
            </div>
          ) : checkInSuccess ? (
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-green-100 rounded-full">
                  <CheckCircle2 className="w-20 h-20 text-green-600" />
                </div>
              </div>
              <h2 className="text-green-600 mb-2">Check-in Successful! 🎉</h2>
              <p className="text-gray-600 mb-6">Have a great workout!</p>

              {/* Check-in Details */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <div className="text-sm text-gray-600">Location</div>
                    <div>{checkInData.location}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <div className="text-sm text-gray-600">Time</div>
                    <div>{checkInData.time}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-32 h-32 bg-red-100 rounded-full">
                  <X className="w-20 h-20 text-red-600" />
                </div>
              </div>
              <h2 className="text-red-600 mb-2">Check-in Failed</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={onClose}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
