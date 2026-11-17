import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck, User, Store } from 'lucide-react';
import toast from 'react-hot-toast';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      toast.success(`Welcome back, ${res.user.name}!`);

      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.user.role === 'seller' && res.sellerProfile?.applicationStatus === 'approved') {
        navigate('/seller/dashboard');
      } else {
        navigate(from === '/login' ? '/' : from);
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Convenient demo quick-fill helper for test & evaluation
  const fillDemo = (role) => {
    if (role === 'customer') {
      setEmail('customer@kalakart.com');
      setPassword('CustomerPass123!');
    } else if (role === 'seller') {
      setEmail('artisan.priya@kalakart.com');
      setPassword('ArtisanPass123!');
    } else if (role === 'admin') {
      setEmail('admin@kalakart.com');
      setPassword('AdminSecurePass123!');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-cream-200 shadow-sm">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-terracotta-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-terracotta-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
            Welcome to KalaKart
          </h2>
          <p className="text-xs text-charcoal-500 font-sans">
            Sign in to access your curated wishlist, artisan orders, and artisan studios
          </p>
        </div>

        {/* Quick Demo Fill Buttons for Easy Evaluation */}
        <div className="p-3 bg-cream-50 rounded-2xl border border-cream-200">
          <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 mb-2 text-center">
            Demo Credentials (Quick-Fill):
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('customer')}
              className="px-2 py-1.5 bg-white hover:bg-cream-100 border border-cream-300 rounded-lg text-[11px] font-semibold text-charcoal-800 transition-colors flex items-center justify-center space-x-1"
            >
              <User className="w-3 h-3 text-terracotta-500" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('seller')}
              className="px-2 py-1.5 bg-white hover:bg-cream-100 border border-cream-300 rounded-lg text-[11px] font-semibold text-charcoal-800 transition-colors flex items-center justify-center space-x-1"
            >
              <Store className="w-3 h-3 text-olive-600" />
              <span>Artisan</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="px-2 py-1.5 bg-white hover:bg-cream-100 border border-cream-300 rounded-lg text-[11px] font-semibold text-charcoal-800 transition-colors flex items-center justify-center space-x-1"
            >
              <ShieldCheck className="w-3 h-3 text-purple-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Email Address
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

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-terracotta-600 hover:underline font-semibold"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-cream-100">
          <p className="text-xs text-charcoal-600">
            Don't have a KalaKart account?{' '}
            <Link to="/register" className="font-bold text-terracotta-600 hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
