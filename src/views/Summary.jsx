import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Calendar, TrendingUp, Activity, ArrowUpRight, Download } from 'lucide-react';
import OrderDetailModal from '../components/OrderDetailModal';

const Summary = () => {
    const { orders, exportOrdersToCSV, exportItemsToCSV } = useStore();
    const [selectedOrder, setSelectedOrder] = useState(null);

    const analytics = useMemo(() => {
        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
        const totalOrders = orders.length;

        // Item popularity
        const itemCounts = {};
        orders.forEach(o => {
            o.items.forEach(i => {
                itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty;
            });
        });

        const doughnutData = {
            labels: Object.keys(itemCounts),
            datasets: [
                {
                    data: Object.values(itemCounts),
                    backgroundColor: [
                        '#6c5ce7', '#00cec9', '#fdcb6e', '#ff7675', '#a29bfe', '#81ecec'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                },
            ],
        };

        return { totalRevenue, totalOrders, doughnutData };
    }, [orders]);

    const seedDummyData = () => {
        const items = [
            { id: '1', name: 'Masala Chai', price: 20, stock: 100, color: '#6c5ce7', count: 0 },
            { id: '2', name: 'Lemon Tea', price: 15, stock: 80, color: '#00cec9', count: 0 },
            { id: '3', name: 'Coffee', price: 25, stock: 120, color: '#fdcb6e', count: 0 },
            { id: '4', name: 'Green Tea', price: 30, stock: 60, color: '#ff7675', count: 0 },
            { id: '5', name: 'Black Tea', price: 18, stock: 90, color: '#a29bfe', count: 0 },
            { id: '6', name: 'Ginger Tea', price: 22, stock: 70, color: '#81ecec', count: 0 },
            { id: '7', name: 'Samosa', price: 10, stock: 150, color: '#fab1a0', count: 0 },
            { id: '8', name: 'Pakora', price: 12, stock: 120, color: '#ff7979', count: 0 },
            { id: '9', name: 'Vada Pav', price: 15, stock: 100, color: '#74b9ff', count: 0 },
            { id: '10', name: 'Biscuits', price: 5, stock: 200, color: '#ffeaa7', count: 0 }
        ];

        const users = [
            { id: 'u1', name: 'Owner', avatar: '👑' },
            { id: 'u2', name: 'Staff 1', avatar: '👨‍🍳' },
            { id: 'u3', name: 'Staff 2', avatar: '👩‍🍳' }
        ];

        const newOrders = [];
        const now = new Date();

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

                newOrders.push({
                    id: `order_${Date.now()}_${daysAgo}_${orderIdx}`,
                    timestamp: orderDate.toISOString(),
                    items: orderItems,
                    total,
                    user: randomItem(users),
                    device: Math.random() > 0.7 ? 'Mobile Order' : 'POS Terminal'
                });
            }
        }

        newOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        localStorage.setItem('kanaku_orders', JSON.stringify(newOrders));
        localStorage.setItem('kanaku_items', JSON.stringify(items));
        localStorage.setItem('kanaku_users', JSON.stringify(users));

        const totalRevenue = newOrders.reduce((sum, o) => sum + o.total, 0);
        alert(`✅ Generated ${newOrders.length} orders across 365 days!\n💰 Total revenue: ₹${totalRevenue.toLocaleString()}\n📊 Covers 1 year with seasonal trends\n\nRefreshing page...`);
        window.location.reload();
    };

    return (
        <div style={{ padding: '40px', overflowY: 'auto', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 className="title-xl" style={{ margin: 0 }}>Business Insights</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {orders.length === 0 && (
                        <button
                            onClick={seedDummyData}
                            className="fab-btn"
                            style={{ background: 'var(--success)' }}
                        >
                            🎲 Generate Demo Data
                        </button>
                    )}
                    {orders.length > 0 && (
                        <>
                            <button
                                onClick={exportOrdersToCSV}
                                className="fab-btn"
                                style={{ background: 'var(--primary)', padding: '12px 20px' }}
                            >
                                <Download size={18} /> Export Orders
                            </button>
                            <button
                                onClick={exportItemsToCSV}
                                className="fab-btn"
                                style={{ background: 'var(--secondary)', padding: '12px 20px' }}
                            >
                                <Download size={18} /> Export Inventory
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Top KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                <KPICard
                    label="Net Revenue"
                    value={`₹${analytics.totalRevenue}`}
                    icon={<TrendingUp color="var(--success)" />}
                    change="+12% today"
                />
                <KPICard
                    label="Total Orders"
                    value={analytics.totalOrders}
                    icon={<Activity color="var(--primary)" />}
                    change="+5 since last hour"
                />
                <KPICard
                    label="Avg Order Value"
                    value={`₹${analytics.totalOrders ? Math.round(analytics.totalRevenue / analytics.totalOrders) : 0}`}
                    icon={<Calendar color="var(--warning)" />}
                    change="Stable"
                />
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div className="pro-glass" style={{ padding: '32px' }}>
                    <h3 className="title-lg" style={{ marginTop: 0, marginBottom: '24px' }}>Top Selling Items</h3>
                    {orders.length > 0 ? (
                        <div style={{ height: '300px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                            <Doughnut
                                data={analytics.doughnutData}
                                options={{
                                    cutout: '70%',
                                    plugins: {
                                        legend: { position: 'right', labels: { color: '#a0a0b0', usePointStyle: true, padding: 20 } }
                                    },
                                    maintainAspectRatio: false
                                }}
                            />
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 800 }}>{Object.values(analytics.doughnutData.datasets[0].data).reduce((a, b) => a + b, 0)}</span>
                                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Items Sold</p>
                            </div>
                        </div>
                    ) : (
                        <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '20px' }}>
                            <span style={{ opacity: 0.5 }}>No sales data yet</span>
                        </div>
                    )}
                </div>

                <div className="pro-glass" style={{ padding: '32px', display: 'flex', flexDirection: 'column', height: '420px' }}>
                    <h3 className="title-lg" style={{ marginTop: 0, marginBottom: '24px' }}>Live Activity Feed</h3>
                    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                        {orders.slice(0, 50).map((o, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedOrder(o)}
                                style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <ArrowUpRight size={18} color="var(--success)" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>New Order</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • by {o.user.name} {o.device && <span style={{ opacity: 0.6 }}>• {o.device}</span>}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>+₹{o.total}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{o.items.length} Items</div>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && <p style={{ opacity: 0.5, textAlign: 'center', marginTop: '40px' }}>Waiting for orders...</p>}
                    </div>
                </div>
            </div>

            <OrderDetailModal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                order={selectedOrder}
            />
        </div>
    );
};

const KPICard = ({ label, value, icon, change }) => (
    <div className="pro-glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>{icon}</div>
        </div>
        <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{value}</span>
        <div style={{ fontSize: '0.9rem', color: 'var(--success)' }}>{change}</div>
    </div>
);

export default Summary;
