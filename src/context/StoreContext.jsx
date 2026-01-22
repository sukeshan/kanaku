import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { generateUnifiedCSV, downloadCSV, readCSVFile, parseUnifiedCSV } from '../utils/csvUtils';
import { saveToFirestore, loadFromFirestore, subscribeToFirestore } from '../utils/firebase';

const StoreContext = createContext();

// Max orders to keep in memory for performance on low-end devices
const MAX_ORDERS_IN_MEMORY = 500;

// Debounce delay for saving to Firestore (ms)
const SAVE_DEBOUNCE_DELAY = 2000;

const INITIAL_ITEMS = [
  { id: '1', name: 'Masala Chai', price: 15, color: '#e0c097', count: 0, stock: 100, imageUrl: '' },
  { id: '2', name: 'Ginger Tea', price: 20, color: '#f7d794', count: 0, stock: 50, imageUrl: '' },
  { id: '3', name: 'Lemon Tea', price: 20, color: '#f8a5c2', count: 0, stock: 40, imageUrl: '' },
  { id: '4', name: 'Coffee', price: 25, color: '#774a38', count: 0, stock: 80, imageUrl: '' },
  { id: '5', name: 'Bun', price: 10, color: '#f3a683', count: 0, stock: 30, imageUrl: '' },
  { id: '6', name: 'Samosa', price: 15, color: '#e17055', count: 0, stock: 25, imageUrl: '' },
];

const INITIAL_USERS = [
  { id: 'u1', name: 'Owner', avatar: '👑' },
  { id: 'u2', name: 'Staff 1', avatar: '👨‍🍳' },
];

