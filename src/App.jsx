import React, { useState, lazy, Suspense, memo } from 'react';
import { Home, ClipboardList, Package, User, BarChart3, LogOut } from 'lucide-react';
import { StoreProvider } from './context/StoreContext';
import { AnimatePresence, motion } from 'framer-motion';

// Lazy load views for better performance on low-end devices
const OrderTracking = lazy(() => import('./views/OrderTracking'));
const StockUpdate = lazy(() => import('./views/StockUpdate'));
const Summary = lazy(() => import('./views/Summary'));
const AnalyticsHub = lazy(() => import('./views/AnalyticsHub'));

// Loading fallback component
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: 'var(--text-secondary)'
  }}>
    Loading...
  </div>
);

import Login from './components/Login';

function App() {
  const [activeTab, setActiveTab] = useState('order');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('kanaku_auth') === 'true';
  });

  const handleLogin = () => {
    localStorage.setItem('kanaku_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    console.log('App: Handle logout triggered');
    const confirmed = window.confirm('Are you sure you want to logout?');
    console.log('App: Logout confirmed?', confirmed);
    if (confirmed) {
      localStorage.removeItem('kanaku_auth');
      setIsAuthenticated(false);
      console.log('App: Logged out');
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <StoreProvider>
      <div className="app-container">

        {/* Desktop Navigation Rail */}
        <nav className="nav-rail">
          {/* Menu Button / Logo */}
          <div style={{ marginBottom: '24px' }}>
            <motion.button
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: '48px', height: '48px', borderRadius: '50%', border: 'none',
                background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>🍵</span>
            </motion.button>
          </div>

          <NavIcon icon={<Home size={24} />} label="Home" active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} />
          <NavIcon icon={<BarChart3 size={24} />} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          <NavIcon icon={<ClipboardList size={24} />} label="Order" active={activeTab === 'order'} onClick={() => setActiveTab('order')} />
          <NavIcon icon={<Package size={24} />} label="Stock" active={activeTab === 'stock'} onClick={() => setActiveTab('stock')} />

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', flexShrink: 0, marginBottom: '20px' }}>
            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255, 107, 107, 0.1)',
                color: 'var(--error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'transform 0.1s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1.1)'}
            >
              <LogOut size={20} />
            </button>


            {/* User Avatar */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--bg-elevated)' }}
            >
              <div style={{ width: '100%', height: '100%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={20} color="white" />
              </div>
            </motion.div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="main-content">
          <Suspense fallback={<LoadingFallback />}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ width: '100%', height: '100%' }}
              >
                {activeTab === 'summary' && <Summary />}
                {activeTab === 'analytics' && <AnalyticsHub />}
                {activeTab === 'order' && <OrderTracking />}
                {activeTab === 'stock' && <StockUpdate />}
              </motion.div>
            </AnimatePresence>
          </Suspense>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="mobile-bottom-nav">
          <NavIcon icon={<Home size={22} />} label="Home" active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} />
          <NavIcon icon={<BarChart3 size={22} />} label="Data" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          <div style={{ position: 'relative', top: '-18px' }}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setActiveTab('order')}
              style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'var(--primary)', border: '4px solid var(--bg-core)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(108, 92, 231, 0.4)'
              }}>
              <ClipboardList size={24} color="#fff" />
            </motion.button>
          </div>
          <NavIcon icon={<Package size={22} />} label="Stock" active={activeTab === 'stock'} onClick={() => setActiveTab('stock')} />
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: 'var(--error)',
              padding: '8px'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Logout</span>
          </button>
        </div>

      </div>
    </StoreProvider>
  );
}

// Memoized NavIcon to prevent unnecessary re-renders
const NavIcon = memo(({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: 'transparent',
      border: 'none',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
      cursor: 'pointer',
      width: '100%'
    }}
  >
    <div
      style={{
        width: '56px', height: '32px',
        borderRadius: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: active ? 'var(--primary)' : 'transparent',
        color: active ? 'var(--on-primary)' : 'var(--text-secondary)',
        transform: active ? 'scale(1)' : 'scale(0.9)',
        transition: 'all 0.2s ease'
      }}
    >
      {icon}
    </div>
    <span style={{
      fontSize: '0.75rem', fontWeight: 600,
      color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
      opacity: active ? 1 : 0.7
    }}>{label}</span>
  </button>
));

export default App;
