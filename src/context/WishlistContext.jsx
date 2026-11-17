import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistApi } from '../api/wishlistApi';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        const res = await wishlistApi.getWishlist();
        if (res.success) {
          setWishlist(res.data.wishlist || []);
        }
      } catch (err) {
        console.error('Failed to load wishlist:', err);
      } finally {
        setLoading(false);
      }
    } else {
      const saved = localStorage.getItem('kalakart_guest_wishlist');
      if (saved) {
        try {
          setWishlist(JSON.parse(saved));
        } catch (e) {
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item) === productId);
  };

  const toggleWishlist = async (product) => {
    const pId = product._id;
    const isCurrentlySaved = isInWishlist(pId);

    if (isAuthenticated) {
      try {
        const res = await wishlistApi.toggleWishlist(pId);
        await fetchWishlist();
        if (res.data?.isWishlisted) {
          toast.success(`Saved "${product.name}" to your wishlist!`);
        } else {
          toast.success(`Removed "${product.name}" from wishlist.`);
        }
        return res.data?.isWishlisted;
      } catch (err) {
        toast.error(err.message || 'Could not update wishlist');
      }
    } else {
      let updated;
      if (isCurrentlySaved) {
        updated = wishlist.filter((item) => (item._id || item) !== pId);
        toast.success(`Removed "${product.name}" from wishlist.`);
      } else {
        updated = [...wishlist, product];
        toast.success(`Saved "${product.name}" to your wishlist!`);
      }
      setWishlist(updated);
      localStorage.setItem('kalakart_guest_wishlist', JSON.stringify(updated));
      return !isCurrentlySaved;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (isAuthenticated) {
      try {
        await wishlistApi.removeItem(productId);
        await fetchWishlist();
        toast.success('Item removed from wishlist');
      } catch (err) {
        toast.error(err.message || 'Could not remove item');
      }
    } else {
      const updated = wishlist.filter((item) => (item._id || item) !== productId);
      setWishlist(updated);
      localStorage.setItem('kalakart_guest_wishlist', JSON.stringify(updated));
      toast.success('Item removed from wishlist');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        loading,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
