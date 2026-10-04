import React from 'react';
import { useApp } from '../context/AppContext';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export const WishlistPage = () => {
  const { wishlistItems, toggleWishlist, addToCart, navigate } = useApp();

  return (
    <div className="app-container" style={{ padding: '32px 24px 80px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>My Wishlist</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
          {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
        </p>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="grid-responsive-cards">
          {wishlistItems.map((prod) => (
            <div
              key={prod.id}
              className="glass-panel"
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: 'var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ position: 'relative', width: '100%', paddingTop: '90%', overflow: 'hidden' }}>
                <img
                  src={(prod.images && prod.images[0]) || ''}
                  alt={prod.name}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => navigate('product-detail', { id: prod.id })}
                />
                <button
                  onClick={() => toggleWishlist(prod)}
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444'
                  }}
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  {prod.category}
                </span>

                <h3
                  style={{ fontSize: '1rem', fontWeight: 700, cursor: 'pointer', lineHeight: 1.35 }}
                  onClick={() => navigate('product-detail', { id: prod.id })}
                >
                  {prod.name}
                </h3>

                <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>${prod.price}</div>
                  <button
                    onClick={() => {
                      addToCart(prod.id, 1, prod.variants?.colors?.[0] || 'Standard', prod.variants?.sizes?.[0] || 'Standard');
                      toggleWishlist(prod);
                    }}
                    className="btn-primary"
                    style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                  >
                    <ShoppingBag size={14} /> Move to Bag
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--text-muted)' }}>
            <Heart size={36} />
          </div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Your Wishlist is Empty</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Click the heart icon on any product to save it to your wishlist.</p>
          <button onClick={() => navigate('shop')} className="btn-primary">
            Discover Products
          </button>
        </div>
      )}
    </div>
  );
};
