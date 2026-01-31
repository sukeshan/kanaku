import React, { useMemo } from 'react';
import { ArrowLeft, TrendingUp, ShoppingBag, IndianRupee, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Bar, Doughnut } from 'react-chartjs-2';

const DayDetail = ({ date, onBack }) => {
    const { orders } = useStore();

    const analytics = useMemo(() => {
        const dateStr = date.toISOString().split('T')[0];

        // Filter orders for this specific day
        const dayOrders = orders.filter(o => {
            const orderDate = new Date(o.timestamp).toISOString().split('T')[0];
            return orderDate === dateStr;
        });

        // Calculate metrics
        const totalRevenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
        const totalOrders = dayOrders.length;
        const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

        // Hourly distribution
        const hourlyData = Array(24).fill(0).map((_, hour) => ({
            hour,
            count: 0,
            revenue: 0
        }));

        dayOrders.forEach(o => {
            const hour = new Date(o.timestamp).getHours();
            hourlyData[hour].count++;
            hourlyData[hour].revenue += o.total;
        });

        const peakHour = hourlyData.reduce((max, curr) =>
            curr.count > max.count ? curr : max
            , { hour: 0, count: 0 });

        // Item breakdown
        const itemCounts = {};
        dayOrders.forEach(o => {
            const orderItems = Array.isArray(o.items) ? o.items : [];
            orderItems.forEach(i => {
                if (!itemCounts[i.name]) {
                    itemCounts[i.name] = { count: 0, revenue: 0 };
                }
                itemCounts[i.name].count += i.qty;
                itemCounts[i.name].revenue += i.price * i.qty;
            });
        });

        const topItem = Object.entries(itemCounts).reduce((max, [name, data]) =>
            data.count > (max.data?.count || 0) ? { name, data } : max
            , {});

        // Previous day comparison
        const prevDate = new Date(date);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateStr = prevDate.toISOString().split('T')[0];
        const prevDayOrders = orders.filter(o => {
            const orderDate = new Date(o.timestamp).toISOString().split('T')[0];
            return orderDate === prevDateStr;
        });
        const prevRevenue = prevDayOrders.reduce((sum, o) => sum + o.total, 0);
        const revenueChange = prevRevenue > 0
            ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100)
            : 0;

        return {
            dayOrders,
            totalRevenue,
            totalOrders,
            avgOrderValue,
            hourlyData,
            peakHour,
            itemCounts,
            topItem,
            revenueChange
        };
    }, [date, orders]);

    const hourlyChartData = {
        labels: analytics.hourlyData.map(h => `${h.hour}:00`),
        datasets: [
            {
                label: 'Orders',
                data: analytics.hourlyData.map(h => h.count),
                backgroundColor: 'rgba(108, 92, 231, 0.6)',
                borderRadius: 8,
                barThickness: 12
            }
        ]
    };

    const itemChartData = {
        labels: Object.keys(analytics.itemCounts),
        datasets: [
            {
                data: Object.values(analytics.itemCounts).map(i => i.count),
                backgroundColor: [
                    '#6c5ce7', '#00cec9', '#fdcb6e', '#ff7675', '#a29bfe', '#81ecec', '#fab1a0'
                ],
                borderWidth: 0,
                hoverOffset: 10
            }
        ]
    };

    const formatDate = (d) => {
        return d.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div>
            {/* Header with Back Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <ArrowLeft size={20} color="var(--text-primary)" />
                </button>
                <div>
                    <h1 className="title-xl" style={{ margin: 0 }}>{formatDate(date)}</h1>
                    {analytics.revenueChange !== 0 && (
                        <p style={{
                            color: analytics.revenueChange > 0 ? 'var(--success)' : 'var(--error)',
                            fontSize: '0.9rem',
                            margin: '4px 0 0 0'
                        }}>
                            {analytics.revenueChange > 0 ? '+' : ''}{analytics.revenueChange}% vs yesterday
                        </p>
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <KPICard
                    label="Total Revenue"
                    value={`₹${analytics.totalRevenue}`}
                    icon={<IndianRupee color="var(--success)" />}
                />
                <KPICard
                    label="Total Orders"
                    value={analytics.totalOrders}
                    icon={<ShoppingBag color="var(--primary)" />}
                />
                <KPICard
                    label="Avg Order Value"
                    value={`₹${analytics.avgOrderValue}`}
                    icon={<TrendingUp color="var(--warning)" />}
                />
                <KPICard
                    label="Peak Hour"
                    value={analytics.peakHour.count > 0 ? `${analytics.peakHour.hour}:00` : 'N/A'}
                    icon={<Clock color="var(--info)" />}
                />
            </div>

            {analytics.totalOrders > 0 ? (
                <>
                    {/* Charts Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                        {/* Hourly Distribution */}
                        <div className="pro-glass" style={{ padding: '24px' }}>
                            <h3 className="title-lg" style={{ marginTop: 0, marginBottom: '20px' }}>Hourly Distribution</h3>
                            <div style={{ height: '250px' }}>
                                <Bar
                                    data={hourlyChartData}
                                    options={{
                                        responsive: true,
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: { color: '#a0a0b0', stepSize: 1 },
                                                grid: { color: 'rgba(255, 255, 255, 0.05)' }
                                            },
                                            x: {
                                                ticks: {
                                                    color: '#a0a0b0',
                                                    maxRotation: 45,
                                                    minRotation: 45
                                                },
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

                        {/* Item Breakdown */}
                        <div className="pro-glass" style={{ padding: '24px' }}>
                            <h3 className="title-lg" style={{ marginTop: 0, marginBottom: '20px' }}>Item Breakdown</h3>
                            <div style={{ height: '250px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Doughnut
                                    data={itemChartData}
                                    options={{
                                        cutout: '65%',
                                        plugins: {
                                            legend: {
                                                position: 'bottom',
                                                labels: {
                                                    color: '#a0a0b0',
                                                    usePointStyle: true,
                                                    padding: 12,
                                                    font: { size: 11 }
                                                }
                                            }
                                        },
                                        maintainAspectRatio: false
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Top Selling Item */}
                    {analytics.topItem.name && (
                        <div className="pro-glass" style={{ padding: '24px', marginBottom: '24px' }}>
                            <h3 className="title-lg" style={{ marginTop: 0, marginBottom: '12px' }}>🏆 Top Selling Item</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{analytics.topItem.name}</span>
                                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                                        {analytics.topItem.data.count} units sold
                                    </p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
                                        ₹{analytics.topItem.data.revenue}
                                    </span>
                                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                        Revenue from this item
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Timeline */}
                    <div className="pro-glass" style={{ padding: '24px' }}>
                        <h3 className="title-lg" style={{ marginTop: 0, marginBottom: '20px' }}>Order Timeline</h3>
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {analytics.dayOrders.map((order) => (
                                <div
                                    key={order.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '16px',
                                        marginBottom: '8px',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '12px',
                                        borderLeft: '4px solid var(--primary)'
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                            {new Date(order.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            {(Array.isArray(order.items) ? order.items : []).map(i => `${i.name} (${i.qty})`).join(', ')}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                                            by {order.user.name} {order.device && `• ${order.device}`}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>
                                            ₹{order.total}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {Array.isArray(order.items) ? order.items.length : 0} items
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="pro-glass" style={{
                    padding: '80px',
                    textAlign: 'center',
                    border: '2px dashed rgba(255, 255, 255, 0.1)'
                }}>
                    <h3 style={{ opacity: 0.5, fontSize: '1.5rem' }}>No orders on this day</h3>
                    <p style={{ opacity: 0.3 }}>Check other dates to see analytics</p>
                </div>
            )}
        </div>
    );
};

const KPICard = ({ label, value, icon }) => (
    <div className="pro-glass" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
            <span style={{
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}>
                {label}
            </span>
            <div style={{ padding: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>
                {icon}
            </div>
        </div>
        <span style={{ fontSize: '1.8rem', fontWeight: 800 }}>{value}</span>
    </div>
);

export default DayDetail;
