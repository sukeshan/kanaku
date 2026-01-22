/**
 * API utilities for communicating with the backend server
 */

// API base URL - uses relative path in production, localhost in development
const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:3001/api';

/**
 * Fetch all data from the server
 * @returns {Promise<{items: Array, orders: Array, users: Array}>}
 */
export const fetchData = async () => {
    try {
        const response = await fetch(`${API_BASE}/data`);
        const result = await response.json();

        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error || 'Failed to fetch data');
        }
    } catch (error) {
        console.error('API fetch error:', error);
        // Return null to indicate server is not available
        return null;
    }
};

/**
 * Save all data to the server
 * @param {Object} data - { items, orders, users }
 * @returns {Promise<boolean>}
 */
export const saveData = async (data) => {
    try {
        const response = await fetch(`${API_BASE}/data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        return result.success;
    } catch (error) {
        console.error('API save error:', error);
        return false;
    }
};

/**
 * Upload CSV content to the server
 * @param {string} csvContent - Raw CSV content
 * @returns {Promise<Object|null>}
 */
export const uploadCSV = async (csvContent) => {
    try {
        const response = await fetch(`${API_BASE}/data/upload`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ csvContent }),
        });

        const result = await response.json();
        if (result.success) {
            return result.data;
        }
        throw new Error(result.error);
    } catch (error) {
        console.error('API upload error:', error);
        return null;
    }
};

/**
 * Check if the server is available
 * @returns {Promise<boolean>}
 */
export const checkServerStatus = async () => {
    try {
        const response = await fetch(`${API_BASE}/data`, { method: 'HEAD' });
        return response.ok;
    } catch {
        return false;
    }
};
