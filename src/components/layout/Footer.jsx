import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Heart, Send, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';
import { newsletterApi } from '../../api/otherApi';
import toast from 'react-hot-toast';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await newsletterApi.subscribe(email);
      setSubscribed(true);
      toast.success('Thank you for subscribing to KalaKart handmade updates!');
      setEmail('');
    } catch (err) {
      toast.error(err.message || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-charcoal-900 text-cream-100 pt-16 pb-8 border-t border-charcoal-800">
      {/* Core Marketplace Commitments */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-charcoal-800">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-terracotta-500/20 text-terracotta-400 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">100% Authentic Handmade</h4>
              <p className="text-xs text-charcoal-400 mt-1 leading-relaxed">
                Directly sourced from verified local artisans and master weavers.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-olive-500/20 text-olive-400 rounded-xl">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Direct Artisan Support</h4>
              <p className="text-xs text-charcoal-400 mt-1 leading-relaxed">
                Empowering generational craft traditions and fair rural livelihoods.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Safe & Eco Delivery</h4>
              <p className="text-xs text-charcoal-400 mt-1 leading-relaxed">
                Plastic-conscious, shock-resistant protective craft packaging.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Secure Shopping</h4>
              <p className="text-xs text-charcoal-400 mt-1 leading-relaxed">
                Cash on delivery available with instant doorstep verification.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pt-12">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-terracotta-500 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Kala<span className="text-terracotta-400">Kart</span>
              </span>
            </div>
            <p className="text-xs text-charcoal-400 leading-relaxed mb-6 max-w-sm">
              Discover unique handmade treasures crafted with love by talented local artisans. Every purchase supports traditional craftsmanship, empowers small businesses, and celebrates mindful sustainability.
            </p>
            <div className="text-xs text-charcoal-400">
              <p>Email: namaste@kalakart.com</p>
              <p className="mt-1">Jaipur Craft District, Rajasthan, India</p>
            </div>
          </div>

          {/* Quick Shop Links */}
          <div>
            <h5 className="font-serif text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Discover
            </h5>
            <ul className="space-y-2.5 text-xs text-charcoal-400">
              <li>
                <Link to="/shop" className="hover:text-terracotta-400 transition-colors">
                  All Collections
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-terracotta-400 transition-colors">
                  Craft Categories
                </Link>
              </li>
              <li>
                <Link to="/artisans" className="hover:text-terracotta-400 transition-colors">
                  Meet Our Artisans
                </Link>
              </li>
              <li>
                <Link to="/seller/apply" className="hover:text-terracotta-400 transition-colors">
                  Sell on KalaKart
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-terracotta-400 transition-colors">
                  Our Story & Mission
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h5 className="font-serif text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Customer Care
            </h5>
            <ul className="space-y-2.5 text-xs text-charcoal-400">
              <li>
                <Link to="/orders" className="hover:text-terracotta-400 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-terracotta-400 transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/return-policy" className="hover:text-terracotta-400 transition-colors">
                  Returns & Cancellations
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-terracotta-400 transition-colors">
                  FAQs & Help Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-terracotta-400 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-terracotta-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-terracotta-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div>
            <h5 className="font-serif text-sm font-semibold text-white uppercase tracking-wider mb-2">
              Artisan Stories
            </h5>
            <p className="text-xs text-charcoal-400 mb-4 leading-relaxed">
              Receive inspiring stories behind generational crafts, artist features, and early access to limited edition creations.
            </p>

            {subscribed ? (
              <div className="p-3 bg-olive-900/60 border border-olive-700/60 rounded-xl text-olive-300 text-xs">
                ✓ You are subscribed to KalaKart Stories!
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-charcoal-800 border border-charcoal-700 rounded-lg text-xs text-white placeholder-charcoal-500 focus:outline-none focus:border-terracotta-400"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Subscribing...' : 'Subscribe'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 mt-12 border-t border-charcoal-800 flex flex-col sm:flex-row justify-between items-center text-xs text-charcoal-500">
          <p>© {new Date().getFullYear()} KalaKart Marketplace. All rights reserved. Made with love for local artisans.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link to="/privacy-policy" className="hover:text-charcoal-400">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-charcoal-400">
              Terms
            </Link>
            <Link to="/shipping-policy" className="hover:text-charcoal-400">
              Shipping
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
