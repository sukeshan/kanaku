import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import DayDetail from './DayDetail';

const AnalyticsCalendar = () => {
    const { orders } = useStore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const { year, month, monthName } = useMemo(() => ({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth(),
        monthName: currentDate.toLocaleString('default', { month: 'long' })
    }), [currentDate]);

    const daysInMonth = useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startPadding = firstDay.getDay();
        const days = [];

        // Previous month padding
        for (let i = 0; i < startPadding; i++) {
            days.push({ date: null, isCurrentMonth: false });
        }

        // Current month days
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];

            // Calculate metrics for this day
            const dayOrders = orders.filter(o => {
                const orderDate = new Date(o.timestamp).toISOString().split('T')[0];
                return orderDate === dateStr;
            });

            const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
            const orderCount = dayOrders.length;

            days.push({
                date,
                day,
                isCurrentMonth: true,
                isToday: dateStr === new Date().toISOString().split('T')[0],
                revenue,
                orderCount
            });
        }

        return days;
    }, [year, month, orders]);

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleDayClick = (dayData) => {
        if (dayData.isCurrentMonth && dayData.date) {
            setSelectedDate(dayData.date);
        }
    };

    const getRevenueColor = (revenue) => {
        if (revenue === 0) return 'rgba(255, 255, 255, 0.03)';
        if (revenue < 100) return 'rgba(108, 92, 231, 0.2)';
        if (revenue < 500) return 'rgba(108, 92, 231, 0.4)';
        if (revenue < 1000) return 'rgba(108, 92, 231, 0.6)';
        return 'rgba(108, 92, 231, 0.8)';
    };

    if (selectedDate) {
        return <DayDetail date={selectedDate} onBack={() => setSelectedDate(null)} />;
    }

    return (
        <div>
            <h1 className="title-xl" style={{ marginBottom: '32px' }}>Daily Analytics</h1>

            {/* Calendar Header */}
            <div className="pro-glass" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        onClick={goToPreviousMonth}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                    >
                        <ChevronLeft size={20} color="var(--text-primary)" />
                    </button>

                    <h2 className="title-lg" style={{ margin: 0 }}>
                        {monthName} {year}
                    </h2>

                    <button
                        onClick={goToNextMonth}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                    >
                        <ChevronRight size={20} color="var(--text-primary)" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="pro-glass" style={{ padding: '24px' }}>
                {/* Day Headers */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '8px',
                    marginBottom: '16px'
                }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div
                            key={day}
                            style={{
                                textAlign: 'center',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: 'var(--text-secondary)',
                                padding: '8px'
                            }}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '8px'
                }}>
                    {daysInMonth.map((dayData, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleDayClick(dayData)}
                            style={{
                                aspectRatio: '1',
                                background: dayData.isCurrentMonth ? getRevenueColor(dayData.revenue) : 'transparent',
                                border: dayData.isToday ? '2px solid var(--primary)' : '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '16px',
                                padding: '12px',
                                cursor: dayData.isCurrentMonth ? 'pointer' : 'default',
                                opacity: dayData.isCurrentMonth ? 1 : 0.3,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                if (dayData.isCurrentMonth) {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(108, 92, 231, 0.3)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (dayData.isCurrentMonth) {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }
                            }}
                        >
                            {dayData.date && (
                                <>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                                        {dayData.day}
                                    </div>
                                    {dayData.orderCount > 0 && (
                                        <div style={{ fontSize: '0.75rem', textAlign: 'center' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                                ₹{dayData.revenue}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                {dayData.orderCount} orders
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AnalyticsCalendar;
