import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { QuickViewModal } from './components/QuickViewModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrdersPage } from './pages/OrdersPage';
import { WishlistPage } from './pages/WishlistPage';
import { AdminPage } from './pages/AdminPage';

const MainContent = () => {
  const { currentPage, navigate } = useApp();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'product-detail':
        return <ProductDetailPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'orders':
        return <OrdersPage />;
      case 'wishlist':
        return <WishlistPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return (
          <div className="app-container" style={{ padding: '100px 24px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>404</h1>
            <h2 style={{ fontSize: '1.5rem', margin: '12px 0 8px' }}>Page Not Found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>The requested section does not exist or has been moved.</p>
            <button onClick={() => navigate('home')} className="btn-primary">
              Return to Storefront
            </button>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {renderCurrentPage()}
      </main>
      <Footer />

      {/* Global Overlays */}
      <ToastContainer />
      <CartDrawer />
      <AuthModal />
      <QuickViewModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
