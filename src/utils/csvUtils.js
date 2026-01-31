/**
 * CSV Utilities for Kanaku Data Management
 * Handles unified CSV format with sections for Items, Orders, and Users
 */

// Section markers for the unified CSV format
const SECTIONS = {
  ITEMS: '[ITEMS]',
  ORDERS: '[ORDERS]',
  USERS: '[USERS]'
};

/**
 * Parse a CSV string into an array of objects
 * @param {string} csvString - Raw CSV text for a single section
 * @returns {Array} Array of parsed objects
 */
const parseCSVSection = (csvString) => {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Handle quoted fields with commas
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
      // Remove surrounding quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      // Unescape double quotes (CSV uses "" to represent a single ")
      value = value.replace(/""/g, '"');

      // Try to parse JSON for complex fields
      if ((header === 'items' || header === 'user') && value) {
        try {
          obj[header] = JSON.parse(value);
        } catch (e) {
          console.warn('Failed to parse JSON for', header, ':', e.message, 'Value:', value.substring(0, 100));
          obj[header] = value;
        }
      } else if (header === 'price' || header === 'stock' || header === 'count' || header === 'total') {
        // Parse numbers, removing currency symbols
        const numValue = value.replace(/[₹,]/g, '');
        obj[header] = numValue ? Number(numValue) : 0;
      } else {
        obj[header] = value;
      }
    });
    rows.push(obj);
  }

  return rows;
};

/**
 * Parse unified CSV with sections into structured data
 * @param {string} csvContent - Full CSV content with section markers
 * @returns {Object} Object with items, orders, users arrays
 */
export const parseUnifiedCSV = (csvContent) => {
  const result = {
    items: [],
    orders: [],
    users: []
  };

  // Split by section markers
  const sections = csvContent.split(/(\[ITEMS\]|\[ORDERS\]|\[USERS\])/);

  let currentSection = null;
  for (let i = 0; i < sections.length; i++) {
    const part = sections[i].trim();

    if (part === SECTIONS.ITEMS) {
      currentSection = 'items';
    } else if (part === SECTIONS.ORDERS) {
      currentSection = 'orders';
    } else if (part === SECTIONS.USERS) {
      currentSection = 'users';
    } else if (currentSection && part) {
      result[currentSection] = parseCSVSection(part);
    }
  }

  return result;
};

/**
 * Escape a value for CSV (handle commas, quotes, newlines)
 * @param {string} value - Value to escape
 * @returns {string} Escaped value
 */
const escapeCSVValue = (value) => {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Generate unified CSV from app data
 * @param {Object} data - Object with items, orders, users arrays
 * @returns {string} CSV content
 */
export const generateUnifiedCSV = (data) => {
  const { items = [], orders = [], users = [] } = data;
  let csv = '';

  // ITEMS section
  csv += `${SECTIONS.ITEMS}\n`;
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
  csv += `${SECTIONS.ORDERS}\n`;
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
  csv += `${SECTIONS.USERS}\n`;
  csv += 'id,name,avatar\n';
  users.forEach(user => {
    csv += [
      escapeCSVValue(user.id),
      escapeCSVValue(user.name),
      escapeCSVValue(user.avatar || '👤')
    ].join(',') + '\n';
  });

  return csv;
};

/**
 * Trigger download of CSV file
 * @param {string} content - CSV content
 * @param {string} filename - Filename for download
 */
export const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Read a CSV file and return its content
 * @param {File} file - File object from file input
 * @returns {Promise<string>} CSV content as string
 */
export const readCSVFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

/**
 * Convert image file to Base64 data URL
 * @param {File} file - Image file
 * @returns {Promise<string>} Base64 data URL
 */
export const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

/**
 * Compress an image to reduce storage size
 * @param {string} base64 - Original base64 image
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} quality - JPEG quality 0-1
 * @returns {Promise<string>} Compressed base64 image
 */
export const compressImage = (base64, maxWidth = 200, quality = 0.7) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = base64;
  });
};
