import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Coffee } from 'lucide-react';
import adminProfile from '../assets/admin_profile.jpg';

const Login = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === 'admin') {
            onLogin();
        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            color: '#fff',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Background decorative elements */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '800px',
                height: '800px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(108, 92, 231, 0.1) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-30%',
                left: '-10%',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0, 206, 201, 0.08) 0%, transparent 70%)',
                pointerEvents: 'none'
            }} />

            {/* Floating tea cups decoration */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 100 }}
                    animate={{
                        opacity: 0.1,
                        y: [0, -20, 0],
                        x: [0, 10, 0]
                    }}
                    transition={{
                        delay: i * 0.2,
                        duration: 4 + i,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                    style={{
                        position: 'absolute',
                        top: `${20 + i * 15}%`,
                        left: `${10 + i * 18}%`,
                        fontSize: '2rem',
                        pointerEvents: 'none'
                    }}
                >
                    ☕
                </motion.div>
            ))}

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '32px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '3rem 2.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1.5rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                {/* Profile Image with glow effect */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    style={{
                        position: 'relative',
                        marginBottom: '0.5rem'
                    }}
                >
                    {/* Glow ring */}
                    <motion.div
                        animate={{
                            boxShadow: isHovered
                                ? '0 0 60px rgba(108, 92, 231, 0.6), 0 0 100px rgba(108, 92, 231, 0.3)'
                                : '0 0 30px rgba(108, 92, 231, 0.3), 0 0 60px rgba(108, 92, 231, 0.1)'
                        }}
                        style={{
                            width: '140px',
                            height: '140px',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            border: '3px solid rgba(108, 92, 231, 0.5)',
                            position: 'relative'
                        }}
                    >
                        <img
                            src={adminProfile}
                            alt="Meiyazhagan Tea Shop"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </motion.div>

                    {/* Verified badge */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                        style={{
                            position: 'absolute',
                            bottom: '-8px',
                            right: '-8px',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(108, 92, 231, 0.5)'
                        }}
                    >
                        <Coffee size={18} color="#fff" />
                    </motion.div>
                </motion.div>

                {/* Title */}
                <div style={{ textAlign: 'center' }}>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        style={{
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            margin: 0,
                            background: 'linear-gradient(135deg, #fff 0%, #a0a0b0 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Meiyazhagan
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            color: '#8E8E93',
                            margin: '8px 0 0 0',
                            fontSize: '0.95rem',
                            letterSpacing: '2px',
                            textTransform: 'uppercase'
                        }}
                    >
                        Tea Shop Admin
                    </motion.p>
                </div>

                {/* Divider */}
                <div style={{
                    width: '60px',
                    height: '3px',
                    background: 'linear-gradient(90deg, transparent, #6c5ce7, transparent)',
                    borderRadius: '2px'
                }} />

                {/* Login Form */}
                <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <motion.div
                        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                        <div style={{ position: 'relative' }}>
                            <Lock
                                size={18}
                                color="#6c5ce7"
                                style={{
                                    position: 'absolute',
                                    left: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)'
                                }}
                            />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                style={{
                                    width: '100%',
                                    padding: '16px 16px 16px 48px',
                                    borderRadius: '16px',
                                    border: error ? '2px solid #ff6b6b' : '2px solid rgba(108, 92, 231, 0.3)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    color: '#fff',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    transition: 'all 0.3s ease'
                                }}
                                autoFocus
                            />
                        </div>
                    </motion.div>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(108, 92, 231, 0.4)' }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '16px',
                            border: 'none',
                            background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
                            color: '#fff',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: '0 8px 30px rgba(108, 92, 231, 0.3)',
                            marginTop: '0.5rem'
                        }}
                    >
                        <span>Access Dashboard</span>
                        <ArrowRight size={20} />
                    </motion.button>
                </form>

                {/* Footer hint */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    transition={{ delay: 0.6 }}
                    style={{
                        fontSize: '0.8rem',
                        color: '#666',
                        margin: '0.5rem 0 0 0',
                        textAlign: 'center'
                    }}
                >
                    🍵 Serving quality since tradition
                </motion.p>
            </motion.div>
        </div>
    );
};

export default Login;
