import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  QrCode,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  MapPin,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

export const CheckoutPage = () => {
  const {
    cart,
    user,
    setAuthModalOpen,
    setAuthModalMode,
    pageParams,
    navigate,
    addToast
  } = useApp();

  // If user is not logged in, prompt sign in
  useEffect(() => {
    if (!user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      addToast('Please sign in or use 1-Click Demo Login to complete checkout', 'info');
    }
  }, [user]);

  // Shipping Form State
  const defaultAddr = (user?.addresses && user.addresses[0]) || {};
  const [shippingAddress, setShippingAddress] = useState({
    fullName: defaultAddr.fullName || user?.name || '',
    street: defaultAddr.street || '742 Evergreen Terrace',
    city: defaultAddr.city || 'Austin',
    state: defaultAddr.state || 'TX',
    zipCode: defaultAddr.zipCode || '78701',
    country: defaultAddr.country || 'United States',
    phone: defaultAddr.phone || '+1 (555) 876-5432'
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'upi' | 'cod'
  const [cardInfo, setCardInfo] = useState({
    number: '•••• •••• •••• 4242',
    name: user?.name || 'Sophia Martinez',
    expiry: '12/28',
    cvv: '888'
  });
  const [upiId, setUpiId] = useState('user@okaxis');

  // Checkout Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Price calculations
  const subtotal = cart.subtotal || 0;
  const couponCode = pageParams.couponCode || null;
  const discount = pageParams.discountAmount || 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = subtotal > 0 ? parseFloat((taxableAmount * 0.08).toFixed(2)) : 0;
  const shipping = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const total = parseFloat((taxableAmount + tax + shipping).toFixed(2));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }

    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      addToast('Please complete the shipping address fields', 'error');
      return;
    }

    try {
      setIsProcessing(true);

      const orderPayload = {
        items: cart.items.map(it => ({
          productId: it.productId,
          qty: it.qty,
          selectedColor: it.selectedColor,
          selectedSize: it.selectedSize
        })),
        shippingAddress,
        paymentMethod,
        couponCode
      };

      const newOrder = await api.createOrder(orderPayload);
      setCompletedOrder(newOrder);

      // Trigger Confetti Celebration!
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Confetti fallback
      }

      addToast('🎉 Order placed successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to process order', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // If order was completed, show Order Success confirmation screen
  if (completedOrder) {
    return (
      <div className="app-container" style={{ padding: '60px 24px', maxWidth: '720px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '48px', borderRadius: 'var(--radius-xl)', textAlign: 'center', background: 'var(--bg-secondary)' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle2 size={48} strokeWidth={2.5} />
          </div>

          <span className="badge badge-stock-in" style={{ fontSize: '0.85rem', padding: '6px 14px', marginBottom: '12px' }}>
            Order Verified & Confirmed
          </span>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginTop: '8px' }}>Thank You for Your Order!</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginTop: '6px' }}>
            We've sent a full receipt and confirmation email to <strong>{user?.email}</strong>.
          </p>

          {/* Order Details Card */}
          <div style={{ margin: '32px 0', padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-tertiary)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
              <strong style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{completedOrder.orderId}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Shipping To:</span>
              <span>{completedOrder.shippingAddress?.fullName}, {completedOrder.shippingAddress?.city} ({completedOrder.shippingAddress?.country})</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
              <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{completedOrder.paymentInfo?.method} ({completedOrder.paymentInfo?.status})</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '4px' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>Total Paid:</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>${completedOrder.totalAmount?.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('orders')}
              className="btn-primary"
              style={{ padding: '14px 28px', fontSize: '0.95rem' }}
            >
              Track Order & View Invoices <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('shop')}
              className="btn-secondary"
              style={{ padding: '14px 28px', fontSize: '0.95rem' }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty and no completed order
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="app-container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>No items in checkout</h2>
        <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>Add items to your cart before proceeding to checkout.</p>
        <button onClick={() => navigate('shop')} className="btn-primary" style={{ marginTop: '20px' }}>
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ padding: '32px 24px 80px' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>Secure Checkout</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '32px' }}>
        Complete your delivery address and payment details below
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '40px', alignItems: 'start' }}>
        {/* Left Column: Delivery Address & Payment Method */}
        <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Step 1: Shipping Address */}
          <div className="glass-panel" style={{ padding: '28px', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                1
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Delivery Information</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Recipient Full Name</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.fullName}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Street Address</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>City</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>State / Region</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Postal / ZIP Code</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Country</label>
                <input
                  type="text"
                  required
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="glass-panel" style={{ padding: '28px', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                2
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Payment Method</h2>
            </div>

            {/* Payment Method Selector Tabs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'card' ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                  background: paymentMethod === 'card' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-tertiary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  color: paymentMethod === 'card' ? 'var(--accent-primary)' : 'var(--text-primary)'
                }}
              >
                <CreditCard size={22} />
                Credit/Debit Card
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'upi' ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                  background: paymentMethod === 'upi' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-tertiary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  color: paymentMethod === 'upi' ? 'var(--accent-primary)' : 'var(--text-primary)'
                }}
              >
                <QrCode size={22} />
                UPI / NetBanking
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: paymentMethod === 'cod' ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                  background: paymentMethod === 'cod' ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-tertiary)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  color: paymentMethod === 'cod' ? 'var(--accent-primary)' : 'var(--text-primary)'
                }}
              >
                <Truck size={22} />
                Cash on Delivery
              </button>
            </div>

            {/* Payment Fields according to method */}
            {paymentMethod === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Card Number</label>
                  <input
                    type="text"
                    value={cardInfo.number}
                    onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                    style={{ width: '100%', fontFamily: 'monospace', letterSpacing: '0.1em' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Expiry Date</label>
                    <input
                      type="text"
                      value={cardInfo.expiry}
                      onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>CVV / CVC</label>
                    <input
                      type="password"
                      maxLength="4"
                      value={cardInfo.cvv}
                      onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'upi' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Virtual Payment Address (VPA / UPI ID)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@okhdfcbank"
                  style={{ width: '100%' }}
                />
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  A payment authorization request will be sent to your UPI app.
                </p>
              </div>
            )}

            {paymentMethod === 'cod' && (
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                Pay in cash directly to the courier agent upon parcel delivery at your doorstep.
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="btn-primary"
            style={{ padding: '16px', fontSize: '1.05rem', borderRadius: 'var(--radius-full)' }}
          >
            {isProcessing ? 'Processing Payment...' : `Complete Order ($${total.toFixed(2)})`} <Lock size={18} />
          </button>
        </form>

        {/* Right Column: Order Review */}
        <div className="glass-panel" style={{ padding: '28px', background: 'var(--bg-secondary)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>Items in Order ({cart.totalCount})</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '280px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
            {cart.items.map(item => (
              <div key={item.itemId || item.productId} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img
                  src={item.product?.image}
                  alt={item.product?.name}
                  style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-md)', objectFit: 'cover', background: 'var(--bg-tertiary)' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.product?.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Qty: {item.qty} {item.selectedColor !== 'Standard' && `• ${item.selectedColor}`}
                  </div>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  ${((item.product?.price || 0) * (item.qty || 1)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span style={{ fontWeight: 700 }}>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                <span>Discount ({couponCode})</span>
                <span style={{ fontWeight: 700 }}>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Shipping</span>
              <span style={{ fontWeight: 700 }}>{shipping === 0 ? <span style={{ color: '#10b981' }}>FREE</span> : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Estimated Tax</span>
              <span style={{ fontWeight: 700 }}>${tax.toFixed(2)}</span>
            </div>
            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>Total</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>Guaranteed safe checkout with 30-day money-back guarantee.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
