import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  HelpCircle,
  UserCheck,
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { adminLogin, setActiveRole } = useAuth();
  const [email, setEmail] = useState('nadeemmohd1314@gmail.com');
  const [password, setPassword] = useState('Daniyal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await adminLogin(email.trim(), password);
      setActiveRole('admin');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role: 'super' | 'ops' | 'finance') => {
    if (role === 'super') {
      setEmail('nadeemmohd1314@gmail.com');
      setPassword('Daniyal');
    } else if (role === 'ops') {
      setEmail('manager@fooddilvry.in');
      setPassword('Manager@123456');
    } else {
      setEmail('finance@fooddilvry.in');
      setPassword('Finance@123456');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-700 to-amber-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">Admin Control Portal</h3>
              <p className="text-xs text-white/80">Role-Based Server Authorization</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* Quick Demo Credentials Buttons */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between font-bold text-gray-700 text-[11px]">
              <span>Quick Login (Pre-configured Admins):</span>
              <button
                type="button"
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="text-red-600 hover:underline flex items-center space-x-1"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Security Guide</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('super')}
                className="px-2 py-1.5 rounded-lg bg-white border border-gray-300 hover:border-red-500 text-[10px] font-bold text-gray-800 transition-colors"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('ops')}
                className="px-2 py-1.5 rounded-lg bg-white border border-gray-300 hover:border-red-500 text-[10px] font-bold text-gray-800 transition-colors"
              >
                Operations
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('finance')}
                className="px-2 py-1.5 rounded-lg bg-white border border-gray-300 hover:border-red-500 text-[10px] font-bold text-gray-800 transition-colors"
              >
                Finance
              </button>
            </div>
          </div>

          {/* Setup Guide Accordion */}
          {showSetupGuide && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-1.5 text-[11px] leading-relaxed">
              <p className="font-bold flex items-center space-x-1 text-amber-950">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>How to Create Your First Secure Admin Account:</span>
              </p>
              <p>1. The initial Super Admin account is pre-provisioned securely on your server at <span className="font-mono font-bold">admin@fooddilvry.in</span> with hashed password.</p>
              <p>2. Once logged in as Super Admin, navigate to the <span className="font-bold">Admin Team</span> tab to invite custom admin team members with specific roles (Super Admin, Operations Manager, Finance Support).</p>
              <p>3. You can also provision new admins via the secure backend API endpoint <span className="font-mono font-bold">POST /api/auth/register-admin</span>.</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Admin Email Address</label>
              <div className="flex rounded-xl border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500 overflow-hidden">
                <div className="pl-3 flex items-center text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fooddilvry.in"
                  className="w-full px-3 py-2 text-xs bg-transparent focus:outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Secure Password</label>
              <div className="flex rounded-xl border border-gray-200 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-500 overflow-hidden">
                <div className="pl-3 flex items-center text-gray-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-xs bg-transparent focus:outline-none font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all text-xs flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Admin Dashboard'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
