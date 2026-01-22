// Seed script to populate dummy orders for testing analytics
// Run this in browser console or add as a button in the app

const seedDummyOrders = () => {
    // Get existing data from localStorage
    const existingItems = JSON.parse(localStorage.getItem('kanaku_items') || '[]');
    const existingUsers = JSON.parse(localStorage.getItem('kanaku_users') || '[]');

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

    // Generate orders spanning last 365 days
    const orders = [];
    const now = new Date();

    // Helper to get random item from array
    const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Create orders for each day in the last 365 days
    for (let daysAgo = 0; daysAgo < 365; daysAgo++) {
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        const dayOfWeek = date.getDay();
        const month = date.getMonth(); // 0-11

        // Base orders: 2-5 per day, increasing slightly over the year (growth trend)
        // Growth factor: 0.5 (start of year) -> 1.5 (end of year)
        const yearProgress = 1 - (daysAgo / 365);
        const growthFactor = 0.5 + yearProgress;

        let ordersForDay = Math.floor((3 + Math.random() * 5) * growthFactor);

        // Weekend boost
        if (dayOfWeek === 0 || dayOfWeek === 6) ordersForDay += Math.floor(3 * growthFactor);
        // Monday slowdown
        if (dayOfWeek === 1) ordersForDay = Math.max(1, ordersForDay - 1);

        // Seasonal Spikes
        // Winter (Dec/Jan): +40%
        if (month === 11 || month === 0) ordersForDay = Math.floor(ordersForDay * 1.4);
        // Summer (May/Jun): +20%
        if (month === 4 || month === 5) ordersForDay = Math.floor(ordersForDay * 1.2);

        // Recent days have more orders (simulate recent virality/growth)
        if (daysAgo < 30) ordersForDay += 5;
        if (daysAgo < 7) ordersForDay += 5;

        // Special boost for 10th of each month (Payday spike)
        if (date.getDate() === 10) ordersForDay = Math.max(ordersForDay, 20 + Math.floor(Math.random() * 10));

        // Today: Heavy activity for Live Feed testing
        if (daysAgo === 0) ordersForDay = 25 + Math.floor(Math.random() * 10);

        for (let orderIdx = 0; orderIdx < ordersForDay; orderIdx++) {
            const orderDate = new Date(date);
            // Peak hours: 8-10am, 12-2pm, 4-6pm
            const peakHours = [8, 9, 10, 12, 13, 14, 16, 17, 18];
            const hour = Math.random() > 0.3 ? peakHours[Math.floor(Math.random() * peakHours.length)] : 8 + Math.floor(Math.random() * 13);
            const minute = Math.floor(Math.random() * 60);
            orderDate.setHours(hour, minute, 0, 0);

            // Don't generate future orders for today
            if (daysAgo === 0 && orderDate > now) continue;

            const numItems = 1 + Math.floor(Math.random() * 5); // Larger baskets
            const orderItems = [];
            let total = 0;

            for (let j = 0; j < numItems; j++) {
                const item = randomItem(items);
                const qty = 1 + Math.floor(Math.random() * 3);
                orderItems.push({ ...item, qty });
                total += item.price * qty;
            }

            orders.push({
                id: `order_${Date.now()}_${daysAgo}_${orderIdx}`,
                timestamp: orderDate.toISOString(),
                items: orderItems,
                total,
                user: randomItem(users),
                device: Math.random() > 0.7 ? 'Mobile Order' : 'POS Terminal'
            });
        }
    }

    // Sort orders by timestamp (newest first)
    orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Combine with existing orders and save (Overwrite usually preferred for clean testing, but script says combine)
    // IMPORTANT: The request is "create dummy orders in different date".
    // I previously implemented overwriting in Summary.jsx. Here I will overwrite too to be consistent or maybe append?
    // Let's overwrite to ensure clean state as per the Summary.jsx logic, or stick to append if that's safer.
    // However, if the user wants to *duplicate* data, appending is better. But duplicate IDs might be an issue?
    // The IDs generated are unique `order_${Date.now()}_...` so appending is safe.
    // Let's stick to OVERWRITE (or clear and set) to match the "Generate Demo Data" button behavior which is definitive.
    // Wait, the original script did `[...orders, ...existingOrders]`.
    // If I want to exactly match the button (which the user might be used to), I should just return `orders`.

    // I'll stick to replacing `kanaku_orders` to avoid massive duplicates if run multiple times.
    const allOrders = orders;
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
