import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, ShoppingBag, CreditCard, IndianRupee } from 'lucide-react';

const OrderDetailModal = ({ isOpen, onClose, order }) => {
    if (!order) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '20px'
                        }}
                    >
                        {/* Modal Content */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="pro-glass"
                            style={{
                                width: '100%',
                                maxWidth: '500px',
                                maxHeight: '85vh',
                                overflowY: 'auto',
                                padding: '0',
                                position: 'relative',
                                background: '#1e1e24', // Fallback
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                padding: '24px',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                position: 'sticky',
                                top: 0,
                                background: 'rgba(30, 30, 36, 0.95)',
                                backdropFilter: 'blur(10px)',
                                zIndex: 10
                            }}>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        Order Details
                                    </h2>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace', opacity: 0.7 }}>
                                        #{order.id.split('_').pop()}
                                    </span>
                                </div>
                                <button
                                    onClick={onClose}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Body */}
                            <div style={{ padding: '24px' }}>
                                {/* Meta Info Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                        <div style={{ padding: '8px', background: 'rgba(108, 92, 231, 0.1)', borderRadius: '8px', color: '#6c5ce7' }}>
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Date & Time</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                                {new Date(order.timestamp).toLocaleDateString()}
                                            </div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                                                {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                        <div style={{ padding: '8px', background: 'rgba(0, 206, 201, 0.1)', borderRadius: '8px', color: '#00cec9' }}>
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Staff</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{order.user?.name || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{order.device || 'Terminal 1'}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <ShoppingBag size={14} /> Items ({order.items.length})
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '12px',
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255, 255, 255, 0.02)'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '32px', height: '32px', borderRadius: '8px',
                                                        background: item.color || '#6c5ce7',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.8rem', fontWeight: 700, color: '#fff'
                                                    }}>
                                                        {item.qty}x
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>₹{item.price} per unit</div>
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: 700 }}>₹{item.price * item.qty}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Total */}
                                <div style={{
                                    padding: '20px',
                                    background: 'rgba(0, 184, 148, 0.1)',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    border: '1px solid rgba(0, 184, 148, 0.2)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' }}>
                                        <CreditCard size={20} />
                                        <span style={{ fontWeight: 600 }}>Total Paid</span>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', display: 'flex', alignItems: 'center' }}>
                                        <IndianRupee size={22} style={{ marginRight: '2px' }} />
                                        {order.total}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OrderDetailModal;
