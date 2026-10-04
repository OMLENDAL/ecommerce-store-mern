import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import {
  Star,
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ThumbsUp,
  MessageSquare,
  ChevronRight,
  Minus,
  Plus
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { pageParams, addToCart, toggleWishlist, isInWishlist, navigate, user, addToast } = useApp();
  const productId = pageParams.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  // Variant selections
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.getProductById(productId);
        setProduct(data);
        setReviews(data.reviews || []);
        if (data.variants?.colors?.length > 0) setSelectedColor(data.variants.colors[0]);
        if (data.variants?.sizes?.length > 0) setSelectedSize(data.variants.sizes[0]);
        setSelectedImageIdx(0);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="app-container" style={{ padding: '60px 24px' }}>
        <div className="skeleton" style={{ height: '480px', borderRadius: 'var(--radius-xl)' }} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="app-container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>The product you requested does not exist or was removed.</p>
        <button onClick={() => navigate('shop')} className="btn-primary" style={{ marginTop: '20px' }}>
          Back to Shop
        </button>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const images = (product.images && product.images.length > 0) ? product.images : [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80'
  ];

  const handleAddToCart = () => {
    addToCart(product.id, qty, selectedColor || 'Standard', selectedSize || 'Standard');
  };

  const handleBuyNow = () => {
    addToCart(product.id, qty, selectedColor || 'Standard', selectedSize || 'Standard');
    navigate('checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast('Please log in to submit a customer review', 'info');
      return;
    }
    if (!reviewComment.trim()) {
      addToast('Please write a review comment', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const newRev = await api.createReview(product.id, {
        rating: reviewRating,
        comment: reviewComment
      });
      setReviews([newRev, ...reviews]);
      setReviewComment('');
      addToast('Thank you! Your verified review has been published.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleVoteHelpful = async (reviewId) => {
    try {
      const res = await api.voteHelpful(reviewId);
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, helpfulCount: res.helpfulCount } : r));
      addToast('Marked review as helpful', 'success');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="app-container" style={{ padding: '24px 24px 80px' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('home')}>Home</span>
        <ChevronRight size={14} />
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('shop', { category: product.category })}>{product.category}</span>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{product.name}</span>
      </div>

      {/* Main Product Showcase (Left: Gallery | Right: Info) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '48px',
          alignItems: 'start'
        }}
      >
        {/* Left: Gallery & Zoom Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            className="glass-panel"
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '85%',
              borderRadius: 'var(--radius-xl)',
              overflow: 'hidden',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <img
              src={images[selectedImageIdx]}
              alt={product.name}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.4s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />

            {product.discount > 0 && (
              <span className="badge badge-sale" style={{ position: 'absolute', top: '16px', left: '16px' }}>
                -{product.discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: selectedImageIdx === idx ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                    opacity: selectedImageIdx === idx ? 1 : 0.65,
                    flexShrink: 0
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Cart Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {product.brand || 'AURA COLLECTION'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 600 }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                <span>{product.rating || '5.0'}</span>
                <span style={{ color: 'var(--text-muted)' }}>({reviews.length} reviews)</span>
              </div>
            </div>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '16px' }}>
              {product.name}
            </h1>

            {/* Price Row */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginBottom: '16px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800 }}>${product.price}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ${product.originalPrice}
                </span>
              )}
              <span className={`badge ${product.stock > 0 ? 'badge-stock-in' : 'badge-stock-out'}`}>
                {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
              </span>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
              {product.description}
            </p>
          </div>

          {/* Color Variants */}
          {product.variants?.colors && product.variants.colors.length > 0 && product.variants.colors[0] !== 'Standard' && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
                Color: <span style={{ color: 'var(--accent-primary)' }}>{selectedColor}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {product.variants.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      border: selectedColor === c ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                      background: selectedColor === c ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-secondary)',
                      color: selectedColor === c ? 'var(--accent-primary)' : 'var(--text-primary)'
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Variants */}
          {product.variants?.sizes && product.variants.sizes.length > 0 && product.variants.sizes[0] !== 'Standard' && (
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
                Size: <span style={{ color: 'var(--accent-primary)' }}>{selectedSize}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {product.variants.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      border: selectedSize === s ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                      background: selectedSize === s ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-secondary)',
                      color: selectedSize === s ? 'var(--accent-primary)' : 'var(--text-primary)'
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Add to Bag / Buy Now */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginTop: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-full)',
                padding: '6px 16px',
                background: 'var(--bg-tertiary)'
              }}
            >
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                disabled={qty <= 1}
                style={{ opacity: qty <= 1 ? 0.4 : 1, display: 'flex' }}
              >
                <Minus size={16} />
              </button>
              <span style={{ fontSize: '1rem', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                {qty}
              </span>
              <button
                onClick={() => setQty(Math.min(product.stock, qty + 1))}
                disabled={qty >= product.stock}
                style={{ opacity: qty >= product.stock ? 0.4 : 1, display: 'flex' }}
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="btn-primary"
              style={{ flex: 1, minWidth: '160px', padding: '14px', fontSize: '0.95rem' }}
            >
              <ShoppingBag size={18} />
              Add to Shopping Bag
            </button>

            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontWeight: 700,
                padding: '14px 24px',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.95rem'
              }}
            >
              <Zap size={18} />
              Buy Now
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isFavorited ? '#ef4444' : 'var(--text-muted)'
              }}
            >
              <Heart size={20} fill={isFavorited ? '#ef4444' : 'none'} />
            </button>
          </div>

          {/* Trust Guarantees */}
          <div style={{ marginTop: '16px', padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-tertiary)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
              <Truck size={18} color="var(--accent-primary)" /> Free Global Delivery
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
              <RotateCcw size={18} color="#10b981" /> 30-Day Money Back
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
              <ShieldCheck size={18} color="#ec4899" /> 2-Year Official Warranty
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Features Tab */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <section style={{ marginTop: '64px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px' }}>Technical Specifications</h2>
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            {Object.entries(product.specs).map(([k, v], idx) => (
              <div
                key={k}
                style={{
                  display: 'flex',
                  padding: '14px 20px',
                  background: idx % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                  borderBottom: '1px solid var(--border-subtle)',
                  fontSize: '0.9rem'
                }}
              >
                <div style={{ width: '220px', fontWeight: 700, color: 'var(--text-secondary)' }}>{k}</div>
                <div style={{ flex: 1, color: 'var(--text-primary)' }}>{v}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Verified Reviews Section */}
      <section style={{ marginTop: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Customer Reviews & Ratings</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', color: '#f59e0b' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} size={16} fill={s <= Math.round(product.rating || 5) ? '#f59e0b' : 'none'} color="#f59e0b" />
                ))}
              </div>
              <span style={{ fontWeight: 700 }}>{product.rating || '5.0'} out of 5</span>
              <span style={{ color: 'var(--text-muted)' }}>({reviews.length} verified reviews)</span>
            </div>
          </div>
        </div>

        {/* Submit Review Box */}
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>Write a Review</h3>
          <form onSubmit={handleReviewSubmit}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Your Rating:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setReviewRating(st)}
                    style={{ color: '#f59e0b', padding: '2px' }}
                  >
                    <Star size={20} fill={st <= reviewRating ? '#f59e0b' : 'none'} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows="3"
              placeholder="Share details of your experience with this item (e.g. build quality, comfort, real-world performance)..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              style={{ width: '100%', marginBottom: '12px', fontSize: '0.9rem' }}
            />

            <button
              type="submit"
              disabled={submittingReview}
              className="btn-primary"
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              {submittingReview ? 'Submitting...' : 'Post Customer Review'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.length > 0 ? (
            reviews.map(r => (
              <div key={r.id} className="glass-panel" style={{ padding: '20px', background: 'var(--bg-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={r.userAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Verified'}
                      alt=""
                      style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{r.userName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                        <Check size={12} strokeWidth={3} /> Verified Buyer • {new Date(r.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', color: '#f59e0b' }}>
                    {[1, 2, 3, 4, 5].map(st => (
                      <Star key={st} size={14} fill={st <= (r.rating || 5) ? '#f59e0b' : 'none'} color="#f59e0b" />
                    ))}
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: '12px' }}>
                  {r.comment}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleVoteHelpful(r.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border-medium)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    <ThumbsUp size={12} /> Helpful ({r.helpfulCount || 0})
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Be the first verified customer to review this product!</p>
          )}
        </div>
      </section>

      {/* Related Products */}
      {product.related && product.related.length > 0 && (
        <section style={{ marginTop: '72px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}>
            Frequently Bought Together
          </h2>
          <div className="grid-responsive-cards">
            {product.related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
