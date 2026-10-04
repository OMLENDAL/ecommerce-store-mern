import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  ShoppingBag,
  Heart,
  Search,
  Sun,
  Moon,
  User,
  ShieldCheck,
  Package,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export const Navbar = () => {
  const {
    theme,
    toggleTheme,
    user,
    logout,
    setAuthModalOpen,
    setAuthModalMode,
    cart,
    wishlistIds,
    setIsCartDrawerOpen,
    navigate,
    currentPage
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Live auto-suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.getProducts({ keyword: searchQuery, limit: 5 });
        setSearchResults(res.products || []);
        setIsSearchOpen(true);
      } catch (err) {
        console.error(err);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener for search & dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('shop', { keyword: searchQuery.trim() });
      setIsSearchOpen(false);
    }
  };

  const handleSelectProduct = (product) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    navigate('product-detail', { id: product.id });
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000, width: '100%' }}>
      {/* Top Promotional Bar */}
      <div
        style={{
          background: 'var(--accent-gradient)',
          color: '#ffffff',
          fontSize: '0.8rem',
          fontWeight: 600,
          padding: '8px 16px',
          textAlign: 'center',
          letterSpacing: '0.02em',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}
      >
        <Sparkles size={14} />
        <span>Use coupon <strong>WELCOME50</strong> for $50 OFF | Free Worldwide Express Shipping on orders over $150</span>
      </div>

      {/* Main Navigation Bar */}
      <nav
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div
          className="app-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '72px',
            gap: '20px'
          }}
        >
          {/* Logo */}
          <div
            onClick={() => navigate('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 4px 12px var(--accent-glow)'
              }}
            >
              <ShoppingBag size={20} strokeWidth={2.5} />
            </div>
            <div>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'var(--font-heading)' }}>
                AURA<span className="gradient-text">LUXE</span>
              </span>
              <span style={{ display: 'block', fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.15em', fontWeight: 700, textTransform: 'uppercase' }}>
                Store & Studio
              </span>
            </div>
          </div>

          <div style={{ alignItems: 'center', gap: '24px' }} className="desktop-links">
            <button
              onClick={() => navigate('home')}
              style={{
                fontWeight: 600,
                fontSize: '0.92rem',
                color: currentPage === 'home' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                borderBottom: currentPage === 'home' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                padding: '6px 0',
                transition: 'all var(--transition-fast)'
              }}
            >
              Home
            </button>
            <button
              onClick={() => navigate('shop')}
              style={{
                fontWeight: 600,
                fontSize: '0.92rem',
                color: currentPage === 'shop' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                borderBottom: currentPage === 'shop' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                padding: '6px 0',
                transition: 'all var(--transition-fast)'
              }}
            >
              Shop All
            </button>
            <button
              onClick={() => navigate('shop', { category: 'Electronics & Gadgets' })}
              style={{
                fontWeight: 600,
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                padding: '6px 0'
              }}
            >
              Electronics
            </button>
            <button
              onClick={() => navigate('shop', { category: 'Fashion & Apparel' })}
              style={{
                fontWeight: 600,
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                padding: '6px 0'
              }}
            >
              Fashion
            </button>
            <button
              onClick={() => navigate('shop', { category: 'Home & Workspace' })}
              style={{
                fontWeight: 600,
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                padding: '6px 0'
              }}
            >
              Living
            </button>
          </div>

          {/* Search Bar with Auto Suggestions */}
          <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: '380px' }}>
            <form onSubmit={handleSearchSubmit}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 14px',
                  border: '1px solid var(--border-medium)',
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                <Search size={16} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                <input
                  type="text"
                  placeholder="Search products, brands, tech..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setIsSearchOpen(true)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    boxShadow: 'none',
                    padding: '4px 0',
                    fontSize: '0.88rem',
                    width: '100%',
                    color: 'var(--text-primary)'
                  }}
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} style={{ color: 'var(--text-muted)' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>

            {/* Auto Suggestions Popover */}
            {isSearchOpen && (
              <div
                className="glass-panel animate-fade-in"
                style={{
                  position: 'absolute',
                  top: '110%',
                  left: 0,
                  right: 0,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-xl)',
                  overflow: 'hidden',
                  zIndex: 200
                }}
              >
                {searchResults.length > 0 ? (
                  <div>
                    <div style={{ padding: '8px 12px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', textTransform: 'uppercase' }}>
                      Suggested Products
                    </div>
                    {searchResults.map(prod => (
                      <div
                        key={prod.id}
                        onClick={() => handleSelectProduct(prod)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--border-subtle)',
                          transition: 'background var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <img
                          src={(prod.images && prod.images[0]) || ''}
                          alt={prod.name}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {prod.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {prod.category} • <strong style={{ color: 'var(--accent-primary)' }}>${prod.price}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div
                      onClick={handleSearchSubmit}
                      style={{
                        padding: '10px',
                        textAlign: 'center',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        color: 'var(--accent-primary)',
                        cursor: 'pointer',
                        background: 'var(--bg-tertiary)'
                      }}
                    >
                      View all results for "{searchQuery}" →
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    No products found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons (Theme, Wishlist, Cart, User) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark/Light Mode"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                transition: 'background var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {theme === 'dark' ? <Sun size={20} color="#f59e0b" /> : <Moon size={20} />}
            </button>

            {/* Wishlist Link */}
            <button
              onClick={() => navigate('wishlist')}
              aria-label="Wishlist"
              style={{
                position: 'relative',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                transition: 'background var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Heart size={20} />
              {wishlistIds.length > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  {wishlistIds.length}
                </span>
              )}
            </button>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              aria-label="Shopping Cart"
              style={{
                position: 'relative',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                transition: 'background var(--transition-fast)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <ShoppingBag size={20} />
              {cart.totalCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px var(--accent-glow)'
                  }}
                >
                  {cart.totalCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Dropdown */}
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              {user ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 8px 4px 4px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      transition: 'border-color var(--transition-fast)'
                    }}
                  >
                    <img
                      src={user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=User'}
                      alt={user.name}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} color="var(--text-muted)" />
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div
                      className="glass-panel animate-fade-in"
                      style={{
                        position: 'absolute',
                        top: '115%',
                        right: 0,
                        width: '230px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-xl)',
                        padding: '8px 0',
                        zIndex: 200
                      }}
                    >
                      <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                        {user.role === 'admin' && (
                          <div style={{ marginTop: '6px' }}>
                            <span className="badge badge-featured">Administrator</span>
                          </div>
                        )}
                      </div>

                      <div style={{ padding: '4px 0' }}>
                        <button
                          onClick={() => { setUserDropdownOpen(false); navigate('orders'); }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text-primary)', textAlign: 'left' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Package size={16} color="var(--accent-primary)" />
                          My Orders & Tracking
                        </button>

                        <button
                          onClick={() => { setUserDropdownOpen(false); navigate('wishlist'); }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text-primary)', textAlign: 'left' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Heart size={16} color="#ec4899" />
                          My Wishlist ({wishlistIds.length})
                        </button>

                        {user.role === 'admin' && (
                          <button
                            onClick={() => { setUserDropdownOpen(false); navigate('admin'); }}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '0.85rem', color: 'var(--text-primary)', textAlign: 'left', fontWeight: 600 }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-tertiary)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <ShieldCheck size={16} color="#10b981" />
                            Admin Control Center
                          </button>
                        )}

                        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }}></div>

                        <button
                          onClick={() => { setUserDropdownOpen(false); logout(); }}
                          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', fontSize: '0.85rem', color: '#ef4444', textAlign: 'left' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
                  className="btn-primary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  <User size={15} />
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)'
              }}
              className="mobile-hamburger-btn"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <button onClick={() => { setMobileMenuOpen(false); navigate('home'); }} style={{ textAlign: 'left', fontWeight: 600, padding: '8px 0' }}>Home</button>
            <button onClick={() => { setMobileMenuOpen(false); navigate('shop'); }} style={{ textAlign: 'left', fontWeight: 600, padding: '8px 0' }}>Shop All</button>
            <button onClick={() => { setMobileMenuOpen(false); navigate('shop', { category: 'Electronics & Gadgets' }); }} style={{ textAlign: 'left', fontWeight: 600, padding: '8px 0' }}>Electronics</button>
            <button onClick={() => { setMobileMenuOpen(false); navigate('shop', { category: 'Fashion & Apparel' }); }} style={{ textAlign: 'left', fontWeight: 600, padding: '8px 0' }}>Fashion</button>
            <button onClick={() => { setMobileMenuOpen(false); navigate('shop', { category: 'Home & Workspace' }); }} style={{ textAlign: 'left', fontWeight: 600, padding: '8px 0' }}>Home & Living</button>
            {user?.role === 'admin' && (
              <button onClick={() => { setMobileMenuOpen(false); navigate('admin'); }} style={{ textAlign: 'left', fontWeight: 600, padding: '8px 0', color: 'var(--accent-primary)' }}>Admin Portal</button>
            )}
          </div>
        )}
      </nav>

      {/* Embedded CSS for responsive breakpoint */}
      <style>{`
        @media (max-width: 900px) {
          .desktop-links {
            display: none !important;
          }
          .mobile-hamburger-btn {
            display: flex !important;
          }
        }
        @media (min-width: 901px) {
          .desktop-links {
            display: flex !important;
          }
          .mobile-hamburger-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};
