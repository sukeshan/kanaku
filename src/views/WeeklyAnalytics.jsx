import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, TrendingUp, ShoppingBag, IndianRupee, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import {
    groupOrdersByWeek,
    getWeekRange,
    calculateRevenue,
    comparePeriods,
    rankItemsByRevenue,
    getPeakHour
} from '../utils/analyticsUtils';

const WeeklyAnalytics = () => {
    const { orders } = useStore();
    const [selectedWeek, setSelectedWeek] = useState(null);

    // Group orders by week and create week cards
    const weeks = useMemo(() => {
        const grouped = groupOrdersByWeek(orders);
        const weekList = Object.keys(grouped).sort().reverse().slice(0, 8); // Last 8 weeks

        return weekList.map(weekId => {
            const weekOrders = grouped[weekId];
            const revenue = calculateRevenue(weekOrders);
            const { start, end } = getWeekRange(weekId);

            return {
                id: weekId,
                start,
                end,
                orders: weekOrders,
                revenue,
                orderCount: weekOrders.length
            };
        });
    }, [orders]);

    if (selectedWeek) {
        return <WeekDetail week={selectedWeek} weeks={weeks} onBack={() => setSelectedWeek(null)} />;
    }

    return (
        <div>
            <h2 className="title-lg" style={{ marginBottom: '24px' }}>Weekly Overview</h2>

            {weeks.length === 0 ? (
                <div className="pro-glass" style={{ padding: '80px', textAlign: 'center', border: '2px dashed rgba(255, 255, 255, 0.1)' }}>
                    <Calendar size={48} color="var(--text-tertiary)" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ opacity: 0.5, fontSize: '1.5rem' }}>No data yet</h3>
                    <p style={{ opacity: 0.3 }}>Start taking orders to see weekly analytics</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {weeks.map((week, idx) => {
                        const prevWeek = weeks[idx + 1];
                        const growth = prevWeek ? ((week.revenue - prevWeek.revenue) / prevWeek.revenue) * 100 : 0;

                        return (
                            <motion.div
                                key={week.id}
                                whileHover={{ scale: 1.02, y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedWeek(week)}
                                className="pro-glass"
                                style={{
                                    padding: '24px',
                                    cursor: 'pointer',
                                    background: `linear-gradient(135deg, rgba(188, 194, 255, ${Math.min(week.revenue / 5000, 0.15)}) 0%, rgba(255, 255, 255, 0.03) 100%)`
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                            {week.id}
                                        </div>
                                        <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
                                            {week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {week.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>
                                    {prevWeek && Math.abs(growth) > 0 && (
                                        <div style={{
                                            padding: '4px 8px',
                                            borderRadius: '8px',
                                            background: growth > 0 ? 'rgba(179, 242, 195, 0.1)' : 'rgba(255, 180, 171, 0.1)',
                                            color: growth > 0 ? 'var(--success)' : 'var(--error)',
                                            fontSize: '0.85rem',
                                            fontWeight: 600
                                        }}>
                                            {growth > 0 ? '+' : ''}{growth.toFixed(0)}%
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                                        ₹{week.revenue.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        {week.orderCount} orders
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                                    Click to view details →
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const WeekDetail = ({ week, weeks, onBack }) => {
    const analytics = useMemo(() => {

        // Group orders by day of week
        const dayGroups = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
        week.orders.forEach(order => {
            const day = new Date(order.timestamp).getDay();
            dayGroups[day].push(order);
        });

        const dailyData = Object.keys(dayGroups).map(day => ({
            day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day],
            revenue: calculateRevenue(dayGroups[day]),
            orders: dayGroups[day].length
        }));

        // Previous week comparison
        const weekIndex = weeks.findIndex(w => w.id === week.id);
        const previousWeek = weeks[weekIndex + 1];
        const comparison = previousWeek ? comparePeriods(week.orders, previousWeek.orders) : null;

        // Top items
        const topItems = rankItemsByRevenue(week.orders).slice(0, 5);

        // Peak hour
        const peakHour = getPeakHour(week.orders);

        // Peak day
        const peakDay = dailyData.reduce((max, curr) => curr.revenue > max.revenue ? curr : max, dailyData[0]);

        return { dailyData, comparison, topItems, peakHour, peakDay };
    }, [week, weeks]);

    const chartData = {
        labels: analytics.dailyData.map(d => d.day),
        datasets: [{
            label: 'Revenue',
            data: analytics.dailyData.map(d => d.revenue),
            backgroundColor: 'rgba(188, 194, 255, 0.6)',
            borderRadius: 8,
            barThickness: 40
        }]
    };

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px',
                        cursor: 'pointer',
                        display: 'flex'
                    }}
                >
                    <ArrowLeft size={20} color="var(--text-primary)" />
                </button>
                <div>
                    <h1 className="title-xl" style={{ margin: 0 }}>
                        Week {week.id.split('-W')[1]}
                    </h1>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                        {week.start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {week.end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    {analytics.comparison && (
                        <p style={{
                            margin: '4px 0 0 0',
                            color: analytics.comparison.revenueChange > 0 ? 'var(--success)' : 'var(--error)',
                            fontSize: '0.9rem'
                        }}>
                            {analytics.comparison.revenueChange > 0 ? '+' : ''}{analytics.comparison.revenueChange.toFixed(1)}% vs previous week
                        </p>
                    )}
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <KPICard label="Total Revenue" value={`₹${week.revenue.toLocaleString()}`} icon={<IndianRupee color="var(--success)" />} />
                <KPICard label="Total Orders" value={week.orderCount} icon={<ShoppingBag color="var(--primary)" />} />
                <KPICard label="Avg Order Value" value={`₹${Math.round(week.revenue / week.orderCount)}`} icon={<TrendingUp color="var(--warning)" />} />
                <KPICard label="Peak Day" value={analytics.peakDay.day} icon={<Calendar color="var(--info)" />} subtitle={`₹${analytics.peakDay.revenue}`} />
            </div>

            {/* Daily Breakdown Chart */}
            <div className="pro-glass" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 className="title-lg" style={{ marginTop: 0, marginBottom: '20px' }}>Daily Breakdown</h3>
                <div style={{ height: '300px' }}>
                    <Bar
                        data={chartData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: { color: '#a0a0b0' },
                                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                                },
                                x: {
                                    ticks: { color: '#a0a0b0' },
                                    grid: { display: false }
                                }
                            },
                            plugins: {
                                legend: { display: false }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Top Items */}
            <div className="pro-glass" style={{ padding: '24px' }}>
                <h3 className="title-lg" style={{ marginTop: 0, marginBottom: '20px' }}>Top 5 Items This Week</h3>
                {analytics.topItems.map((item, idx) => (
                    <div
                        key={idx}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            marginBottom: '8px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '12px',
                            borderLeft: `4px solid ${['#6c5ce7', '#00cec9', '#fdcb6e', '#ff7675', '#a29bfe'][idx]}`
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.9rem'
                            }}>
                                #{idx + 1}
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, marginBottom: '2px' }}>{item.name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {item.quantity} units sold
                                </div>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>
                                ₹{item.revenue}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const KPICard = ({ label, value, icon, subtitle }) => (
    <div className="pro-glass" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>
                {label}
            </span>
            {icon}
        </div>
        <div style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>{value}</div>
        {subtitle && <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{subtitle}</div>}
    </div>
);

export default WeeklyAnalytics;
