import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, TrendingUp, ShoppingBag, IndianRupee, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    groupOrdersByMonth,
    calculateRevenue,
    comparePeriods,
    rankItemsByRevenue,
    calculateGrowthRate
} from '../utils/analyticsUtils';

const MonthlyAnalytics = () => {
    const { orders } = useStore();
    const [selectedMonth, setSelectedMonth] = useState(null);

    // Group orders by month and create month cards
    const months = useMemo(() => {
        const grouped = groupOrdersByMonth(orders);
        const monthList = Object.keys(grouped).sort().reverse().slice(0, 12); // Last 12 months

        return monthList.map((monthId, idx, arr) => {
            const monthOrders = grouped[monthId];
            const revenue = calculateRevenue(monthOrders);
            const [year, month] = monthId.split('-');
            const date = new Date(year, parseInt(month) - 1, 1);

            // Calculate growth vs previous month
            const prevMonthId = arr[idx + 1];
            const prevRevenue = prevMonthId ? calculateRevenue(grouped[prevMonthId]) : 0;
            const growth = calculateGrowthRate(revenue, prevRevenue);

            return {
                id: monthId,
                date,
                orders: monthOrders,
                revenue,
                orderCount: monthOrders.length,
                growth
            };
        });
    }, [orders]);

    if (selectedMonth) {
        return <MonthDetail month={selectedMonth} months={months} onBack={() => setSelectedMonth(null)} />;
    }

    return (
        <div>
            <h2 className="title-lg" style={{ marginBottom: '24px' }}>Monthly Overview</h2>

            {months.length === 0 ? (
                <div className="pro-glass" style={{ padding: '80px', textAlign: 'center', border: '2px dashed rgba(255, 255, 255, 0.1)' }}>
                    <Calendar size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ opacity: 0.5, fontSize: '1.5rem' }}>No data yet</h3>
                    <p style={{ opacity: 0.3 }}>Start taking orders to see monthly analytics</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {months.map(month => (
                        <motion.div
                            key={month.id}
                            whileHover={{ scale: 1.02, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedMonth(month)}
                            className="pro-glass"
                            style={{
                                padding: '24px',
                                cursor: 'pointer',
                                background: `linear-gradient(135deg, rgba(188, 194, 255, ${Math.min(month.revenue / 10000, 0.2)}) 0%, rgba(255, 255, 255, 0.03) 100%)`
                            }}
                        >
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                                {month.date.toLocaleDateString('en-US', { year: 'numeric' })}
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px' }}>
                                {month.date.toLocaleDateString('en-US', { month: 'long' })}
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                                    ₹{month.revenue.toLocaleString()}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {month.orderCount} orders
                                </div>
                            </div>

                            {Math.abs(month.growth) > 0 && (
                                <div style={{
                                    display: 'inline-flex',
                                    padding: '4px 8px',
                                    borderRadius: '8px',
                                    background: month.growth > 0 ? 'rgba(179, 242, 195, 0.1)' : 'rgba(255, 180, 171, 0.1)',
                                    color: month.growth > 0 ? 'var(--success)' : 'var(--error)',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}>
                                    {month.growth > 0 ? '↗' : '↘'} {Math.abs(month.growth).toFixed(0)}% MoM
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

const MonthDetail = ({ month, months, onBack }) => {
    const analytics = useMemo(() => {
        // Group by day
        const dayGroups = {};
        month.orders.forEach(order => {
            const day = new Date(order.timestamp).getDate();
            if (!dayGroups[day]) dayGroups[day] = [];
            dayGroups[day].push(order);
        });

        const dailyRevenue = Object.keys(dayGroups).map(day => ({
            day: parseInt(day),
            revenue: calculateRevenue(dayGroups[day])
        })).sort((a, b) => a.day - b.day);

        // Group by week
        const weekGroups = {};
        month.orders.forEach(order => {
            const date = new Date(order.timestamp);
            const weekOfMonth = Math.ceil(date.getDate() / 7);
            if (!weekGroups[weekOfMonth]) weekGroups[weekOfMonth] = [];
            weekGroups[weekOfMonth].push(order);
        });

        const weeklyData = Object.keys(weekGroups).map(week => ({
            week: `Week ${week}`,
            revenue: calculateRevenue(weekGroups[week]),
            orders: weekGroups[week].length
        }));

        // Previous month comparison
        const monthIndex = months.findIndex(m => m.id === month.id);
        const previousMonth = months[monthIndex + 1];
        const comparison = previousMonth ? comparePeriods(month.orders, previousMonth.orders) : null;

        // Top items
        const topItems = rankItemsByRevenue(month.orders).slice(0, 5);

        // Best day
        const bestDay = dailyRevenue.reduce((max, curr) => curr.revenue > max.revenue ? curr : max, dailyRevenue[0] || { day: 1, revenue: 0 });

        return { dailyRevenue, weeklyData, comparison, topItems, bestDay };
    }, [month, months]);

    const revenueChartData = {
        labels: analytics.dailyRevenue.map(d => d.day),
        datasets: [{
            label: 'Daily Revenue',
            data: analytics.dailyRevenue.map(d => d.revenue),
            borderColor: 'rgba(188, 194, 255, 1)',
            backgroundColor: 'rgba(188, 194, 255, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 6
        }]
    };

    const itemChartData = {
        labels: analytics.topItems.map(i => i.name),
        datasets: [{
            data: analytics.topItems.map(i => i.revenue),
            backgroundColor: ['#6c5ce7', '#00cec9', '#fdcb6e', '#ff7675', '#a29bfe'],
            borderWidth: 0
        }]
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button onClick={onBack} style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '12px', padding: '12px', cursor: 'pointer', display: 'flex' }}>
                    <ArrowLeft size={20} color="var(--text-primary)" />
                </button>
                <div>
                    <h1 className="title-xl" style={{ margin: 0 }}>
                        {month.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h1>
                    {analytics.comparison && (
                        <p style={{ margin: '4px 0 0 0', color: analytics.comparison.revenueChange > 0 ? 'var(--success)' : 'var(--error)', fontSize: '0.9rem' }}>
                            {analytics.comparison.revenueChange > 0 ? '+' : ''}{analytics.comparison.revenueChange.toFixed(1)}% vs previous month
                        </p>
                    )}
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <KPICard label="Total Revenue" value={`₹${month.revenue.toLocaleString()}`} icon={<IndianRupee color="var(--success)" />} />
                <KPICard label="Total Orders" value={month.orderCount} icon={<ShoppingBag color="var(--primary)" />} />
                <KPICard label="Avg Order Value" value={`₹${Math.round(month.revenue / month.orderCount)}`} icon={<TrendingUp color="var(--warning)" />} />
                <KPICard label="Best Day" value={analytics.bestDay.day ? `${month.date.toLocaleDateString('en-US', { month: 'short' })} ${analytics.bestDay.day}` : 'N/A'} icon={<Calendar color="var(--info)" />} subtitle={`₹${analytics.bestDay.revenue}`} />
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                {/* Revenue Trend */}
                <div className="pro-glass" style={{ padding: '24px' }}>
                    <h3 className="title-lg" style={{ marginTop: 0, marginBottom: '20px' }}>Daily Revenue Trend</h3>
                    <div style={{ height: '250px' }}>
                        <Line data={revenueChartData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { color: '#a0a0b0' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }, x: { ticks: { color: '#a0a0b0' }, grid: { display: false } } }, plugins: { legend: { display: false } } }} />
                    </div>
                </div>

                {/* Top Items Pie */}
                <div className="pro-glass" style={{ padding: '24px' }}>
                    <h3 className="title-lg" style={{ marginTop: 0, marginBottom: '20px' }}>Revenue by Item</h3>
                    <div style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Doughnut data={itemChartData} options={{ cutout: '60%', plugins: { legend: { position: 'bottom', labels: { color: '#a0a0b0', usePointStyle: true, padding: 8, font: { size: 10 } } } }, maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            {/* Weekly Breakdown */}
            <div className="pro-glass" style={{ padding: '24px' }}>
                <h3 className="title-lg" style={{ marginTop: 0, marginBottom: '20px' }}>Weekly Breakdown</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {analytics.weeklyData.map((week, idx) => (
                        <div key={idx} style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{week.week}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '4px' }}>₹{week.revenue.toLocaleString()}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{week.orders} orders</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ label, value, icon, subtitle }) => (
    <div className="pro-glass" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>{label}</span>
            {icon}
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>{value}</div>
        {subtitle && <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{subtitle}</div>}
    </div>
);

export default MonthlyAnalytics;
