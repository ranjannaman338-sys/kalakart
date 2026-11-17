import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingAmount, setShippingAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        const res = await cartApi.getCart();
        if (res.success) {
          const data = res.data;
          setItems(data.items || []);
          setSubtotal(data.subtotal || 0);
          setShippingAmount(data.shippingAmount || 0);
          setTotalAmount(data.totalAmount || 0);
          setItemCount(data.itemCount || 0);
        }
      } catch (err) {
        console.error('Failed to load cart:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Guest cart from localStorage
      const saved = localStorage.getItem('kalakart_guest_cart');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setItems(parsed);
          const count = parsed.reduce((sum, it) => sum + (it.quantity || 1), 0);
          setItemCount(count);
          const sub = parsed.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 1), 0);
          setSubtotal(sub);
          const ship = sub >= 999 || sub === 0 ? 0 : 99;
          setShippingAmount(ship);
          setTotalAmount(sub + ship);
        } catch (e) {
          setItems([]);
          setItemCount(0);
        }
      } else {
        setItems([]);
        setItemCount(0);
        setSubtotal(0);
        setShippingAmount(0);
        setTotalAmount(0);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product, quantity = 1) => {
    if (product.stock <= 0) {
      toast.error('This product is currently out of stock.');
      return false;
    }

    if (isAuthenticated) {
      try {
        await cartApi.addItem(product._id, quantity);
        await fetchCart();
        toast.success(`Added "${product.name}" to cart!`);
        return true;
      } catch (err) {
        toast.error(err.message || 'Could not add product to cart');
        return false;
      }
    } else {
      // Guest cart
      const current = [...items];
      const existingIdx = current.findIndex((it) => (it.productId?._id || it.productId) === product._id);
      if (existingIdx > -1) {
        const newQty = current[existingIdx].quantity + quantity;
        if (newQty > product.stock) {
          toast.error(`Cannot add more than ${product.stock} items in stock.`);
          return false;
        }
        current[existingIdx].quantity = newQty;
      } else {
        current.push({
          productId: product._id,
          name: product.name,
          slug: product.slug,
          image: product.images?.[0] || '',
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          stock: product.stock,
          seller: product.sellerProfileId || { shopName: 'Artisan' },
          quantity,
          lineTotal: product.price * quantity,
        });
      }
      localStorage.setItem('kalakart_guest_cart', JSON.stringify(current));
      setItems(current);
      setItemCount(current.reduce((s, it) => s + it.quantity, 0));
      toast.success(`Added "${product.name}" to cart!`);
      return true;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return;

    if (isAuthenticated) {
      try {
        await cartApi.updateQuantity(productId, quantity);
        await fetchCart();
      } catch (err) {
        toast.error(err.message || 'Could not update quantity');
      }
    } else {
      const current = items.map((it) => {
        if ((it.productId?._id || it.productId) === productId) {
          return { ...it, quantity };
        }
        return it;
      });
      localStorage.setItem('kalakart_guest_cart', JSON.stringify(current));
      setItems(current);
      setItemCount(current.reduce((s, it) => s + it.quantity, 0));
      const sub = current.reduce((sum, it) => sum + (it.price || 0) * it.quantity, 0);
      setSubtotal(sub);
      setShippingAmount(sub >= 999 || sub === 0 ? 0 : 99);
      setTotalAmount(sub + (sub >= 999 || sub === 0 ? 0 : 99));
    }
  };

  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      try {
        await cartApi.removeItem(productId);
        await fetchCart();
        toast.success('Item removed from cart');
      } catch (err) {
        toast.error(err.message || 'Could not remove item');
      }
    } else {
      const current = items.filter((it) => (it.productId?._id || it.productId) !== productId);
      localStorage.setItem('kalakart_guest_cart', JSON.stringify(current));
      setItems(current);
      setItemCount(current.reduce((s, it) => s + it.quantity, 0));
      const sub = current.reduce((sum, it) => sum + (it.price || 0) * it.quantity, 0);
      setSubtotal(sub);
      setShippingAmount(sub >= 999 || sub === 0 ? 0 : 99);
      setTotalAmount(sub + (sub >= 999 || sub === 0 ? 0 : 99));
      toast.success('Item removed from cart');
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await cartApi.clearCart();
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.removeItem('kalakart_guest_cart');
    setItems([]);
    setItemCount(0);
    setSubtotal(0);
    setShippingAmount(0);
    setTotalAmount(0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        subtotal,
        shippingAmount,
        totalAmount,
        itemCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
