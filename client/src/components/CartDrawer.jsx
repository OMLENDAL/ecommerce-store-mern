import React from 'react';
import { useApp } from '../context/AppContext';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';

export const CartDrawer = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateCartQty,
    removeFromCart,
    navigate
  } = useApp();

  if (!isCartDrawerOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 150;
  const progressPercent = Math.min(100, ((cart.subtotal || 0) / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - (cart.subtotal || 0));

  const handleCheckout = () => {
    setIsCartDrawerOpen(false);
    navigate('checkout');
  };

  const handleViewCart = () => {
    setIsCartDrawerOpen(false);
    navigate('cart');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={() => setIsCartDrawerOpen(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          animation: 'fadeIn 0.25s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Your Shopping Bag</h3>
            <span className="badge badge-featured">{cart.totalCount || 0}</span>
          </div>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div style={{ padding: '14px 24px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {remainingForFreeShipping === 0 ? (
              <span style={{ color: '#10b981' }}>🎉 Congratulations! You have unlocked <strong>FREE Express Shipping</strong>!</span>
            ) : (
              <span>Add <strong>${remainingForFreeShipping.toFixed(2)}</strong> more to get <strong>FREE Express Shipping</strong>!</span>
            )}
          </div>
          <div style={{ width: '100%', height: '6px', background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: remainingForFreeShipping === 0 ? '#10b981' : 'var(--accent-gradient)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>

        {/* Item List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {cart.items && cart.items.length > 0 ? (
            cart.items.map((item) => (
              <div
                key={item.itemId || item.productId}
                style={{
                  display: 'flex',
                  gap: '14px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                {/* Thumbnail */}
                <img
                  src={item.product?.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'}
                  alt={item.product?.name}
                  style={{ width: '74px', height: '74px', objectFit: 'cover', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)' }}
                />

                {/* Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.3 }}>{item.product?.name}</h4>
                      <button
                        onClick={() => removeFromCart(item.itemId || item.productId)}
                        style={{ color: 'var(--text-muted)', height: 'fit-content' }}
                        title="Remove item"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {item.selectedColor !== 'Standard' && `Color: ${item.selectedColor} `}
                      {item.selectedSize !== 'Standard' && `• Size: ${item.selectedSize}`}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      ${((item.product?.price || 0) * (item.qty || 1)).toFixed(2)}
                    </div>

                    {/* Qty Stepper */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-full)',
                        padding: '2px 8px',
                        background: 'var(--bg-tertiary)'
                      }}
                    >
                      <button
                        onClick={() => updateCartQty(item.itemId, item.productId, Math.max(1, item.qty - 1))}
                        disabled={item.qty <= 1}
                        style={{ opacity: item.qty <= 1 ? 0.4 : 1, display: 'flex', alignItems: 'center' }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.itemId, item.productId, item.qty + 1)}
                        style={{ display: 'flex', alignItems: 'center' }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--text-muted)' }}>
                <ShoppingBag size={28} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Your bag is empty</h4>
              <p style={{ fontSize: '0.88rem', marginBottom: '24px' }}>Explore our featured collection and discover state-of-the-art products.</p>
              <button
                onClick={() => { setIsCartDrawerOpen(false); navigate('shop'); }}
                className="btn-primary"
                style={{ fontSize: '0.88rem' }}
              >
                Start Shopping Now
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {cart.items && cart.items.length > 0 && (
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Subtotal</span>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ${(cart.subtotal || 0).toFixed(2)}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Taxes and coupons calculated at checkout.
            </p>

            <button
              onClick={handleCheckout}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
            >
              Checkout Now <ArrowRight size={18} />
            </button>

            <button
              onClick={handleViewCart}
              className="btn-secondary"
              style={{ width: '100%', padding: '12px', fontSize: '0.88rem' }}
            >
              View Full Cart & Apply Promo Code
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Safe & Secure 256-Bit SSL Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
