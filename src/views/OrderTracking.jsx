import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../context/StoreContext';
import { User, Check, Minus, Plus, Search, ArrowRight, ShoppingBag, AlertCircle, ChevronDown, Edit2, UserPlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AVATARS = ['👑', '👨‍🍳', '👩‍🍳', '🧑‍💼', '👤', '😀', '😎', '🎩', '👨‍💻', '👩‍💻', '🧑‍🎨', '👷'];

const ProfileManager = () => {
    const { users, currentUser, setCurrentUser, addUser, editUser } = useStore();
    const [showMenu, setShowMenu] = useState(false);
    const [mode, setMode] = useState('list'); // 'list', 'edit', 'create'
    const [editName, setEditName] = useState('');
    const [editAvatar, setEditAvatar] = useState('👤');
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
                setMode('list');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSwitchUser = (user) => {
        setCurrentUser(user);
        setShowMenu(false);
        setMode('list');
    };

    const handleEditStart = () => {
        setMode('edit');
        setEditName(currentUser.name);
        setEditAvatar(currentUser.avatar);
    };

    const handleEditSave = () => {
        if (editName.trim()) {
            editUser(currentUser.id, editName, editAvatar);
        }
        setMode('list');
    };

    const handleCreateStart = () => {
        setMode('create');
        setEditName('');
        setEditAvatar('👤');
    };

    const handleCreateSave = () => {
        if (editName.trim()) {
            addUser(editName, editAvatar);
        }
        setShowMenu(false);
        setMode('list');
    };

    const handleCancel = () => {
        setMode('list');
        setEditName('');
        setEditAvatar('👤');
    };

    return (
        <div ref={menuRef} style={{ position: 'relative' }}>
            {/* Profile Button */}
            <motion.div
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                onClick={() => setShowMenu(!showMenu)}
                style={{
                    padding: '24px',
                    background: 'var(--bg-elevated)',
                    display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
                    borderBottom: '1px solid rgba(255,255,255,0.02)',
                    transition: 'background 0.2s'
                }}
            >
                <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'var(--primary)', color: 'var(--on-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
                }}>
                    {currentUser.avatar}
                </div>
                <div style={{ flex: 1 }}>
                    <span className="text-label" style={{ color: 'var(--text-tertiary)' }}>Taking Orders</span>
                    <div className="text-title">{currentUser.name}</div>
                </div>
                <motion.div
                    animate={{ rotate: showMenu ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <ChevronDown size={20} color="var(--text-secondary)" />
                </motion.div>
            </motion.div>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {showMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: 'var(--bg-elevated)',
                            borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderTop: 'none',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                            zIndex: 1000,
                            maxHeight: '400px',
                            overflowY: 'auto'
                        }}
                    >
                        {mode === 'list' && (
                            <>
                                {/* User List */}
                                <div style={{ padding: '12px' }}>
                                    {users.map(user => (
                                        <motion.div
                                            key={user.id}
                                            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                            onClick={() => handleSwitchUser(user)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                background: user.id === currentUser.id ? 'rgba(188, 194, 255, 0.1)' : 'transparent',
                                                marginBottom: '4px'
                                            }}
                                        >
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: user.id === currentUser.id ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                                                color: user.id === currentUser.id ? 'var(--on-primary)' : 'var(--text-primary)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.3rem'
                                            }}>
                                                {user.avatar}
                                            </div>
                                            <span style={{ flex: 1, fontWeight: user.id === currentUser.id ? 600 : 400 }}>
                                                {user.name}
                                            </span>
                                            {user.id === currentUser.id && (
                                                <>
                                                    <Check size={18} color="var(--primary)" />
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditStart();
                                                        }}
                                                        style={{
                                                            background: 'rgba(255, 255, 255, 0.1)',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '6px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Edit2 size={16} color="var(--text-secondary)" />
                                                    </motion.button>
                                                </>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Add New Profile Button */}
                                <div style={{ padding: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                    <motion.button
                                        whileHover={{ backgroundColor: 'rgba(188, 194, 255, 0.1)' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleCreateStart}
                                        style={{
                                            width: '100%',
                                            background: 'transparent',
                                            border: '1px dashed rgba(255, 255, 255, 0.2)',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            color: 'var(--primary)',
                                            fontWeight: 600
                                        }}
                                    >
                                        <UserPlus size={18} />
                                        Add New Profile
                                    </motion.button>
                                </div>
                            </>
                        )}

                        {(mode === 'edit' || mode === 'create') && (
                            <div style={{ padding: '24px' }}>
                                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                                        {mode === 'edit' ? 'Edit Profile' : 'New Profile'}
                                    </h3>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleCancel}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            display: 'flex'
                                        }}
                                    >
                                        <X size={20} color="var(--text-secondary)" />
                                    </motion.button>
                                </div>

                                {/* Avatar Selection */}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        Avatar
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
                                        {AVATARS.map(avatar => (
                                            <motion.button
                                                key={avatar}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setEditAvatar(avatar)}
                                                style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    borderRadius: '50%',
                                                    background: editAvatar === avatar ? 'var(--primary)' : 'rgba(255, 255, 255, 0.05)',
                                                    border: editAvatar === avatar ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.1)',
                                                    cursor: 'pointer',
                                                    fontSize: '1.5rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                {avatar}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Name Input */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Enter name..."
                                        maxLength={30}
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                mode === 'edit' ? handleEditSave() : handleCreateSave();
                                            } else if (e.key === 'Escape') {
                                                handleCancel();
                                            }
                                        }}
                                        className="google-input"
                                        style={{ padding: '12px 16px', fontSize: '1rem' }}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleCancel}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            background: 'transparent',
                                            color: 'var(--text-secondary)',
                                            cursor: 'pointer',
                                            fontWeight: 600
                                        }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={mode === 'edit' ? handleEditSave : handleCreateSave}
                                        disabled={!editName.trim()}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: 'none',
                                            background: editName.trim() ? 'var(--primary)' : 'rgba(255, 255, 255, 0.1)',
                                            color: editName.trim() ? 'var(--on-primary)' : 'var(--text-tertiary)',
                                            cursor: editName.trim() ? 'pointer' : 'not-allowed',
                                            fontWeight: 600
                                        }}
                                    >
                                        Save
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

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

    const updateQty = (itemId, delta) => {
        const item = items.find(i => i.id === itemId);
        const currentStock = item?.stock || 0;
        const currentQty = cart[itemId] || 0;
        const nextQty = currentQty + delta;

        if (nextQty > currentStock) return; // Prevent exceeding stock
        if (nextQty < 0) return;

        setCart(prev => {
            if (nextQty <= 0) {
                const { [itemId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [itemId]: nextQty };
        });
    };

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
                    {sortedItems.map((item, idx) => {
                        const qty = cart[item.id] || 0;
                        const stock = item.stock || 0;
                        const isOutOfStock = stock === 0;

                        return (
                            <motion.button
                                layout
                                disabled={isOutOfStock}
                                whileHover={!isOutOfStock ? { scale: 1.02, y: -4 } : {}}
                                whileTap={!isOutOfStock ? { scale: 0.95 } : {}}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: isOutOfStock ? 0.6 : 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25, delay: idx * 0.03 }}
                                key={item.id}
                                onClick={() => updateQty(item.id, 1)}
                                className="google-card"
                                style={{
                                    height: '180px',
                                    padding: '20px',
                                    display: 'flex', flexDirection: 'column',
                                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                    border: qty > 0 ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.03)',
                                    background: qty > 0 ? 'rgba(188, 194, 255, 0.08)' : 'var(--bg-surface)',
                                    textAlign: 'left',
                                    alignItems: 'flex-start',
                                    filter: isOutOfStock ? 'grayscale(1)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: 'auto' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '16px',
                                        background: item.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.5rem'
                                    }}>✨</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: stock < 10 ? 'var(--error)' : 'var(--success)' }}>
                                            {isOutOfStock ? 'SOLD OUT' : `${stock} left`}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-title" style={{ fontSize: '1.1rem', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{item.name}</h3>
                                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>₹{item.price}</span>

                                <AnimatePresence>
                                    {qty > 0 && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            style={{
                                                position: 'absolute', top: '16px', right: '16px',
                                                background: 'var(--primary)', color: 'var(--on-primary)',
                                                padding: '4px 12px', borderRadius: '12px',
                                                fontWeight: 700, fontSize: '0.9rem'
                                            }}
                                        >
                                            {qty}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        );
                    })}
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
