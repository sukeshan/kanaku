import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import { Search, ArrowRight, ShoppingBag, Minus, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileManager from '../components/ProfileManager';
import MenuItem from '../components/MenuItem';

const OrderTracking = () => {
    const { items, addOrder } = useStore();
    const [cart, setCart] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const searchTimerRef = useRef(null);

    // Debounce search for better performance on low-end devices
    const handleSearchChange = useCallback((value) => {
        setSearch(value);
        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }
        searchTimerRef.current = setTimeout(() => {
            setDebouncedSearch(value);
        }, 150);
    }, []);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
    }, []);

    const sortedItems = useMemo(() => {
        return items
            .filter(i => i.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [items, debouncedSearch]);

    const updateQty = useCallback((itemId, delta) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return;

        const currentStock = item.stock || 0;

        setCart(prev => {
            const currentQty = prev[itemId] || 0;
            const nextQty = currentQty + delta;

            if (nextQty > currentStock) return prev; // Prevent exceeding stock
            if (nextQty < 0) return prev;

            if (nextQty <= 0) {
                const { [itemId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [itemId]: nextQty };
        });
    }, [items]);

    const handleOkay = () => {
        if (Object.keys(cart).length === 0) return;
        setIsProcessing(true);

        setTimeout(() => {
            const orderItems = Object.entries(cart).map(([id, qty]) => {
                const item = items.find(i => i.id === id);
                return { ...item, qty };
            });
            addOrder(orderItems);
            setCart({});
            setIsProcessing(false);
        }, 1200);
    };

    const totalAmount = Object.entries(cart).reduce((sum, [id, qty]) => {
        const item = items.find(i => i.id === id);
        return sum + (item?.price || 0) * qty;
    }, 0);

    return (
        <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

            {/* LEFT: Item Grid */}
            <div style={{ flex: 1, padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '24px', minHeight: 0, overflow: 'hidden' }}>

                {/* Search Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="text-headline" style={{ margin: 0 }}>Menu</h1>
                    </div>

                    <div className="google-input" style={{ width: '300px', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Search size={20} color="var(--text-tertiary)" />
                        <input
                            placeholder="Search items..."
                            value={search}
                            onChange={e => handleSearchChange(e.target.value)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '1rem', fontFamily: 'inherit' }}
                        />
                    </div>
                </div>

                {/* Grid Container */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '16px',
                    flex: 1,
                    overflowY: 'auto',
                    alignContent: 'start',
                    paddingBottom: '24px'
                }}>
                    {sortedItems.map((item, idx) => (
                        <MenuItem
                            key={item.id}
                            item={item}
                            qty={cart[item.id] || 0}
                            updateQty={updateQty}
                            idx={idx}
                        />
                    ))}
                </div>
            </div>

            {/* RIGHT: Cart Panel */}
            <div style={{
                width: '400px',
                background: 'var(--bg-surface)',
                margin: '16px',
                borderRadius: 'var(--radius-xl)',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden'
            }}>

                {/* Profile Manager */}
                <ProfileManager />

                {/* List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <AnimatePresence mode="popLayout">
                        {Object.entries(cart).map(([id, qty]) => {
                            const item = items.find(i => i.id === id);
                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -20, scale: 0.9 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    key={id}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '16px', borderRadius: '20px', background: 'var(--bg-core)'
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>₹{item.price * qty}</span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', padding: '4px', borderRadius: '16px' }}>
                                        <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); updateQty(id, -1) }} className="nav-pill" style={{ width: '32px', height: '32px' }}><Minus size={14} /></motion.button>
                                        <span style={{ fontSize: '0.9rem', width: '20px', textAlign: 'center', fontWeight: 'bold' }}>{qty}</span>
                                        <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); updateQty(id, 1) }} className="nav-pill active" style={{ width: '32px', height: '32px' }}><Plus size={14} /></motion.button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {Object.keys(cart).length === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.3 }}>
                            <ShoppingBag size={48} />
                            <p style={{ marginTop: '16px' }}>Cart is empty</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', padding: '0 8px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Total to Pay</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{totalAmount}</span>
                    </div>

                    <motion.button
                        disabled={Object.keys(cart).length === 0 || isProcessing}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOkay}
                        className="fab-btn"
                        style={{
                            width: '100%', justifyContent: 'center',
                            opacity: Object.keys(cart).length === 0 ? 0.5 : 1,
                            background: isProcessing ? 'var(--success)' : 'var(--primary)',
                            color: 'var(--on-primary)'
                        }}
                    >
                        {isProcessing ? (
                            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity }}><Check size={24} /></motion.div>
                        ) : (
                            <>
                                Confirm Order <ArrowRight size={20} />
                            </>
                        )}
                    </motion.button>
                </div>

            </div>
        </div>
    );
};

export default OrderTracking;
