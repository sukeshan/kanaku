import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { TrendingUp, ShoppingBag, IndianRupee, Package, Calendar, BarChart3, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import AnalyticsCalendar from './AnalyticsCalendar';
import WeeklyAnalytics from './WeeklyAnalytics';
import MonthlyAnalytics from './MonthlyAnalytics';
import { calculateRevenue, generateInsights, rankItemsBySales } from '../utils/analyticsUtils';

const AnalyticsHub = () => {
    const { orders, items } = useStore();
    const [activeView, setActiveView] = useState('daily');

    // Calculate overview metrics
    const overviewMetrics = useMemo(() => {
        const totalRevenue = calculateRevenue(orders);
        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Total items sold
        let totalItemsSold = 0;
        orders.forEach(order => {
            const orderItems = Array.isArray(order.items) ? order.items : [];
            orderItems.forEach(item => {
                totalItemsSold += item.qty;
            });
        });

        // Growth calculation (last 7 days vs previous 7 days)
        // eslint-disable-next-line react-hooks/purity
        const now = Date.now();
        const last7Days = orders.filter(o => {
            const daysDiff = (now - new Date(o.timestamp)) / (1000 * 60 * 60 * 24);
            return daysDiff <= 7;
        });
        const prev7Days = orders.filter(o => {
            const daysDiff = (now - new Date(o.timestamp)) / (1000 * 60 * 60 * 24);
            return daysDiff > 7 && daysDiff <= 14;
        });

        const lastWeekRevenue = calculateRevenue(last7Days);
        const prevWeekRevenue = calculateRevenue(prev7Days);
        const growth = prevWeekRevenue > 0
            ? ((lastWeekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100
            : 0;

        // Get insights
        const insights = generateInsights(orders, items);

        // Top item
        const topItems = rankItemsBySales(orders);
        const topItem = topItems.length > 0 ? topItems[0] : null;

        return {
            totalRevenue,
            totalOrders,
            avgOrderValue,
            totalItemsSold,
            growth,
            insights,
            topItem
        };
    }, [orders, items]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '40px', minHeight: 0 }}>
                {/* Header */}
                <h1 className="title-xl" style={{ marginBottom: '24px' }}>Analytics Dashboard</h1>

                {/* Overview KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    <KPICard
                        label="Total Revenue"
                        value={`₹${overviewMetrics.totalRevenue.toLocaleString()}`}
                        icon={<IndianRupee size={20} color="var(--success)" />}
                        subtitle="All Time"
                    />
                    <KPICard
                        label="Total Orders"
                        value={overviewMetrics.totalOrders}
                        icon={<ShoppingBag size={20} color="var(--primary)" />}
                        subtitle="All Time"
                    />
                    <KPICard
                        label="Avg Order Value"
                        value={`₹${Math.round(overviewMetrics.avgOrderValue)}`}
                        icon={<TrendingUp size={20} color="var(--warning)" />}
                        subtitle="Average"
                    />
                    <KPICard
                        label="Weekly Growth"
                        value={`${overviewMetrics.growth > 0 ? '+' : ''}${overviewMetrics.growth.toFixed(1)}%`}
                        icon={overviewMetrics.growth >= 0
                            ? <TrendingUp size={20} color="var(--success)" />
                            : <TrendingDown size={20} color="var(--error)" />
                        }
                        subtitle="vs Last Week"
                        highlight={Math.abs(overviewMetrics.growth) > 10}
                    />
                </div>

                {/* Insights Banner */}
                {overviewMetrics.insights.length > 0 && (
                    <div className="pro-glass" style={{ padding: '20px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <BarChart3 size={20} color="var(--primary)" />
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Key Insights</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {overviewMetrics.insights.slice(0, 3).map((insight, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '12px',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '12px',
                                        borderLeft: `3px solid ${insight.type === 'success' ? 'var(--success)' :
                                            insight.type === 'warning' ? 'var(--warning)' :
                                                'var(--primary)'
                                            }`
                                    }}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>
                                        {insight.type === 'success' ? '✅' : insight.type === 'warning' ? '⚠️' : 'ℹ️'}
                                    </span>
                                    <span>{insight.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* View Tabs */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', gap: '8px', padding: '8px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '16px', width: 'fit-content' }}>
                        <ViewTab
                            active={activeView === 'daily'}
                            onClick={() => setActiveView('daily')}
                            icon={<Calendar size={18} />}
                            label="Daily"
                        />
                        <ViewTab
                            active={activeView === 'weekly'}
                            onClick={() => setActiveView('weekly')}
                            icon={<BarChart3 size={18} />}
                            label="Weekly"
                        />
                        <ViewTab
                            active={activeView === 'monthly'}
                            onClick={() => setActiveView('monthly')}
                            icon={<Package size={18} />}
                            label="Monthly"
                        />
                    </div>
                </div>

                {/* View Content */}
                <div style={{ paddingBottom: '40px' }}>
                    {activeView === 'daily' && <AnalyticsCalendar />}
                    {activeView === 'weekly' && <WeeklyAnalytics />}
                    {activeView === 'monthly' && <MonthlyAnalytics />}
                </div>
            </div>
        </div>
    );
};

const KPICard = ({ label, value, icon, subtitle, highlight }) => (
    <motion.div
        whileHover={{ y: -4 }}
        className="pro-glass"
        style={{
            padding: '20px',
            border: highlight ? '1px solid var(--primary)' : undefined
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
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
        <div style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '4px' }}>
            {value}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
            {subtitle}
        </div>
    </motion.div>
);

const ViewTab = ({ active, onClick, icon, label }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        style={{
            background: active ? 'var(--primary)' : 'transparent',
            color: active ? 'var(--on-primary)' : 'var(--text-secondary)',
            border: 'none',
            borderRadius: '12px',
            padding: '12px 24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'all 0.2s'
        }}
    >
        {icon}
        {label}
    </motion.button>
);

export default AnalyticsHub;
