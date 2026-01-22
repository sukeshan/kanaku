import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MenuItem = memo(({ item, qty, updateQty, idx }) => {
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
                    background: item.imageUrl ? 'transparent' : item.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem',
                    overflow: 'hidden'
                }}>
                    {item.imageUrl ? (
                        <img
                            src={item.imageUrl}
                            alt={item.name}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '16px'
                            }}
                        />
                    ) : (
                        '✨'
                    )}
                </div>
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
}, (prevProps, nextProps) => {
    return prevProps.qty === nextProps.qty &&
        prevProps.item === nextProps.item &&
        prevProps.item.stock === nextProps.item.stock &&
        prevProps.item.imageUrl === nextProps.item.imageUrl;
});

export default MenuItem;
