import React from 'react';
import { useApp } from '../context/AppContext';
import { Star, Heart, ShoppingBag, Eye } from 'lucide-react';

export const ProductCard = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, navigate, setQuickViewProduct } = useApp();

  const isFavorited = isInWishlist(product.id);
  const mainImage = (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80';

  return (
    <div
      className="glass-panel"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
    >
      {/* Image Container with Badges & Actions */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '90%', // aspect ratio
          overflow: 'hidden',
          backgroundColor: 'var(--bg-tertiary)',
          cursor: 'pointer'
        }}
        onClick={() => navigate('product-detail', { id: product.id })}
      >
        <img
          src={mainImage}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          loading="lazy"
        />

        {/* Badges */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 2 }}>
          {product.discount > 0 && (
            <span className="badge badge-sale">
              -{product.discount}% OFF
            </span>
          )}
          {product.isFeatured && (
            <span className="badge badge-featured">
              Featured
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label="Wishlist"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-subtle)',
            color: isFavorited ? '#ef4444' : 'var(--text-muted)',
            transition: 'transform var(--transition-fast), color var(--transition-fast)',
            zIndex: 3
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Heart size={18} fill={isFavorited ? '#ef4444' : 'none'} />
        </button>

        {/* Quick View Button on overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setQuickViewProduct(product);
          }}
          aria-label="Quick View"
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            padding: '6px 10px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(15, 23, 42, 0.75)',
            color: '#ffffff',
            backdropFilter: 'blur(6px)',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            zIndex: 2,
            transition: 'background var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.95)'}
        >
          <Eye size={13} /> Quick View
        </button>
      </div>

      {/* Content Details */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '8px' }}>
        {/* Category & Rating */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--accent-primary)', fontWeight: 600, letterSpacing: '0.02em' }}>
            {product.category || 'General'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 600 }}>
            <Star size={14} fill="#f59e0b" color="#f59e0b" />
            <span>{product.rating || '5.0'}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({product.numReviews || 0})</span>
          </div>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.35,
            cursor: 'pointer',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            height: '2.7em'
          }}
          onClick={() => navigate('product-detail', { id: product.id })}
        >
          {product.name}
        </h3>

        {/* Price & Add to Cart button */}
        <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ${product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.72rem', color: product.stock > 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
              {product.stock > 0 ? (product.stock < 10 ? `Only ${product.stock} left in stock!` : 'In Stock') : 'Out of Stock'}
            </div>
          </div>

          <button
            onClick={() => addToCart(product.id, 1, product.variants?.colors?.[0] || 'Standard', product.variants?.sizes?.[0] || 'Standard')}
            disabled={product.stock <= 0}
            className="btn-primary"
            style={{
              padding: '9px 14px',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-full)',
              opacity: product.stock <= 0 ? 0.5 : 1,
              cursor: product.stock <= 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <ShoppingBag size={15} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
