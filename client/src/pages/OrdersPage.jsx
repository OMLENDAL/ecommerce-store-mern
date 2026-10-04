import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  XCircle,
  FileText
} from 'lucide-react';

export const OrdersPage = () => {
  const { user, navigate, addToast } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [printableOrder, setPrintableOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getMyOrders();
      setOrders(res || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.cancelOrder(orderId);
      addToast('Order cancelled successfully', 'info');
      fetchOrders();
    } catch (err) {
      addToast(err.message || 'Failed to cancel order', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="badge badge-status-pending">Pending Approval</span>;
      case 'Processing':
        return <span className="badge badge-status-processing">Processing & Packing</span>;
      case 'Shipped':
        return <span className="badge badge-status-shipped">Shipped & In Transit</span>;
      case 'Delivered':
        return <span className="badge badge-status-delivered">Delivered Successfully</span>;
      case 'Cancelled':
        return <span className="badge badge-status-cancelled">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (!user) {
    return (
      <div className="app-container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>Sign In to View Orders</h2>
        <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}>You must be logged in to view your order history and tracking status.</p>
        <button onClick={() => navigate('home')} className="btn-primary" style={{ marginTop: '20px' }}>
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ padding: '32px 24px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>My Orders & Tracking</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Track live dispatch status, download invoices, and manage past purchases
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3].map(n => (
            <div key={n} className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map(order => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="glass-panel"
                style={{
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {/* Header Summary Row */}
                <div
                  style={{
                    padding: '20px 24px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    cursor: 'pointer'
                  }}
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                      <Package size={22} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>{order.orderId}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {order.items?.length || 0} items
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                        ${order.totalAmount?.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Payment: {order.paymentInfo?.method?.toUpperCase()}
                      </div>
                    </div>
                    <button style={{ color: 'var(--text-muted)' }}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', padding: '24px', background: 'var(--bg-tertiary)' }}>
                    {/* Visual Tracking Stepper Timeline */}
                    <div style={{ marginBottom: '32px' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '16px' }}>Order Tracking Timeline</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                        {(order.trackingTimeline || [
                          { status: 'Order Placed', time: order.createdAt, done: true },
                          { status: 'Processing', time: 'In progress', done: order.status !== 'Pending' },
                          { status: 'Shipped', time: 'Pending', done: order.status === 'Shipped' || order.status === 'Delivered' },
                          { status: 'Delivered', time: 'Pending', done: order.status === 'Delivered' }
                        ]).map((step, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '12px',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-secondary)',
                              borderLeft: `4px solid ${step.done ? '#10b981' : 'var(--border-medium)'}`,
                              boxShadow: 'var(--shadow-sm)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: step.done ? '#10b981' : 'var(--text-muted)' }}>
                              {step.done ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                              <span>{step.status}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              {step.time.includes('T') ? new Date(step.time).toLocaleDateString() : step.time}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ordered Items List */}
                    <div style={{ marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Items Purchased</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 16px',
                              background: 'var(--bg-secondary)',
                              borderRadius: 'var(--radius-md)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                              />
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                  Qty: {item.qty} {item.selectedColor !== 'Standard' && `• Color: ${item.selectedColor}`}
                                </div>
                              </div>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                              ${((item.price || 0) * (item.qty || 1)).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping Address & Actions */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <strong>Delivery Destination:</strong> {order.shippingAddress?.fullName}, {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.zipCode}
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        {/* Print Invoice Button */}
                        <button
                          onClick={() => setPrintableOrder(order)}
                          className="btn-secondary"
                          style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Printer size={15} /> Download Invoice
                        </button>

                        {/* Cancel order if eligible */}
                        {(order.status === 'Pending' || order.status === 'Processing') && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 'var(--radius-full)',
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#ef4444',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)' }}>
          <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>No orders placed yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>When you purchase items, their status and tracking updates will appear here.</p>
          <button onClick={() => navigate('shop')} className="btn-primary">
            Explore Store Catalog
          </button>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {printableOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setPrintableOrder(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 'var(--radius-lg)',
              padding: '36px',
              boxShadow: 'var(--shadow-xl)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>AURA LUXE COMMERCE</h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>TAX INVOICE & PROOF OF PURCHASE</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{printableOrder.orderId}</div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Date: {new Date(printableOrder.createdAt).toLocaleDateString()}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', fontSize: '0.88rem' }}>
              <div>
                <strong>Billed & Shipped To:</strong>
                <div>{printableOrder.shippingAddress?.fullName}</div>
                <div>{printableOrder.shippingAddress?.street}</div>
                <div>{printableOrder.shippingAddress?.city}, {printableOrder.shippingAddress?.zipCode}</div>
                <div>{printableOrder.shippingAddress?.country}</div>
              </div>
              <div>
                <strong>Payment & Fulfillment:</strong>
                <div>Method: {printableOrder.paymentInfo?.method?.toUpperCase()}</div>
                <div>Status: {printableOrder.paymentInfo?.status}</div>
                <div>Transaction: {printableOrder.paymentInfo?.transactionId}</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ textAlign: 'left', padding: '10px' }}>Description</th>
                  <th style={{ textAlign: 'center', padding: '10px' }}>Qty</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Rate</th>
                  <th style={{ textAlign: 'right', padding: '10px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {printableOrder.items?.map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px' }}>{it.name}</td>
                    <td style={{ textAlign: 'center', padding: '10px' }}>{it.qty}</td>
                    <td style={{ textAlign: 'right', padding: '10px' }}>${it.price?.toFixed(2)}</td>
                    <td style={{ textAlign: 'right', padding: '10px' }}>${((it.price || 0) * (it.qty || 1)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', fontSize: '0.9rem', marginBottom: '24px' }}>
              <div>Subtotal: <strong>${printableOrder.subtotal?.toFixed(2)}</strong></div>
              {printableOrder.discount > 0 && <div>Discount: <strong>-${printableOrder.discount?.toFixed(2)}</strong></div>}
              <div>Tax (8%): <strong>${printableOrder.tax?.toFixed(2)}</strong></div>
              <div>Shipping: <strong>${printableOrder.shippingFee === 0 ? 'FREE' : `$${printableOrder.shippingFee}`}</strong></div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, borderTop: '2px solid #0f172a', paddingTop: '6px' }}>
                Total Paid: ${printableOrder.totalAmount?.toFixed(2)}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => window.print()} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <Printer size={15} /> Print Now
              </button>
              <button onClick={() => setPrintableOrder(null)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
