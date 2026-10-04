import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  Check,
  RotateCcw
} from 'lucide-react';

export const CartPage = () => {
  const {
    cart,
    updateCartQty,
    removeFromCart,
    clearCart,
    navigate,
    addToast
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const subtotal = cart.subtotal || 0;
  let discountAmount = 0;

  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = subtotal > 0 ? parseFloat((taxableAmount * 0.08).toFixed(2)) : 0;
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const total = parseFloat((taxableAmount + tax + shipping).toFixed(2));

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    try {
      setValidatingCoupon(true);
      const res = await api.validateCoupon(couponInput.trim(), subtotal);
      setAppliedCoupon(res);
      addToast(res.message, 'success');
    } catch (err) {
      addToast(err.message || 'Invalid coupon code', 'error');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    navigate('checkout', {
      couponCode: appliedCoupon?.code,
      discountAmount
    });
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="app-container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--text-muted)' }}>
          <ShoppingBag size={36} />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px' }}>Your Shopping Bag is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
          Looks like you haven't added anything yet. Explore our handcrafted electronics, apparel, and workspace essentials.
        </p>
        <button onClick={() => navigate('shop')} className="btn-primary" style={{ padding: '14px 28px' }}>
          Browse Catalog Now
        </button>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ padding: '32px 24px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Shopping Bag</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Review your selected items ({cart.totalCount} total) before checkout
          </p>
        </div>
        <button
          onClick={clearCart}
          style={{ fontSize: '0.85rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RotateCcw size={14} /> Clear Bag
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '40px', alignItems: 'start' }}>
        {/* Left Column: Items Table */}
        <div className="glass-panel" style={{ overflow: 'hidden', background: 'var(--bg-secondary)' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: '16px' }}>
            <span>Product</span>
            <span>Quantity</span>
            <span>Total</span>
            <span></span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {cart.items.map(item => (
              <div
                key={item.itemId || item.productId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 40px',
                  gap: '16px',
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--border-subtle)',
                  alignItems: 'center'
                }}
              >
                {/* Product Thumbnail & Details */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img
                    src={item.product?.image}
                    alt={item.product?.name}
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)' }}
                  />
                  <div>
                    <h4
                      style={{ fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', lineHeight: 1.3 }}
                      onClick={() => navigate('product-detail', { id: item.productId })}
                    >
                      {item.product?.name}
                    </h4>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      ${item.product?.price} each
                      {item.selectedColor !== 'Standard' && ` • ${item.selectedColor}`}
                      {item.selectedSize !== 'Standard' && ` • ${item.selectedSize}`}
                    </div>
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-full)',
                    padding: '4px 10px',
                    background: 'var(--bg-tertiary)',
                    width: 'fit-content'
                  }}
                >
                  <button
                    onClick={() => updateCartQty(item.itemId, item.productId, Math.max(1, item.qty - 1))}
                    disabled={item.qty <= 1}
                    style={{ opacity: item.qty <= 1 ? 0.3 : 1, display: 'flex' }}
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>
                    {item.qty}
                  </span>
                  <button
                    onClick={() => updateCartQty(item.itemId, item.productId, item.qty + 1)}
                    style={{ display: 'flex' }}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* Item Total */}
                <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                  ${((item.product?.price || 0) * (item.qty || 1)).toFixed(2)}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFromCart(item.itemId || item.productId)}
                  style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                  title="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Coupon Code Card */}
          <div className="glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={16} color="var(--accent-primary)" /> Apply Discount Code
            </h3>
            <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="e.g. SAVE20 or WELCOME50"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                style={{ flex: 1, textTransform: 'uppercase', fontWeight: 600, fontSize: '0.9rem' }}
              />
              <button
                type="submit"
                disabled={validatingCoupon}
                className="btn-secondary"
                style={{ padding: '10px 18px', fontSize: '0.85rem' }}
              >
                {validatingCoupon ? 'Validating...' : 'Apply'}
              </button>
            </form>

            {appliedCoupon && (
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} /> {appliedCoupon.code} applied (-${discountAmount.toFixed(2)})
                </span>
                <button onClick={() => setAppliedCoupon(null)} style={{ color: '#ef4444', fontSize: '0.78rem' }}>Remove</button>
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="glass-panel" style={{ padding: '28px', background: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>Order Summary</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal ({cart.totalCount} items)</span>
                <span style={{ fontWeight: 700 }}>${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                  <span>Coupon Discount</span>
                  <span style={{ fontWeight: 700 }}>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated Shipping</span>
                <span style={{ fontWeight: 700 }}>{shipping === 0 ? <span style={{ color: '#10b981' }}>FREE</span> : `$${shipping.toFixed(2)}`}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Estimated Tax (8%)</span>
                <span style={{ fontWeight: 700 }}>${tax.toFixed(2)}</span>
              </div>

              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '6px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>Total</span>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem', marginTop: '24px' }}
            >
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '16px' }}>
              <ShieldCheck size={16} color="#10b981" />
              <span>Bank-Grade 256-Bit SSL Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
