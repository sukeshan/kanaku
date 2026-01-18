import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Check, ChevronDown, Edit2, UserPlus, X } from 'lucide-react';
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

export default ProfileManager;