export const StoreProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Refs for debounced saves
  const saveTimerRef = useRef(null);
  const dataRef = useRef({ items, orders, users });
  const isInitialLoad = useRef(true);

  // Keep dataRef updated
  useEffect(() => {
    dataRef.current = { items, orders, users };
  }, [items, orders, users]);

  // Load data from Firestore on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      console.log('StoreContext: Starting data load...');

      try {
        // Create a timeout promise (3 seconds)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Firestore connection timeout')), 3000)
        );

        // Try to load from Firestore with timeout
        // We race the load against the timeout
        let cloudData = null;
        try {
          console.log('StoreContext: Attempting Firestore load...');
          cloudData = await Promise.race([
            loadFromFirestore(),
            timeoutPromise
          ]);
          console.log('StoreContext: Firestore load success', !!cloudData);
        } catch (err) {
          console.warn('StoreContext: Firestore load rejected/timed out:', err.message);
          // Don't throw here, just treat as null/offline so we fall back to local
          cloudData = null;
        }

        if (cloudData && cloudData.items && cloudData.items.length > 0) {
          console.log('StoreContext: Using Cloud Data');
          setIsCloudConnected(true);
          setItems(cloudData.items);
          setOrders(cloudData.orders || []);
          setUsers(cloudData.users || INITIAL_USERS);
          setCurrentUser(cloudData.users?.[0] || INITIAL_USERS[0]);
          setLastSyncTime(new Date(cloudData.updatedAt || Date.now()));

          // Also save to localStorage as backup
          localStorage.setItem('kanaku_items', JSON.stringify(cloudData.items));
          localStorage.setItem('kanaku_orders', JSON.stringify(cloudData.orders || []));
          localStorage.setItem('kanaku_users', JSON.stringify(cloudData.users || INITIAL_USERS));
        } else {
          console.log('StoreContext: Using Local/Fallback Data');
          // No cloud data - load from localStorage or use defaults
          const savedItems = localStorage.getItem('kanaku_items');
          const savedOrders = localStorage.getItem('kanaku_orders');
          const savedUsers = localStorage.getItem('kanaku_users');

          const loadedItems = savedItems ? JSON.parse(savedItems) : INITIAL_ITEMS;
          const loadedOrders = savedOrders ? JSON.parse(savedOrders) : [];
          const loadedUsers = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;

          setItems(loadedItems);
          setOrders(loadedOrders);
          setUsers(loadedUsers);
          setCurrentUser(loadedUsers[0]);

          // Try to save initial data to Firestore in background
          // Don't await this if it might hang
          saveToFirestore({
            items: loadedItems,
            orders: loadedOrders,
            users: loadedUsers
          }).then(result => {
            if (result.success) {
              setIsCloudConnected(true);
              console.log('StoreContext: Initial background sync success');
            }
          }).catch(e => console.warn('StoreContext: Initial background sync failed', e));
        }
      } catch (error) {
        console.error('StoreContext: Critical load error:', error);
        // Fall back to localStorage
        const savedItems = localStorage.getItem('kanaku_items');
        const savedOrders = localStorage.getItem('kanaku_orders');
        const savedUsers = localStorage.getItem('kanaku_users');

        setItems(savedItems ? JSON.parse(savedItems) : INITIAL_ITEMS);
        setOrders(savedOrders ? JSON.parse(savedOrders) : []);
        setUsers(savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS);
        setCurrentUser(savedUsers ? JSON.parse(savedUsers)[0] : INITIAL_USERS[0]);
      }

      setIsLoading(false);
      isInitialLoad.current = false;
      console.log('StoreContext: Loading complete');
    };

    loadData();
  }, []);

  // Subscribe to real-time updates from Firestore
  useEffect(() => {
    if (isInitialLoad.current) return;

    const unsubscribe = subscribeToFirestore((data) => {
      // Only update if data is different (prevent loop)
      if (data && data.updatedAt !== lastSyncTime?.toISOString()) {
        setItems(data.items || []);
        setOrders(data.orders || []);
        setUsers(data.users || INITIAL_USERS);
        setLastSyncTime(new Date(data.updatedAt));
        setIsCloudConnected(true);
      }
    });

    return () => unsubscribe();
  }, [lastSyncTime]);

  // Debounced save to Firestore and localStorage
  const debouncedSaveToCloud = useCallback(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      const { items: currentItems, orders: currentOrders, users: currentUsers } = dataRef.current;

      setIsSaving(true);

      // Always save to localStorage as backup
      try {
        localStorage.setItem('kanaku_items', JSON.stringify(currentItems));
        localStorage.setItem('kanaku_orders', JSON.stringify(currentOrders.slice(0, MAX_ORDERS_IN_MEMORY)));
        localStorage.setItem('kanaku_users', JSON.stringify(currentUsers));
      } catch (e) {
        console.warn('localStorage save failed:', e);
      }

      // Save to Firestore
      const result = await saveToFirestore({
        items: currentItems,
        orders: currentOrders.slice(0, MAX_ORDERS_IN_MEMORY),
        users: currentUsers
      });

      if (result.success) {
        setLastSyncTime(new Date());
        setIsCloudConnected(true);
      } else {
        setIsCloudConnected(false);
      }

      setIsSaving(false);
    }, SAVE_DEBOUNCE_DELAY);
  }, []);

  // Trigger save whenever data changes
  useEffect(() => {
    if (!isLoading && !isInitialLoad.current) {
      debouncedSaveToCloud();
    }
  }, [items, orders, users, isLoading, debouncedSaveToCloud]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const addItem = useCallback((newItem) => {
    setItems(prev => [...prev, {
      ...newItem,
      id: Date.now().toString(),
      count: 0,
      stock: newItem.stock || 0,
      imageUrl: newItem.imageUrl || ''
    }]);
  }, []);

  const updateStock = useCallback((itemId, delta) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === itemId) {
        return { ...item, stock: Math.max(0, (item.stock || 0) + delta) };
      }
      return item;
    }));
  }, []);

  const setStockValue = useCallback((itemId, value) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === itemId) {
        return { ...item, stock: Math.max(0, Number(value)) };
      }
      return item;
    }));
  }, []);

  const deleteItem = useCallback((itemId) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  }, []);

  const editItem = useCallback((itemId, updates) => {
    setItems(prevItems => prevItems.map(item => {
      if (item.id === itemId) {
        return { ...item, ...updates };
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
      if (prev && prev.id === userId) {
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
      if (prev && prev.id === userId) {
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

    const headers = ['Order ID', 'Date', 'Time', 'Items', 'Quantities', 'Item Prices', 'Total', 'Staff', 'Device'];
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

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kanaku_full_history_${new Date().toISOString().split('T')[0]}.csv`);
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

  // Export ALL data to unified CSV
  const exportAllDataToCSV = useCallback(() => {
    const csvContent = generateUnifiedCSV({ items, orders, users });
    downloadCSV(csvContent, `kanaku_backup_${new Date().toISOString().split('T')[0]}.csv`);
  }, [items, orders, users]);

  // Import data from unified CSV file
  const importDataFromCSV = useCallback(async (file) => {
    try {
      const content = await readCSVFile(file);
      const data = parseUnifiedCSV(content);

      if (data.items && data.items.length > 0) {
        setItems(data.items);
      }

      if (data.orders && data.orders.length > 0) {
        setOrders(data.orders);
      }

      if (data.users && data.users.length > 0) {
        setUsers(data.users);
        setCurrentUser(data.users[0]);
      }

      // Force immediate save to Firestore
      const result = await saveToFirestore({
        items: data.items || items,
        orders: data.orders || orders,
        users: data.users || users
      });

      if (result.success) {
        setLastSyncTime(new Date());
      }

      return { success: true, message: `Imported ${data.items?.length || 0} items, ${data.orders?.length || 0} orders, ${data.users?.length || 0} users` };
    } catch (error) {
      console.error('CSV import error:', error);
      return { success: false, message: 'Failed to import CSV: ' + error.message };
    }
  }, [items, orders, users]);

  // Force sync with cloud
  const syncWithCloud = useCallback(async () => {
    setIsSaving(true);
    const result = await saveToFirestore({ items, orders, users });
    if (result.success) {
      setLastSyncTime(new Date());
      setIsCloudConnected(true);
    }
    setIsSaving(false);
    return result.success;
  }, [items, orders, users]);

  // Refresh data from cloud
  const refreshFromCloud = useCallback(async () => {
    const cloudData = await loadFromFirestore();
    if (cloudData && cloudData.items) {
      setItems(cloudData.items);
      setOrders(cloudData.orders || []);
      setUsers(cloudData.users || INITIAL_USERS);
      setCurrentUser(cloudData.users?.[0] || INITIAL_USERS[0]);
      setLastSyncTime(new Date(cloudData.updatedAt));
      return true;
    }
    return false;
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    items,
    orders,
    users,
    currentUser,
    isLoading,
    isServerAvailable: isCloudConnected,
    lastSyncTime,
    isSaving,
    setCurrentUser,
    addItem,
    addOrder,
    updateStock,
    setStockValue,
    deleteItem,
    editItem,
    addUser,
    editUser,
    deleteUser,
    exportOrdersToCSV,
    exportItemsToCSV,
    exportAllDataToCSV,
    importDataFromCSV,
    syncWithServer: syncWithCloud,
    refreshFromServer: refreshFromCloud
  }), [items, orders, users, currentUser, isLoading, isCloudConnected, lastSyncTime, isSaving, addItem, addOrder, updateStock, setStockValue, deleteItem, editItem, addUser, editUser, deleteUser, exportOrdersToCSV, exportItemsToCSV, exportAllDataToCSV, importDataFromCSV, syncWithCloud, refreshFromCloud]);

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
    </StoreContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useStore = () => useContext(StoreContext);
