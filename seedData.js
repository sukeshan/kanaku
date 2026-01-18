// Seed script to populate dummy orders for testing analytics
// Run this in browser console or add as a button in the app

const seedDummyOrders = () => {
    // Get existing data from localStorage
    const existingItems = JSON.parse(localStorage.getItem('kanaku_items') || '[]');
    const existingUsers = JSON.parse(localStorage.getItem('kanaku_users') || '[]');
    const existingOrders = JSON.parse(localStorage.getItem('kanaku_orders') || '[]');

    // Sample items (use existing or create defaults)
    const items = existingItems.length > 0 ? existingItems : [
        { id: '1', name: 'Masala Chai', price: 20, stock: 100, color: '#6c5ce7' },
        { id: '2', name: 'Lemon Tea', price: 15, stock: 80, color: '#00cec9' },
        { id: '3', name: 'Coffee', price: 25, stock: 120, color: '#fdcb6e' },
        { id: '4', name: 'Green Tea', price: 30, stock: 60, color: '#ff7675' },
        { id: '5', name: 'Black Tea', price: 18, stock: 90, color: '#a29bfe' },
        { id: '6', name: 'Ginger Tea', price: 22, stock: 70, color: '#81ecec' }
    ];

    // Sample users (use existing or create defaults)
    const users = existingUsers.length > 0 ? existingUsers : [
        { id: 'u1', name: 'Owner', avatar: '👑' },
        { id: 'u2', name: 'Staff 1', avatar: '👨‍🍳' }
    ];

    // Generate orders spanning last 60 days
    const orders = [];
    const now = new Date();

    // Helper to get random item from array
    const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Helper to generate random date in past N days
    const randomDate = (daysAgo) => {
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        // Random hour between 8am and 8pm
        date.setHours(8 + Math.floor(Math.random() * 12));
        date.setMinutes(Math.floor(Math.random() * 60));
        return date;
    };

    // Generate 150 orders across 60 days
    for (let i = 0; i < 150; i++) {
        const daysAgo = Math.floor(Math.random() * 60); // Random day in last 60 days
        const timestamp = randomDate(daysAgo);

        // Random number of items in order (1-4)
        const numItems = 1 + Math.floor(Math.random() * 4);
        const orderItems = [];
        let total = 0;

        for (let j = 0; j < numItems; j++) {
            const item = randomItem(items);
            const qty = 1 + Math.floor(Math.random() * 3); // 1-3 quantity
            orderItems.push({
                ...item,
                qty
            });
            total += item.price * qty;
        }

        orders.push({
            id: `order_${Date.now()}_${i}`,
            timestamp: timestamp.toISOString(),
            items: orderItems,
            total,
            user: randomItem(users)
        });
    }

    // Sort orders by timestamp (newest first)
    orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Combine with existing orders and save
    const allOrders = [...orders, ...existingOrders];
    localStorage.setItem('kanaku_orders', JSON.stringify(allOrders));
    localStorage.setItem('kanaku_items', JSON.stringify(items));
    localStorage.setItem('kanaku_users', JSON.stringify(users));

    console.log(`✅ Added ${orders.length} dummy orders!`);
    console.log(`📊 Total orders: ${allOrders.length}`);
    console.log(`💰 Total revenue: ₹${allOrders.reduce((sum, o) => sum + o.total, 0)}`);
    console.log('🔄 Refresh the page to see the data!');

    return {
        ordersAdded: orders.length,
        totalOrders: allOrders.length,
        totalRevenue: allOrders.reduce((sum, o) => sum + o.total, 0)
    };
};

// Auto-run if in browser console
if (typeof window !== 'undefined') {
    console.log('📝 Dummy data seeding script loaded!');
    console.log('💡 Run: seedDummyOrders()');
}

// Export for use in app
// eslint-disable-next-line no-undef
if (typeof module !== 'undefined' && module.exports) {
    // eslint-disable-next-line no-undef
    module.exports = seedDummyOrders;
}
