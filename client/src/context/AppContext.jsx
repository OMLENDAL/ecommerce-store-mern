import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Toast Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth State
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register' | 'forgot'

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    addToast(`Welcome back, ${userData.name}!`, 'success');
    refreshCart();
    refreshWishlist();
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCart({ items: [], totalCount: 0, subtotal: 0 });
    setWishlistIds([]);
    addToast('Logged out successfully', 'info');
    setCurrentPage('home');
  };

  // Cart State
  const [cart, setCart] = useState({ items: [], totalCount: 0, subtotal: 0 });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const refreshCart = async () => {
    if (!localStorage.getItem('token')) {
      const localCart = JSON.parse(localStorage.getItem('guestCart') || '{"items":[],"totalCount":0,"subtotal":0}');
      setCart(localCart);
      return;
    }
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (err) {
      console.warn('Cart refresh error:', err.message);
    }
  };

  const addToCart = async (productId, qty = 1, selectedColor = 'Standard', selectedSize = 'Standard') => {
    if (!user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      addToast('Please sign in to add items to your cart', 'info');
      return;
    }

    try {
      const updatedCart = await api.addToCart({ productId, qty, selectedColor, selectedSize });
      setCart(updatedCart);
      addToast('Added item to your shopping bag!', 'success');
      setIsCartDrawerOpen(true);
    } catch (err) {
      addToast(err.message || 'Failed to add item to cart', 'error');
    }
  };

  const updateCartQty = async (itemId, productId, qty) => {
    try {
      const updated = await api.updateCartItem({ itemId, productId, qty });
      setCart(updated);
    } catch (err) {
      addToast(err.message || 'Failed to update quantity', 'error');
    }
  };

  const removeFromCart = async (identifier) => {
    try {
      const updated = await api.removeFromCart(identifier);
      setCart(updated);
      addToast('Item removed from cart', 'info');
    } catch (err) {
      addToast('Failed to remove item', 'error');
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      setCart({ items: [], totalCount: 0, subtotal: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  // Wishlist State
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  const refreshWishlist = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const items = await api.getWishlist();
      setWishlistItems(items);
      setWishlistIds(items.map(p => p.id));
    } catch (e) {
      console.warn('Wishlist refresh error:', e.message);
    }
  };

  const toggleWishlist = async (product) => {
    if (!user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      addToast('Please sign in to save items to your wishlist', 'info');
      return;
    }

    try {
      const res = await api.toggleWishlist(product.id);
      setWishlistIds(res.productIds);
      setWishlistItems(res.products);
      if (res.isInWishlist) {
        addToast(`Added "${product.name}" to your wishlist!`, 'success');
      } else {
        addToast(`Removed from wishlist`, 'info');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update wishlist', 'error');
    }
  };

  const isInWishlist = (productId) => wishlistIds.includes(productId);

  // Navigation & Routing State
  const [currentPage, setCurrentPage] = useState('home');
  const [pageParams, setPageParams] = useState({});

  const navigate = (page, params = {}) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
    setPageParams(params);
  };

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Initial Load
  useEffect(() => {
    if (localStorage.getItem('token')) {
      refreshCart();
      refreshWishlist();
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        user,
        setUser,
        login,
        logout,
        authModalOpen,
        setAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        cart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        refreshCart,
        wishlistIds,
        wishlistItems,
        toggleWishlist,
        isInWishlist,
        refreshWishlist,
        currentPage,
        pageParams,
        navigate,
        quickViewProduct,
        setQuickViewProduct,
        toasts,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
