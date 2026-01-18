import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Minus, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StockUpdate = () => {
    const { items, addItem, updateStock, setStockValue } = useStore();
    const [showAdd, setShowAdd] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', price: '', stock: '' });

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newItem.name || !newItem.price) return;
        addItem({
            name: newItem.name,
            price: Number(newItem.price),
            stock: Number(newItem.stock) || 0,
            color: `hsl(${Math.random() * 360}, 70%, 65%)`
        });
        setNewItem({ name: '', price: '', stock: '' });
        setShowAdd(false);
    };

    return (
        <div style={{ padding: '40px', height: '100%', overflowY: 'auto', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 className="text-headline" style={{ margin: 0 }}>Inventory</h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Manage stock levels and prices</p>
                </div>

                <button className="fab-btn" onClick={() => setShowAdd(true)}>
                    <Plus size={20} /> Add New Item
                </button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '24px'
            }}>
                <AnimatePresence>
                    {items.map((item) => {
                        const isLow = (item.stock || 0) < 10;
                        return (
                            <motion.div
                                layout
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="google-card"
                                style={{
                                    padding: '24px',
                                    display: 'flex', flexDirection: 'column',
                                    border: isLow ? '1px solid var(--error)' : '1px solid rgba(255,255,255,0.03)',
                                    background: isLow ? 'rgba(255, 180, 171, 0.05)' : 'var(--bg-surface)'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{
                                        width: '56px', height: '56px', borderRadius: '16px',
                                        background: item.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.5rem'
                                    }}>
                                        📦
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹{item.price}</div>
                                        {isLow && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--error)', fontSize: '0.8rem', fontWeight: 600 }}><AlertTriangle size={12} /> Low Stock</div>}
                                    </div>
                                </div>

                                <h3 className="text-title" style={{ margin: '0 0 16px 0' }}>{item.name}</h3>

                                <div style={{ marginTop: 'auto', background: 'var(--bg-core)', borderRadius: '16px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>STOCK LEVEL</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <motion.button whileTap={{ scale: 0.8 }} onClick={() => updateStock(item.id, -1)} className="nav-pill" style={{ width: '32px', height: '32px', background: 'var(--bg-elevated)' }}><Minus size={14} /></motion.button>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            value={item.stock || 0}
                                            onChange={(e) => setStockValue(item.id, e.target.value)}
                                            style={{
                                                fontSize: '1.2rem',
                                                fontWeight: 700,
                                                width: '60px',
                                                textAlign: 'center',
                                                background: 'transparent',
                                                border: 'none',
                                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                                color: 'var(--text-primary)',
                                                padding: '4px'
                                            }}
                                        />
                                        <motion.button whileTap={{ scale: 0.8 }} onClick={() => updateStock(item.id, 5)} className="nav-pill" style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'var(--on-primary)' }}><Plus size={14} /></motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showAdd && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.6)', zIndex: 200,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(8px)'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="google-card"
                            style={{ width: '400px', padding: '32px', background: '#1E1E24', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <h2 className="text-headline" style={{ marginTop: 0, marginBottom: '24px' }}>New Product</h2>
                            <form onSubmit={handleAdd}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label className="text-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>NAME</label>
                                    <input
                                        autoFocus
                                        className="google-input"
                                        value={newItem.name}
                                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                        placeholder="e.g. Cardamom Tea"
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label className="text-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>PRICE (₹)</label>
                                        <input
                                            type="number"
                                            className="google-input"
                                            value={newItem.price}
                                            onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label className="text-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>STOCK</label>
                                        <input
                                            type="number"
                                            className="google-input"
                                            value={newItem.stock}
                                            onChange={e => setNewItem({ ...newItem, stock: e.target.value })}
                                            placeholder="100"
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowAdd(false)}
                                        style={{ flex: 1, padding: '16px', borderRadius: '16px', border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="fab-btn"
                                        style={{ flex: 2, justifyContent: 'center' }}
                                    >
                                        Save Item
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StockUpdate;
