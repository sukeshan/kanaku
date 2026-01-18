import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';

const StoreContext = createContext();

// Max orders to keep in memory for performance on low-end devices
const MAX_ORDERS_IN_MEMORY = 500;

const INITIAL_ITEMS = [
  { id: '1', name: 'Masala Chai', price: 15, color: '#e0c097', count: 0, stock: 100 },
  { id: '2', name: 'Ginger Tea', price: 20, color: '#f7d794', count: 0, stock: 50 },
  { id: '3', name: 'Lemon Tea', price: 20, color: '#f8a5c2', count: 0, stock: 40 },
  { id: '4', name: 'Coffee', price: 25, color: '#774a38', count: 0, stock: 80 },
  { id: '5', name: 'Bun', price: 10, color: '#f3a683', count: 0, stock: 30 },
  { id: '6', name: 'Samosa', price: 15, color: '#e17055', count: 0, stock: 25 },
];

const INITIAL_USERS = [
  { id: 'u1', name: 'Owner', avatar: '👑' },
  { id: 'u2', name: 'Staff 1', avatar: '👨‍🍳' },
];

export const StoreProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('kanaku_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('kanaku_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('kanaku_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState(users[0]);

  // Refs for debounced saves
  const saveTimerRef = useRef({});

  // Debounced localStorage save to reduce writes on low-end devices
  const debouncedSave = useCallback((key, data, delay = 300) => {
    if (saveTimerRef.current[key]) {
      clearTimeout(saveTimerRef.current[key]);
    }
    saveTimerRef.current[key] = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.warn('localStorage save failed:', e);
      }
    }, delay);
  }, []);

  useEffect(() => {
    debouncedSave('kanaku_items', items);
  }, [items, debouncedSave]);

  useEffect(() => {
    // Only save last MAX_ORDERS to localStorage to prevent memory issues
    const ordersToSave = orders.slice(0, MAX_ORDERS_IN_MEMORY);
    debouncedSave('kanaku_orders', ordersToSave, 500);
  }, [orders, debouncedSave]);

  useEffect(() => {
    debouncedSave('kanaku_users', users);
  }, [users, debouncedSave]);

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = saveTimerRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  const addItem = useCallback((newItem) => {
    setItems(prev => [...prev, { ...newItem, id: Date.now().toString(), count: 0, stock: newItem.stock || 0 }]);
  }, []);

  const updateStock = useCallback((itemId, delta) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === itemId) {
        return { ...item, stock: Math.max(0, (item.stock || 0) + delta) };
      }
      return item;
    }));
  }, []);

  // Detect device name from user agent
  const getDeviceName = () => {
    const ua = navigator.userAgent;
    if (/iPad/.test(ua)) return 'iPad';
    if (/iPhone/.test(ua)) return 'iPhone';
    if (/Android/.test(ua) && /Mobile/.test(ua)) return 'Android Phone';
    if (/Android/.test(ua)) return 'Android Tablet';
    if (/Macintosh/.test(ua)) return 'Mac';
    if (/Windows/.test(ua)) return 'Windows PC';
    if (/Linux/.test(ua)) return 'Linux';
    return 'Unknown Device';
  };

  const addOrder = useCallback((orderItems) => {
    if (orderItems.length === 0) return;

    const total = orderItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const newOrder = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      items: orderItems,
      total,
      user: currentUser,
      device: getDeviceName(),
    };

    // Limit orders in memory for performance
    setOrders(prev => [newOrder, ...prev].slice(0, MAX_ORDERS_IN_MEMORY));

    // Update item popularity/count AND reduce stock
    setItems(prevItems => prevItems.map(i => {
      const ordered = orderItems.find(oi => oi.id === i.id);
      if (ordered) {
        return {
          ...i,
          count: (i.count || 0) + ordered.qty,
          stock: Math.max(0, (i.stock || 0) - ordered.qty)
        };
      }
      return i;
    }));
  }, [currentUser]);

  const addUser = useCallback((name, avatar = '👤') => {
    const newUser = {
      id: `u${Date.now()}`,
      name: name.trim() || 'New User',
      avatar
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return newUser;
  }, []);

  const editUser = useCallback((userId, newName, newAvatar) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u };
        if (newName !== undefined) updated.name = newName.trim() || u.name;
        if (newAvatar !== undefined) updated.avatar = newAvatar;
        return updated;
      }
      return u;
    }));
    setCurrentUser(prev => {
      if (prev.id === userId) {
        return {
          ...prev,
          name: newName !== undefined ? (newName.trim() || prev.name) : prev.name,
          avatar: newAvatar !== undefined ? newAvatar : prev.avatar
        };
      }
      return prev;
    });
  }, []);

  const deleteUser = useCallback((userId) => {
    setUsers(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(u => u.id !== userId);
    });
    setCurrentUser(prev => {
      if (prev.id === userId) {
        // Will be updated in next render with filtered users
        return prev;
      }
      return prev;
    });
  }, []);

  // Export orders to CSV
  const exportOrdersToCSV = useCallback(() => {
    if (orders.length === 0) {
      alert('No orders to export');
      return;
    }

    // Create CSV headers
    const headers = ['Order ID', 'Date', 'Time', 'Items', 'Quantities', 'Item Prices', 'Total', 'Staff', 'Device'];

    // Create CSV rows
    const rows = orders.map(order => {
      const date = new Date(order.timestamp);
      const dateStr = date.toLocaleDateString('en-IN');
      const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const itemNames = order.items.map(i => i.name).join('; ');
      const quantities = order.items.map(i => i.qty).join('; ');
      const prices = order.items.map(i => `₹${i.price}`).join('; ');

      return [
        order.id,
        dateStr,
        timeStr,
        `"${itemNames}"`,
        `"${quantities}"`,
        `"${prices}"`,
        `₹${order.total}`,
        order.user?.name || 'Unknown',
        order.device || 'Unknown'
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kanaku_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [orders]);

  // Export items/inventory to CSV
  const exportItemsToCSV = useCallback(() => {
    if (items.length === 0) {
      alert('No items to export');
      return;
    }

    const headers = ['Item ID', 'Name', 'Price', 'Stock', 'Total Sold'];
    const rows = items.map(item => [
      item.id,
      `"${item.name}"`,
      `₹${item.price}`,
      item.stock || 0,
      item.count || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kanaku_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [items]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    items,
    orders,
    users,
    currentUser,
    setCurrentUser,
    addItem,
    addOrder,
    updateStock,
    addUser,
    editUser,
    deleteUser,
    exportOrdersToCSV,
    exportItemsToCSV
  }), [items, orders, users, currentUser, addItem, addOrder, updateStock, addUser, editUser, deleteUser, exportOrdersToCSV, exportItemsToCSV]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => useContext(StoreContext);
