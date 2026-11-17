import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Store,
  Users,
  Tag,
  FolderTree,
  ChevronRight,
  TrendingUp,
  Menu,
  X,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function DashboardStatCard({ title, value, icon: Icon, trend, subtitle, color = 'terracotta' }) {
  const colorMap = {
    terracotta: 'bg-terracotta-50 text-terracotta-600 border-terracotta-200',
    olive: 'bg-olive-50 text-olive-600 border-olive-200',
    cream: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-cream-200 p-4 sm:p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
          {title}
        </span>
        <div className={`p-2 rounded-xl border ${colorMap[color] || colorMap.terracotta}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <span className="font-serif text-xl sm:text-2xl font-bold text-charcoal-900">{value}</span>
        {trend && (
          <span className="text-xs font-medium text-olive-600 flex items-center">
            <TrendingUp className="w-3 h-3 mr-0.5" />
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-charcoal-500 mt-1">{subtitle}</p>}
    </div>
  );
}

/**
 * DashboardSidebar — desktop: fixed left sidebar; mobile: slide-in drawer
 */
export function DashboardSidebar({ role = 'seller', mobileOpen = false, onClose = () => {} }) {
  const location = useLocation();
  const { logout, user } = useAuth();

  const sellerLinks = [
    { label: 'Overview', path: '/seller/dashboard', icon: LayoutDashboard },
    { label: 'My Products', path: '/seller/products', icon: Package },
    { label: 'Add New Product', path: '/seller/products/new', icon: Package },
    { label: 'Customer Orders', path: '/seller/orders', icon: ShoppingBag },
    { label: 'Shop Profile', path: '/seller/profile', icon: Store },
  ];

  const adminLinks = [
    { label: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users Management', path: '/admin/users', icon: Users },
    { label: 'Seller Applications', path: '/admin/sellers', icon: Store },
    { label: 'Product Moderation', path: '/admin/products', icon: Package },
    { label: 'All Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Discount Coupons', path: '/admin/coupons', icon: Tag },
  ];

  const links = role === 'admin' ? adminLinks : sellerLinks;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 bg-cream-50 rounded-xl border border-cream-200 mb-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
          {role === 'admin' ? 'Administrator Portal' : 'Artisan Seller Hub'}
        </p>
        <p className="text-sm font-semibold text-charcoal-900 truncate mt-0.5">{user?.name}</p>
      </div>

      {/* Nav links */}
      <nav className="space-y-1 flex-1">
        {links.map((link) => {
          const isActive = location.pathname === link.path;
          const Icon = link.icon;
          return (
            <Link
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-terracotta-500 text-white shadow-sm'
                  : 'text-charcoal-700 hover:bg-cream-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer link */}
      <div className="pt-4 border-t border-cream-200 mt-4">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center space-x-2.5 px-3.5 py-2 text-xs font-medium text-charcoal-600 hover:text-terracotta-500"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-cream-200 min-h-screen p-4">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <aside className="relative w-72 max-w-[85vw] bg-white h-full p-4 shadow-2xl animate-slide-in-left flex flex-col overflow-y-auto">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-cream-100 text-charcoal-600"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="mt-8">
              <SidebarContent />
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

/**
 * DashboardMobileHeader — sticky top bar shown only on mobile/tablet
 */
export function DashboardMobileHeader({ title, onMenuOpen }) {
  return (
    <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-cream-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <button
        onClick={onMenuOpen}
        className="p-2 rounded-lg hover:bg-cream-100 text-charcoal-700"
        aria-label="Open navigation menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      <span className="font-serif font-bold text-charcoal-900 text-base">{title}</span>
      <div className="w-9" aria-hidden="true" /> {/* spacer to center title */}
    </div>
  );
}
