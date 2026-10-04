import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Users,
  Tag,
  Plus,
  Edit2,
  Trash2,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  X,
  Search,
  ChevronDown
} from 'lucide-react';

export const AdminPage = () => {
  const { user, navigate, addToast } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'products' | 'categories' | 'orders' | 'users' | 'coupons'

  // Data states
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    originalPrice: '',
    discount: 0,
    category: 'Electronics & Gadgets',
    brand: '',
    stock: 15,
    description: '',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80'],
    isFeatured: false
  });

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', image: '', description: '' });

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({ code: '', discountType: 'percentage', discountValue: 20, minOrderValue: 100, expiryDate: '2027-12-31' });

  // Status update modal for orders
  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('Processing');
  const [trackingNote, setTrackingNote] = useState('');

  // Protect Admin route
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      addToast('Access restricted to administrators only', 'error');
      navigate('home');
    }
  }, [user]);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, prodRes, catRes, ordRes, usrRes, coupRes] = await Promise.all([
        api.getDashboardStats(),
        api.getProducts({ allStatus: 'true', limit: 100 }),
        api.getCategories(),
        api.getAllOrders(),
        api.getUsers(),
        api.getCoupons()
      ]);

      setStats(statsRes);
      setProducts(prodRes.products || []);
      setCategories(catRes || []);
      setOrders(ordRes || []);
      setUsersList(usrRes || []);
      setCoupons(coupRes || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAllAdminData();
    }
  }, [user]);

  // Product CRUD Handlers
  const handleOpenProductModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProductForm({
        name: prod.name,
        price: prod.price,
        originalPrice: prod.originalPrice || prod.price,
        discount: prod.discount || 0,
        category: prod.category || 'Electronics & Gadgets',
        brand: prod.brand || '',
        stock: prod.stock || 0,
        description: prod.description || '',
        images: prod.images || [],
        isFeatured: !!prod.isFeatured
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        price: '',
        originalPrice: '',
        discount: 0,
        category: categories[0]?.name || 'Electronics & Gadgets',
        brand: 'Luxe Craft',
        stock: 20,
        description: '',
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80'],
        isFeatured: false
      });
    }
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, productForm);
        addToast('Product updated successfully', 'success');
      } else {
        await api.createProduct(productForm);
        addToast('New product added to catalog', 'success');
      }
      setProductModalOpen(false);
      loadAllAdminData();
    } catch (err) {
      addToast(err.message || 'Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.deleteProduct(id);
      addToast('Product deleted from inventory', 'info');
      loadAllAdminData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Order Status Update Handler
  const handleSaveOrderStatus = async () => {
    if (!statusModalOrder) return;
    try {
      await api.updateOrderStatus(statusModalOrder.id, newStatus, trackingNote);
      addToast(`Order ${statusModalOrder.orderId} status changed to ${newStatus}`, 'success');
      setStatusModalOrder(null);
      loadAllAdminData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // User Block Handler
  const handleToggleBlockUser = async (id) => {
    try {
      const res = await api.toggleBlockUser(id);
      addToast(res.message, 'info');
      loadAllAdminData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Coupon Handlers
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.createCoupon(couponForm);
      addToast(`Coupon ${couponForm.code} created`, 'success');
      setCouponModalOpen(false);
      loadAllAdminData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await api.deleteCoupon(id);
      addToast('Coupon deleted', 'info');
      loadAllAdminData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Category Handler
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      await api.createCategory(categoryForm);
      addToast(`Category ${categoryForm.name} added`, 'success');
      setCategoryModalOpen(false);
      loadAllAdminData();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="app-container" style={{ padding: '32px 24px 80px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-featured">Administrator</span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Store Management Suite</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '4px' }}>Admin Control Center</h1>
        </div>

        {/* Global Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleOpenProductModal()}
            className="btn-primary"
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            <Plus size={16} /> New Product
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '8px',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '32px'
        }}
      >
        {[
          { id: 'dashboard', label: 'Dashboard & Analytics', icon: <LayoutDashboard size={16} /> },
          { id: 'products', label: `Products (${products.length})`, icon: <Package size={16} /> },
          { id: 'orders', label: `Orders (${orders.length})`, icon: <ShoppingBag size={16} /> },
          { id: 'categories', label: `Categories (${categories.length})`, icon: <FolderTree size={16} /> },
          { id: 'users', label: `Registered Users (${usersList.length})`, icon: <Users size={16} /> },
          { id: 'coupons', label: `Coupons (${coupons.length})`, icon: <Tag size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              fontSize: '0.88rem',
              background: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
              color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>TOTAL REVENUE</span>
                <TrendingUp size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '10px' }}>
                ${stats.kpis.totalRevenue?.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '6px', fontWeight: 600 }}>
                +18.4% from last month
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>TOTAL ORDERS</span>
                <ShoppingBag size={18} color="var(--accent-primary)" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '10px' }}>
                {stats.kpis.totalOrders}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#d97706', marginTop: '6px', fontWeight: 600 }}>
                {stats.kpis.pendingOrders} pending fulfillment
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>ACTIVE PRODUCTS</span>
                <Package size={18} color="#ec4899" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '10px' }}>
                {stats.kpis.totalProducts}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Across {categories.length} categories
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                <span>REGISTERED USERS</span>
                <Users size={18} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '10px' }}>
                {stats.kpis.totalUsers}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '6px', fontWeight: 600 }}>
                100% verified customer base
              </div>
            </div>
          </div>

          {/* Monthly Revenue Chart (SVG Bar Chart) */}
          <div className="glass-panel" style={{ padding: '28px', background: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px' }}>Annual Revenue Performance ($)</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', gap: '8px', paddingTop: '20px' }}>
              {stats.revenueChart?.map((col, idx) => {
                const max = 10000;
                const heightPercent = Math.max(10, Math.min(100, (col.revenue / max) * 100));

                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      {col.revenue > 0 ? `$${col.revenue}` : ''}
                    </div>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '36px',
                        height: `${heightPercent}%`,
                        background: 'var(--accent-gradient)',
                        borderRadius: '6px 6px 0 0',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'height 0.4s ease'
                      }}
                      title={`${col.month}: $${col.revenue}`}
                    />
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: '8px' }}>
                      {col.month}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Low Stock Alerts & Recent Orders */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Low Stock Alerts */}
            <div className="glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <AlertTriangle size={18} color="#ef4444" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Low Stock Warnings (&lt;15 Units)</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.lowStockAlerts?.map(prod => (
                  <div key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{prod.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{prod.category}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="badge badge-stock-low">{prod.stock} left</span>
                      <button onClick={() => handleOpenProductModal(prod)} style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 600 }}>Restock</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Latest Orders</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.recentOrders?.map(ord => (
                  <div key={ord.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{ord.orderId}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.user?.name} • {ord.items?.length} items</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>${ord.totalAmount?.toFixed(2)}</div>
                      <span className={`badge badge-status-${ord.status?.toLowerCase()}`}>{ord.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTS MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="glass-panel" style={{ background: 'var(--bg-secondary)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Product Catalog Management</h3>
            <button onClick={() => handleOpenProductModal()} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Plus size={16} /> Add Product
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 20px' }}>Product</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Price</th>
                  <th style={{ padding: '12px 16px' }}>Stock</th>
                  <th style={{ padding: '12px 16px' }}>Featured</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={(p.images && p.images[0]) || ''} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.brand}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{p.category}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>${p.price}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${p.stock > 10 ? 'badge-stock-in' : p.stock > 0 ? 'badge-stock-low' : 'badge-stock-out'}`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {p.isFeatured ? <span className="badge badge-featured">Yes</span> : <span style={{ color: 'var(--text-muted)' }}>No</span>}
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button onClick={() => handleOpenProductModal(p)} style={{ color: 'var(--accent-primary)', padding: '4px' }} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id)} style={{ color: '#ef4444', padding: '4px' }} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="glass-panel" style={{ background: 'var(--bg-secondary)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Customer Order Processing</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 20px' }}>Order ID</th>
                  <th style={{ padding: '12px 16px' }}>Customer</th>
                  <th style={{ padding: '12px 16px' }}>Total Amount</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 800, color: 'var(--accent-primary)' }}>{o.orderId}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{o.user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.user?.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 800 }}>${o.totalAmount?.toFixed(2)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge badge-status-${o.status?.toLowerCase()}`}>{o.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <button
                        onClick={() => { setStatusModalOrder(o); setNewStatus(o.status); setTrackingNote(''); }}
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CATEGORIES */}
      {activeTab === 'categories' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Category Manager</h3>
            <button onClick={() => setCategoryModalOpen(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Plus size={16} /> New Category
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {categories.map(c => (
              <div key={c.id} className="glass-panel" style={{ padding: '20px', background: 'var(--bg-secondary)', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <img src={c.image} alt={c.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }} />
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{c.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.description || 'Active collection'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: REGISTERED USERS */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ background: 'var(--bg-secondary)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>User Management & Security</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-tertiary)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 20px' }}>User</th>
                  <th style={{ padding: '12px 16px' }}>Role</th>
                  <th style={{ padding: '12px 16px' }}>Orders Placed</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={u.avatar || ''} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-featured' : ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.orderCount || 0}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {u.isBlocked ? (
                        <span className="badge badge-stock-out">Blocked</span>
                      ) : (
                        <span className="badge badge-stock-in">Active</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleBlockUser(u.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            background: u.isBlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: u.isBlocked ? '#10b981' : '#ef4444',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {u.isBlocked ? 'Unblock User' : 'Block User'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: COUPONS */}
      {activeTab === 'coupons' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Promotional Coupons</h3>
            <button onClick={() => setCouponModalOpen(true)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <Plus size={16} /> Create Coupon
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {coupons.map(c => (
              <div key={c.id} className="glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className="badge badge-sale" style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>{c.code}</span>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '8px' }}>
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `$${c.discountValue} FLAT OFF`}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteCoupon(c.id)} style={{ color: 'var(--text-muted)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                  Min order: ${c.minOrderValue} • Used: {c.usedCount || 0} times
                </div>
                <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
                  Valid until {c.expiryDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {productModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setProductModalOpen(false)}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '600px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-xl)',
              padding: '32px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setProductModalOpen(false)} style={{ color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Selling Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Original / Strikethrough Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.originalPrice}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    {categories.map(c => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Stock Units</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Image URL</label>
                <input
                  type="url"
                  required
                  value={productForm.images[0] || ''}
                  onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="featToggle"
                  checked={productForm.isFeatured}
                  onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                <label htmlFor="featToggle" style={{ fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}>Mark as Featured on Homepage</label>
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
                Save Product Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE ORDER STATUS */}
      {statusModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setStatusModalOrder(null)}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-xl)',
              padding: '28px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Update Status: {statusModalOrder.orderId}</h3>
              <button onClick={() => setStatusModalOrder(null)} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Fulfillment Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing & Packed</option>
                  <option value="Shipped">Shipped & In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Courier / Tracking Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. FedEx Tracking #99382104"
                  value={trackingNote}
                  onChange={(e) => setTrackingNote(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <button onClick={handleSaveOrderStatus} className="btn-primary" style={{ padding: '12px' }}>
                Confirm Status Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE COUPON */}
      {couponModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setCouponModalOpen(false)}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{ width: '100%', maxWidth: '440px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', padding: '28px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Create Promo Coupon</h3>
              <button onClick={() => setCouponModalOpen(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER30"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', textTransform: 'uppercase' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    style={{ width: '100%' }}
                  >
                    <option value="percentage">% Percentage</option>
                    <option value="flat">$ Flat Amount</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Discount Value</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Min Order Value ($)</label>
                <input
                  type="number"
                  value={couponForm.minOrderValue}
                  onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '12px', marginTop: '6px' }}>
                Publish Coupon
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CATEGORY */}
      {categoryModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setCategoryModalOpen(false)}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{ width: '100%', maxWidth: '440px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', padding: '28px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Create New Category</h3>
              <button onClick={() => setCategoryModalOpen(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Photography Gear"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  style={{ width: '100%' }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '12px', marginTop: '6px' }}>
                Add Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
