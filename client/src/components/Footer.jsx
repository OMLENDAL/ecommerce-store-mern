import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, ArrowRight, ShieldCheck, Truck, RotateCcw, Headphones, Heart } from 'lucide-react';

export const Footer = () => {
  const { navigate, addToast } = useApp();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast('Please enter a valid email address', 'error');
      return;
    }
    addToast('🎉 Subscribed! Check your inbox for 15% off your next order.', 'success');
    setEmail('');
  };

  return (
    <footer style={{ marginTop: 'auto', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
      {/* Trust Badges Bar */}
      <div style={{ borderBottom: '1px solid var(--border-subtle)', padding: '36px 0' }}>
        <div
          className="app-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Free Global Express</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>On all orders above $150</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCcw size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>30-Day Money Back</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hassle-free instant returns</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>100% Encrypted Payment</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PCI-DSS Level 1 compliant</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Headphones size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Dedicated 24/7 Care</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Instant live chat & phone support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="app-container" style={{ padding: '60px 24px 40px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px'
          }}
        >
          {/* Brand Info */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <ShoppingBag size={18} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                AURA<span className="gradient-text">LUXE</span>
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
              Crafting premium online shopping experiences with curated high-performance lifestyle, audio, tech gadgets, and design essentials.
            </p>
          </div>

          {/* Quick Shop Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.02em' }}>Quick Shop</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <li><button onClick={() => navigate('shop', { category: 'Electronics & Gadgets' })} style={{ color: 'inherit' }}>Electronics & Tech</button></li>
              <li><button onClick={() => navigate('shop', { category: 'Fashion & Apparel' })} style={{ color: 'inherit' }}>Fashion & Streetwear</button></li>
              <li><button onClick={() => navigate('shop', { category: 'Audio & Sound' })} style={{ color: 'inherit' }}>Hi-Fi Studio Audio</button></li>
              <li><button onClick={() => navigate('shop', { category: 'Home & Workspace' })} style={{ color: 'inherit' }}>Home & Workspace</button></li>
              <li><button onClick={() => navigate('shop', { sort: 'newest' })} style={{ color: 'inherit' }}>New Arrivals</button></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px', letterSpacing: '0.02em' }}>Customer Care</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <li><button onClick={() => navigate('orders')} style={{ color: 'inherit' }}>Track Your Order</button></li>
              <li><button onClick={() => navigate('cart')} style={{ color: 'inherit' }}>Shopping Cart</button></li>
              <li><button onClick={() => navigate('wishlist')} style={{ color: 'inherit' }}>Saved Wishlist</button></li>
              <li><a href="#returns" onClick={(e) => { e.preventDefault(); addToast('Returns portal active. 30 days money-back.', 'info'); }} style={{ color: 'inherit' }}>Shipping & Returns</a></li>
              <li><a href="#support" onClick={(e) => { e.preventDefault(); addToast('Support hotline: support@auraluxe.store', 'info'); }} style={{ color: 'inherit' }}>Contact Helpdesk</a></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div style={{ gridColumn: 'span 1' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>Join the Inner Circle</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Subscribe for VIP drop alerts, secret discount codes, and tech innovations.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '10px 16px', borderRadius: 'var(--radius-md)' }}>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            marginTop: '40px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            fontSize: '0.82rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            © {new Date().getFullYear()} AURA LUXE Commerce. Built with React & Node.js Express.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Cookie Settings</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
