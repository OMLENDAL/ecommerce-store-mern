import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Star, Heart, ShoppingBag, ArrowRight } from 'lucide-react';

export const QuickViewModal = () => {
  const {
    quickViewProduct,
    setQuickViewProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    navigate
  } = useApp();

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const isFavorited = isInWishlist(product.id);
  const colors = product.variants?.colors || ['Standard'];
  const sizes = product.variants?.sizes || ['Standard'];
  const currentColor = selectedColor || colors[0];
  const currentSize = selectedSize || sizes[0];
  const images = (product.images && product.images.length > 0) ? product.images : [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80'
  ];

  const handleAddToCart = () => {
    addToCart(product.id, qty, currentColor, currentSize);
    setQuickViewProduct(null);
  };

  const handleViewFullPage = () => {
    setQuickViewProduct(null);
    navigate('product-detail', { id: product.id });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99998,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        padding: '16px'
      }}
      onClick={() => setQuickViewProduct(null)}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '850px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            color: 'var(--text-muted)',
            zIndex: 10,
            background: 'var(--bg-card)',
            borderRadius: '50%',
            padding: '6px',
            display: 'flex',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <X size={18} />
        </button>

        {/* Product Media Gallery */}
        <div style={{ padding: '24px', background: 'var(--bg-tertiary)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ position: 'relative', width: '100%', height: '340px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: '#fff' }}>
            <img
              src={images[activeImageIdx] || images[0]}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {product.discount > 0 && (
              <span className="badge badge-sale" style={{ position: 'absolute', top: '12px', left: '12px' }}>
                -{product.discount}% OFF
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt=""
                  onClick={() => setActiveImageIdx(idx)}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-md)',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: activeImageIdx === idx ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                    opacity: activeImageIdx === idx ? 1 : 0.65
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                {product.category}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                <span>{product.rating || '5.0'}</span>
                <span style={{ color: 'var(--text-muted)' }}>({product.numReviews || 0} reviews)</span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.3, marginBottom: '12px' }}>
              {product.name}
            </h2>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '14px' }}>
              <span style={{ fontSize: '1.65rem', fontWeight: 800 }}>${product.price}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ${product.originalPrice}
                </span>
              )}
              <span className={`badge ${product.stock > 0 ? 'badge-stock-in' : 'badge-stock-out'}`}>
                {product.stock > 0 ? `${product.stock} In Stock` : 'Sold Out'}
              </span>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              {product.description}
            </p>

            {/* Color Selector */}
            {colors.length > 0 && colors[0] !== 'Standard' && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '8px' }}>Color: <strong>{currentColor}</strong></div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {colors.map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: currentColor === col ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                        background: currentColor === col ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                        color: currentColor === col ? 'var(--accent-primary)' : 'var(--text-primary)'
                      }}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {sizes.length > 0 && sizes[0] !== 'Standard' && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '8px' }}>Size: <strong>{currentSize}</strong></div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {sizes.map(sz => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(sz)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: currentSize === sz ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                        background: currentSize === sz ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                        color: currentSize === sz ? 'var(--accent-primary)' : 'var(--text-primary)'
                      }}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="btn-primary"
                style={{ flex: 1, padding: '12px', fontSize: '0.95rem' }}
              >
                <ShoppingBag size={18} />
                Add to Bag
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isFavorited ? '#ef4444' : 'var(--text-muted)'
                }}
              >
                <Heart size={20} fill={isFavorited ? '#ef4444' : 'none'} />
              </button>
            </div>

            <button
              onClick={handleViewFullPage}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.85rem',
                color: 'var(--accent-primary)',
                fontWeight: 600
              }}
            >
              View Full Product Specifications & Customer Reviews <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
