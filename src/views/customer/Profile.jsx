import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { User, Phone, Mail, MapPin, Plus, Trash2, Check, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export function Profile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  const loadAddresses = async () => {
    try {
      const res = await authApi.getAddresses();
      if (res.success) {
        setAddresses(res.data.addresses || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authApi.updateProfile({ name, phone, avatar });
      if (res.success) {
        toast.success('Profile updated successfully!');
        await refreshUser();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await authApi.addAddress(newAddress);
      if (res.success) {
        toast.success('Address added successfully!');
        setIsAddingAddress(false);
        setNewAddress({
          name: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'India',
        });
        loadAddresses();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await authApi.deleteAddress(id);
      if (res.success) {
        toast.success('Address removed');
        loadAddresses();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await authApi.setDefaultAddress(id);
      if (res.success) {
        toast.success('Default address updated');
        loadAddresses();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to set default address');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">Account Profile</h1>
        <p className="text-xs text-charcoal-500 mt-1">
          Manage your personal details and saved delivery destinations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm space-y-6">
          <h2 className="font-serif font-bold text-base text-charcoal-900 pb-3 border-b border-cream-100 flex items-center space-x-2">
            <User className="w-4 h-4 text-terracotta-500" />
            <span>Personal Information</span>
          </h2>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg focus:outline-none focus:border-terracotta-500"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Email (Read Only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 bg-cream-100 border border-cream-200 rounded-lg text-charcoal-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg focus:outline-none focus:border-terracotta-500"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block font-bold text-charcoal-700 mb-1">Avatar Image URL</label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3 py-2 bg-cream-50 border border-cream-200 rounded-lg focus:outline-none focus:border-terracotta-500"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold rounded-lg text-xs shadow-sm disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-cream-100">
            <h2 className="font-serif font-bold text-base text-charcoal-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-terracotta-500" />
              <span>Saved Addresses ({addresses.length})</span>
            </h2>
            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="text-xs font-semibold text-terracotta-600 hover:underline flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddingAddress ? 'Cancel' : 'Add New'}</span>
            </button>
          </div>

          {/* Add Address Form */}
          {isAddingAddress && (
            <form onSubmit={handleAddAddress} className="space-y-3 bg-cream-50 p-4 rounded-xl border border-cream-200 text-xs">
              <h4 className="font-bold text-charcoal-900">Add New Destination</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Recipient Name"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                  className="px-2.5 py-1.5 bg-white border border-cream-200 rounded-lg"
                />
                <input
                  type="tel"
                  required
                  placeholder="Phone"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  className="px-2.5 py-1.5 bg-white border border-cream-200 rounded-lg"
                />
              </div>
              <input
                type="text"
                required
                placeholder="Street Address"
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-white border border-cream-200 rounded-lg"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="px-2.5 py-1.5 bg-white border border-cream-200 rounded-lg"
                />
                <input
                  type="text"
                  required
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="px-2.5 py-1.5 bg-white border border-cream-200 rounded-lg"
                />
                <input
                  type="text"
                  required
                  placeholder="PIN Code"
                  value={newAddress.postalCode}
                  onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                  className="px-2.5 py-1.5 bg-white border border-cream-200 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-charcoal-900 text-white rounded-lg font-semibold hover:bg-black transition-colors"
              >
                Save Address
              </button>
            </form>
          )}

          {/* Address List */}
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr._id}
                className="p-3.5 rounded-xl border border-cream-200 bg-cream-50/50 flex items-start justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-bold text-charcoal-900">{addr.name}</p>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-olive-700 bg-olive-100 px-1.5 py-0.2 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-charcoal-600 mt-0.5">{addr.street}</p>
                  <p className="text-charcoal-600">{addr.city}, {addr.state} - {addr.postalCode}</p>
                  <p className="text-charcoal-500 mt-1">Phone: {addr.phone}</p>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr._id)}
                      className="text-[11px] text-terracotta-600 hover:underline font-semibold"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="text-charcoal-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
