import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await register(form);
      toast.success(`Account created! Welcome to KalaKart, ${res.user.name}`);
      navigate('/');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
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
            Join the KalaKart Community
          </h2>
          <p className="text-xs text-charcoal-500 font-sans">
            Support local craftspeople and discover authentic handmade goods
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-xs focus:outline-none focus:border-terracotta-500 text-charcoal-900"
                placeholder="Aarav Sharma"
              />
              <User className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-xs focus:outline-none focus:border-terracotta-500 text-charcoal-900"
                placeholder="name@example.com"
              />
              <Mail className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-xs focus:outline-none focus:border-terracotta-500 text-charcoal-900"
                placeholder="+91 98765 43210"
              />
              <Phone className="w-4 h-4 text-charcoal-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1">
              Password * (min 6 characters)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
            <span>{loading ? 'Creating Account...' : 'Register as Customer'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-cream-100">
          <p className="text-xs text-charcoal-600">
            Already registered on KalaKart?{' '}
            <Link to="/login" className="font-bold text-terracotta-600 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
