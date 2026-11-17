import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { Sparkles, Mail, Lock, Key, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [tokenInfo, setTokenInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword({ email });
      if (res.success) {
        toast.success(res.data.message);
        setTokenInfo(res.data.developmentResetToken || null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to request reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-sm">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-terracotta-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal-900">
            Reset Password
          </h2>
          <p className="text-xs text-charcoal-500 font-sans">
            Enter your email address and we'll generate your single-use reset credentials
          </p>
        </div>

        {tokenInfo ? (
          <div className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-3">
            <p className="text-xs font-bold text-olive-800">
              Reset Token Generated (Development Mode):
            </p>
            <div className="p-2.5 bg-white border border-cream-300 rounded-lg font-mono text-[11px] text-charcoal-800 break-all select-all">
              {tokenInfo}
            </div>
            <Link
              to={`/reset-password?token=${tokenInfo}`}
              className="w-full py-2 bg-terracotta-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center space-x-1"
            >
              <span>Proceed to Reset Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
                Account Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-xs focus:outline-none focus:border-terracotta-500 text-charcoal-900"
                  placeholder="name@example.com"
                />
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : 'Send Reset Link'}</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-cream-100">
          <Link to="/login" className="text-xs font-semibold text-terracotta-600 hover:underline">
            ← Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ResetPassword() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const initialToken = searchParams.get('token') || '';

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !newPassword) {
      toast.error('Both token and new password are required');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword({ token, newPassword });
      if (res.success) {
        toast.success('Your password has been successfully reset! Please sign in.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reset password. Token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-sm">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-terracotta-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-charcoal-900">
            Set New Password
          </h2>
          <p className="text-xs text-charcoal-500 font-sans">
            Enter your valid reset token and choose a secure password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Reset Token
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-xs font-mono focus:outline-none focus:border-terracotta-500 text-charcoal-900"
                placeholder="Paste reset token here"
              />
              <Key className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              New Password (min 6 characters)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-xs focus:outline-none focus:border-terracotta-500 text-charcoal-900"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
