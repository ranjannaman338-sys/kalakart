import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from './LoadingAndEmpty';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export function RoleGuard({ allowedRoles = [], children, fallback = null }) {
  const { user, sellerProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is seller, check application status
  if (allowedRoles.includes('seller')) {
    if (user.role === 'admin') {
      return children; // Admin has oversight
    }
    if (user.role !== 'seller') {
      return <Navigate to="/seller/apply" replace />;
    }
    if (sellerProfile && sellerProfile.applicationStatus !== 'approved') {
      return <Navigate to="/seller/pending" replace />;
    }
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      fallback || (
        <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl border border-cream-200 text-center">
          <h2 className="font-serif text-2xl text-charcoal-900 font-bold mb-2">Access Restricted</h2>
          <p className="text-charcoal-600 text-sm mb-6">
            You do not have the required permissions ({allowedRoles.join(' / ')}) to view this section.
          </p>
          <a
            href="/"
            className="inline-block px-5 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-lg text-sm font-medium"
          >
            Return to Marketplace Home
          </a>
        </div>
      )
    );
  }

  return children;
}
