import React, { useState, lazy, Suspense, memo } from 'react';
import { Home, ClipboardList, Package, User, BarChart3 } from 'lucide-react';
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

function App() {
  const [activeTab, setActiveTab] = useState('order');

  return (
    <StoreProvider>
      <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-core)' }}>

        {/* Material Navigation Rail */}
        <nav style={{
          width: 'var(--sidebar-width)',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '24px 0',
          gap: '16px',
          zIndex: 100
        }}>
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

          <div style={{ marginTop: 'auto' }}>
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
        <main style={{
          flex: 1,
          margin: '16px 16px 16px 0',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          background: 'var(--bg-core)',
          position: 'relative'
        }}>
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
