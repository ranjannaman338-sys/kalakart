import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Sun,
  Moon,
  User,
  Search,
  Menu,
  X,
  Package,
  Layers,
  Sparkles,
  LogOut,
  ChevronDown,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';

export function Navbar() {
  const { user, isAuthenticated, isSeller, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md border-b border-cream-200">
      {/* Announcement Bar */}
      <div className="bg-terracotta-500 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center space-x-2">
        <Sparkles className="w-3.5 h-3.5 opacity-80" />
        <span>Celebrate Handmade. Support Local Artisans. Free shipping on orders over ₹999.</span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-terracotta-500 text-white flex items-center justify-center shadow-md shadow-terracotta-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-charcoal-900 leading-tight">
                Kala<span className="text-terracotta-500">Kart</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase text-charcoal-500 font-medium -mt-0.5">
                Handmade Treasures
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md mx-8 relative"
          >
            <input
              type="text"
              placeholder="Search pottery, jewelry, wooden crafts, textiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500/30 focus:border-terracotta-500 transition-all text-charcoal-800 placeholder-charcoal-400"
            />
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-charcoal-700">
            <Link to="/" className="hover:text-terracotta-500 transition-colors">
              Home
            </Link>
            <Link to="/shop" className="hover:text-terracotta-500 transition-colors">
              Shop
            </Link>
            <Link to="/categories" className="hover:text-terracotta-500 transition-colors">
              Categories
            </Link>
            <Link to="/artisans" className="hover:text-terracotta-500 transition-colors">
              Meet Our Artisans
            </Link>
            {!isSeller && !isAdmin && (
              <Link
                to="/seller/apply"
                className="text-olive-600 hover:text-olive-700 font-semibold transition-colors flex items-center space-x-1"
              >
                <Compass className="w-4 h-4" />
                <span>Become a Seller</span>
              </Link>
            )}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle (Dark / Light Mode) */}
            <button
              onClick={toggleTheme}
              className="p-2 text-charcoal-700 hover:text-terracotta-500 transition-colors rounded-full hover:bg-cream-100 focus:outline-none"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark / Light Theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="w-5 h-5 text-charcoal-700" />
              )}
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-charcoal-700 hover:text-terracotta-500 transition-colors rounded-full hover:bg-cream-100"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-terracotta-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-charcoal-700 hover:text-terracotta-500 transition-colors rounded-full hover:bg-cream-100"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-terracotta-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Account / Profile */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full border border-cream-300 hover:border-terracotta-300 bg-cream-50 hover:bg-cream-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-terracotta-100 text-terracotta-600 flex items-center justify-center font-bold text-xs uppercase">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <span className="text-xs font-medium text-charcoal-800 hidden sm:inline max-w-[100px] truncate">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-charcoal-500" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-cream-200 py-2 z-50 animate-fade-in"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-cream-100">
                      <p className="text-xs font-semibold text-charcoal-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-charcoal-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-cream-200 text-charcoal-700">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-charcoal-700 hover:bg-cream-50 hover:text-terracotta-500"
                      >
                        <Package className="w-4 h-4 text-charcoal-400" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-charcoal-700 hover:bg-cream-50 hover:text-terracotta-500"
                      >
                        <User className="w-4 h-4 text-charcoal-400" />
                        <span>Account Profile</span>
                      </Link>
                    </div>

                    {/* Seller Links */}
                    {isSeller && (
                      <div className="py-1 border-t border-cream-100">
                        <Link
                          to="/seller/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-olive-700 hover:bg-olive-50 font-semibold"
                        >
                          <Layers className="w-4 h-4 text-olive-600" />
                          <span>Seller Dashboard</span>
                        </Link>
                      </div>
                    )}

                    {/* Admin Links */}
                    {isAdmin && (
                      <div className="py-1 border-t border-cream-100">
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 font-semibold"
                        >
                          <Layers className="w-4 h-4 text-purple-600" />
                          <span>Admin Console</span>
                        </Link>
                      </div>
                    )}

                    <div className="py-1 border-t border-cream-100">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center space-x-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-charcoal-700 hover:text-terracotta-500 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex px-4 py-2 text-xs font-semibold bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-lg transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-charcoal-700 lg:hidden rounded-lg hover:bg-cream-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search handmade products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-lg text-sm focus:outline-none focus:border-terracotta-500 text-charcoal-800"
            />
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-2.5" />
          </form>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-cream-200 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-charcoal-800 hover:text-terracotta-500"
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-charcoal-800 hover:text-terracotta-500"
          >
            Shop All Products
          </Link>
          <Link
            to="/categories"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-charcoal-800 hover:text-terracotta-500"
          >
            Craft Categories
          </Link>
          <Link
            to="/artisans"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-charcoal-800 hover:text-terracotta-500"
          >
            Meet Our Artisans
          </Link>

          {!isSeller && !isAdmin && (
            <Link
              to="/seller/apply"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-olive-600 hover:text-olive-700"
            >
              Become an Artisan Seller
            </Link>
          )}

          {isSeller && (
            <Link
              to="/seller/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-olive-700 hover:text-olive-800"
            >
              Seller Dashboard
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-purple-700 hover:text-purple-800"
            >
              Admin Console
            </Link>
          )}

          {/* Mobile Theme Toggle */}
          <div className="py-2.5 px-1 border-t border-cream-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-charcoal-700">Display Theme</span>
            <button
              onClick={toggleTheme}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-cream-100 text-xs font-semibold text-charcoal-800"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          {!isAuthenticated && (
            <div className="pt-4 border-t border-cream-100 flex space-x-3">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-semibold border border-cream-300 rounded-lg text-charcoal-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-semibold bg-terracotta-500 text-white rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
