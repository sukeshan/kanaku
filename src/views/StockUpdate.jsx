import React, { useState, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Minus, AlertTriangle, Image, X, Trash2, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { imageToBase64, compressImage } from '../utils/csvUtils';

const StockUpdate = () => {
    const { items, addItem, updateStock, setStockValue, deleteItem, editItem } = useStore();
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [newItem, setNewItem] = useState({ name: '', price: '', stock: '', imageUrl: '' });
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);
    const editFileInputRef = useRef(null);

    const handleImageUpload = async (e, isEdit = false) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        try {
            const base64 = await imageToBase64(file);
            const compressed = await compressImage(base64, 200, 0.7);

            if (isEdit) {
                setEditingItem({ ...editingItem, imageUrl: compressed });
            } else {
                setImagePreview(compressed);
                setNewItem({ ...newItem, imageUrl: compressed });
            }
        } catch (error) {
            console.error('Image upload error:', error);
            alert('Failed to load image');
        }
    };

    const clearImage = (isEdit = false) => {
        if (isEdit) {
            setEditingItem({ ...editingItem, imageUrl: '' });
            if (editFileInputRef.current) editFileInputRef.current.value = '';
        } else {
            setImagePreview('');
            setNewItem({ ...newItem, imageUrl: '' });
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newItem.name || !newItem.price) return;
        addItem({
            name: newItem.name,
            price: Number(newItem.price),
            stock: Number(newItem.stock) || 0,
            color: `hsl(${Math.random() * 360}, 70%, 65%)`,
            imageUrl: newItem.imageUrl
        });
        setNewItem({ name: '', price: '', stock: '', imageUrl: '' });
        setImagePreview('');
        setShowAdd(false);
    };

    const handleEdit = (e) => {
        e.preventDefault();
        if (!editingItem.name || !editingItem.price) return;
        editItem(editingItem.id, {
            name: editingItem.name,
            price: Number(editingItem.price),
            stock: Number(editingItem.stock) || 0,
            imageUrl: editingItem.imageUrl || ''
        });
        setEditingItem(null);
        setShowEdit(false);
    };

    const handleDelete = (item) => {
        const confirmed = window.confirm(`Are you sure you want to delete "${item.name}"?`);
        if (confirmed) {
            deleteItem(item.id);
        }
    };

    const openEditModal = (item) => {
        setEditingItem({ ...item });
        setShowEdit(true);
    };

    const handleClose = () => {
        setShowAdd(false);
        setNewItem({ name: '', price: '', stock: '', imageUrl: '' });
        setImagePreview('');
    };

    const handleCloseEdit = () => {
        setShowEdit(false);
        setEditingItem(null);
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
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="google-card"
                                style={{
                                    padding: '24px',
                                    display: 'flex', flexDirection: 'column',
                                    border: isLow ? '1px solid var(--error)' : '1px solid rgba(255,255,255,0.03)',
                                    background: isLow ? 'rgba(255, 180, 171, 0.05)' : 'var(--bg-surface)',
                                    position: 'relative'
                                }}
                            >
                                {/* Action Buttons */}
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    display: 'flex',
                                    gap: '8px',
                                    opacity: 0.7,
                                    transition: 'opacity 0.2s'
                                }}>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => openEditModal(item)}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: 'var(--bg-elevated)',
                                            color: 'var(--text-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Edit3 size={14} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleDelete(item)}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            border: 'none',
                                            background: 'rgba(255, 107, 107, 0.1)',
                                            color: 'var(--error)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <Trash2 size={14} />
                                    </motion.button>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{
                                        width: '56px', height: '56px', borderRadius: '16px',
                                        background: item.imageUrl ? 'transparent' : item.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        overflow: 'hidden'
                                    }}>
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            '📦'
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'right', marginRight: '80px' }}>
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

            {/* Add New Item Modal */}
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
                                {/* Image Upload Section */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label className="text-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                        PRODUCT IMAGE (Optional)
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        {imagePreview ? (
                                            <div style={{ position: 'relative' }}>
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    style={{
                                                        width: '80px',
                                                        height: '80px',
                                                        borderRadius: '16px',
                                                        objectFit: 'cover',
                                                        border: '2px solid var(--primary)'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => clearImage(false)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-8px',
                                                        right: '-8px',
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        background: 'var(--error)',
                                                        border: 'none',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    borderRadius: '16px',
                                                    border: '2px dashed var(--text-tertiary)',
                                                    background: 'transparent',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '4px',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-tertiary)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Image size={24} />
                                                <span style={{ fontSize: '0.65rem' }}>Upload</span>
                                            </button>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, false)}
                                            style={{ display: 'none' }}
                                        />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                            Add an image to display in orders
                                        </span>
                                    </div>
                                </div>

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
                                        onClick={handleClose}
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

            {/* Edit Item Modal */}
            <AnimatePresence>
                {showEdit && editingItem && (
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
                            <h2 className="text-headline" style={{ marginTop: 0, marginBottom: '24px' }}>Edit Product</h2>
                            <form onSubmit={handleEdit}>
                                {/* Image Upload Section */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label className="text-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                        PRODUCT IMAGE
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        {editingItem.imageUrl ? (
                                            <div style={{ position: 'relative' }}>
                                                <img
                                                    src={editingItem.imageUrl}
                                                    alt="Preview"
                                                    style={{
                                                        width: '80px',
                                                        height: '80px',
                                                        borderRadius: '16px',
                                                        objectFit: 'cover',
                                                        border: '2px solid var(--primary)'
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => clearImage(true)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '-8px',
                                                        right: '-8px',
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '50%',
                                                        background: 'var(--error)',
                                                        border: 'none',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => editFileInputRef.current?.click()}
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    borderRadius: '16px',
                                                    border: '2px dashed var(--text-tertiary)',
                                                    background: editingItem.color || 'transparent',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '4px',
                                                    cursor: 'pointer',
                                                    color: 'var(--text-tertiary)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Image size={24} />
                                                <span style={{ fontSize: '0.65rem' }}>Upload</span>
                                            </button>
                                        )}
                                        <input
                                            ref={editFileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, true)}
                                            style={{ display: 'none' }}
                                        />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                                            Update product image
                                        </span>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label className="text-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>NAME</label>
                                    <input
                                        autoFocus
                                        className="google-input"
                                        value={editingItem.name}
                                        onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                                        placeholder="e.g. Cardamom Tea"
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label className="text-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>PRICE (₹)</label>
                                        <input
                                            type="number"
                                            className="google-input"
                                            value={editingItem.price}
                                            onChange={e => setEditingItem({ ...editingItem, price: e.target.value })}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label className="text-label" style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>STOCK</label>
                                        <input
                                            type="number"
                                            className="google-input"
                                            value={editingItem.stock}
                                            onChange={e => setEditingItem({ ...editingItem, stock: e.target.value })}
                                            placeholder="100"
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <button
                                        type="button"
                                        onClick={handleCloseEdit}
                                        style={{ flex: 1, padding: '16px', borderRadius: '16px', border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="fab-btn"
                                        style={{ flex: 2, justifyContent: 'center' }}
                                    >
                                        Update Item
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
