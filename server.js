/* eslint-disable no-undef */
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CSV file path - stored in the server's data directory
const DATA_DIR = path.join(__dirname, 'data');
const CSV_FILE = path.join(DATA_DIR, 'kanaku_data.csv');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Large limit for base64 images
app.use(express.static(path.join(__dirname, 'dist')));

// ============ API ENDPOINTS ============

// GET /api/data - Read data from CSV
app.get('/api/data', (req, res) => {
    try {
        if (!fs.existsSync(CSV_FILE)) {
            // Return empty data if file doesn't exist
            return res.json({
                success: true,
                data: { items: [], orders: [], users: [] }
            });
        }

        const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
        const data = parseUnifiedCSV(csvContent);

        res.json({
            success: true,
            data: data,
            lastModified: fs.statSync(CSV_FILE).mtime
        });
    } catch (error) {
        console.error('Error reading CSV:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/data - Save data to CSV
app.post('/api/data', (req, res) => {
    try {
        const { items, orders, users } = req.body;

        if (!items && !orders && !users) {
            return res.status(400).json({
                success: false,
                error: 'No data provided'
            });
        }

        const csvContent = generateUnifiedCSV({ items, orders, users });
        fs.writeFileSync(CSV_FILE, csvContent, 'utf-8');

        res.json({
            success: true,
            message: 'Data saved successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error saving CSV:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /api/data/download - Download CSV file
app.get('/api/data/download', (req, res) => {
    try {
        if (!fs.existsSync(CSV_FILE)) {
            return res.status(404).json({
                success: false,
                error: 'No data file exists'
            });
        }

        res.download(CSV_FILE, `kanaku_backup_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// POST /api/data/upload - Upload and overwrite CSV file
app.post('/api/data/upload', (req, res) => {
    try {
        const { csvContent } = req.body;

        if (!csvContent) {
            return res.status(400).json({
                success: false,
                error: 'No CSV content provided'
            });
        }

        fs.writeFileSync(CSV_FILE, csvContent, 'utf-8');
        const data = parseUnifiedCSV(csvContent);

        res.json({
            success: true,
            message: 'CSV uploaded successfully',
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ============ CSV PARSING UTILITIES ============

function parseUnifiedCSV(csvContent) {
    const result = {
        items: [],
        orders: [],
        users: []
    };

    const sections = csvContent.split(/(\[ITEMS\]|\[ORDERS\]|\[USERS\])/);

    let currentSection = null;
    for (let i = 0; i < sections.length; i++) {
        const part = sections[i].trim();

        if (part === '[ITEMS]') {
            currentSection = 'items';
        } else if (part === '[ORDERS]') {
            currentSection = 'orders';
        } else if (part === '[USERS]') {
            currentSection = 'users';
        } else if (currentSection && part) {
            result[currentSection] = parseCSVSection(part);
        }
    }

    return result;
}

function parseCSVSection(csvString) {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values = [];
        let current = '';
        let inQuotes = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        const obj = {};
        headers.forEach((header, idx) => {
            let value = values[idx] || '';
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }
            if ((header === 'items' || header === 'user') && value) {
                try {
                    obj[header] = JSON.parse(value);
                } catch {
                    obj[header] = value;
                }
            } else if (header === 'price' || header === 'stock' || header === 'count' || header === 'total') {
                const numValue = value.replace(/[₹,]/g, '');
                obj[header] = numValue ? Number(numValue) : 0;
            } else {
                obj[header] = value;
            }
        });
        rows.push(obj);
    }

    return rows;
}

function generateUnifiedCSV(data) {
    const { items = [], orders = [], users = [] } = data;
    let csv = '';

    const escapeCSVValue = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    // ITEMS section
    csv += '[ITEMS]\n';
    csv += 'id,name,price,stock,count,color,imageUrl\n';
    items.forEach(item => {
        csv += [
            escapeCSVValue(item.id),
            escapeCSVValue(item.name),
            item.price || 0,
            item.stock || 0,
            item.count || 0,
            escapeCSVValue(item.color || ''),
            escapeCSVValue(item.imageUrl || '')
        ].join(',') + '\n';
    });

    csv += '\n';

    // ORDERS section
    csv += '[ORDERS]\n';
    csv += 'id,timestamp,items,total,user,device\n';
    orders.forEach(order => {
        csv += [
            escapeCSVValue(order.id),
            escapeCSVValue(order.timestamp),
            escapeCSVValue(JSON.stringify(order.items || [])),
            order.total || 0,
            escapeCSVValue(JSON.stringify(order.user || {})),
            escapeCSVValue(order.device || '')
        ].join(',') + '\n';
    });

    csv += '\n';

    // USERS section
    csv += '[USERS]\n';
    csv += 'id,name,avatar\n';
    users.forEach(user => {
        csv += [
            escapeCSVValue(user.id),
            escapeCSVValue(user.name),
            escapeCSVValue(user.avatar || '👤')
        ].join(',') + '\n';
    });

    return csv;
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Kanaku server running on port ${PORT}`);
    console.log(`📁 Data stored in: ${CSV_FILE}`);
    console.log(`🌐 API available at: http://localhost:${PORT}/api/data`);
});
