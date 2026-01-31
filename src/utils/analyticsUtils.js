// Analytics utility functions for data processing and calculations

// Group orders by day
export const groupOrdersByDay = (orders) => {
    const grouped = {};
    orders.forEach(order => {
        const date = new Date(order.timestamp).toISOString().split('T')[0];
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(order);
    });
    return grouped;
};

// Group orders by week
export const groupOrdersByWeek = (orders) => {
    const grouped = {};
    orders.forEach(order => {
        const date = new Date(order.timestamp);
        const week = getWeekIdentifier(date);
        if (!grouped[week]) {
            grouped[week] = [];
        }
        grouped[week].push(order);
    });
    return grouped;
};

// Group orders by month
export const groupOrdersByMonth = (orders) => {
    const grouped = {};
    orders.forEach(order => {
        const date = new Date(order.timestamp);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!grouped[month]) {
            grouped[month] = [];
        }
        grouped[month].push(order);
    });
    return grouped;
};

// Get week identifier (year-week)
export const getWeekIdentifier = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

// Get week date range
export const getWeekRange = (weekIdentifier) => {
    const [year, week] = weekIdentifier.split('-W').map(Number);
    const jan4 = new Date(year, 0, 4);
    const monday = new Date(jan4);
    monday.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1 + (week - 1) * 7);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: monday, end: sunday };
};

// Calculate revenue for orders
export const calculateRevenue = (orders) => {
    return orders.reduce((sum, order) => sum + order.total, 0);
};

// Calculate growth rate
export const calculateGrowthRate = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

// Calculate moving average
export const calculateMovingAverage = (data, period = 7) => {
    const result = [];
    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - period + 1);
        const subset = data.slice(start, i + 1);
        const avg = subset.reduce((sum, val) => sum + val, 0) / subset.length;
        result.push(avg);
    }
    return result;
};

// Find peak periods
export const findPeakPeriods = (data) => {
    if (data.length === 0) return [];
    const sorted = [...data].sort((a, b) => b.value - a.value);
    return sorted.slice(0, 5);
};

// Compare two periods
export const comparePeriods = (periodA, periodB) => {
    const revenueA = calculateRevenue(periodA);
    const revenueB = calculateRevenue(periodB);
    const ordersA = periodA.length;
    const ordersB = periodB.length;

    return {
        revenueChange: calculateGrowthRate(revenueA, revenueB),
        ordersChange: calculateGrowthRate(ordersA, ordersB),
        avgOrderValueChange: calculateGrowthRate(
            ordersA > 0 ? revenueA / ordersA : 0,
            ordersB > 0 ? revenueB / ordersB : 0
        )
    };
};

// Rank items by sales quantity
export const rankItemsBySales = (orders) => {
    const itemCounts = {};
    orders.forEach(order => {
        const orderItems = Array.isArray(order.items) ? order.items : [];
        orderItems.forEach(item => {
            if (!itemCounts[item.name]) {
                itemCounts[item.name] = { name: item.name, quantity: 0, revenue: 0 };
            }
            itemCounts[item.name].quantity += item.qty;
            itemCounts[item.name].revenue += item.price * item.qty;
        });
    });

    return Object.values(itemCounts).sort((a, b) => b.quantity - a.quantity);
};

// Rank items by revenue
export const rankItemsByRevenue = (orders) => {
    const itemCounts = {};
    orders.forEach(order => {
        const orderItems = Array.isArray(order.items) ? order.items : [];
        orderItems.forEach(item => {
            if (!itemCounts[item.name]) {
                itemCounts[item.name] = { name: item.name, quantity: 0, revenue: 0 };
            }
            itemCounts[item.name].quantity += item.qty;
            itemCounts[item.name].revenue += item.price * item.qty;
        });
    });

    return Object.values(itemCounts).sort((a, b) => b.revenue - a.revenue);
};

// Find rising stars (items with increasing sales)
export const findRisingStars = (orders, weeks = 4) => {
    const now = new Date();
    const recentCutoff = new Date(now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);
    const olderCutoff = new Date(recentCutoff.getTime() - weeks * 7 * 24 * 60 * 60 * 1000);

    const recentOrders = orders.filter(o => new Date(o.timestamp) >= recentCutoff);
    const olderOrders = orders.filter(o => {
        const d = new Date(o.timestamp);
        return d >= olderCutoff && d < recentCutoff;
    });

    const recentSales = rankItemsBySales(recentOrders);
    const olderSales = rankItemsBySales(olderOrders);

    const comparison = recentSales.map(recent => {
        const older = olderSales.find(o => o.name === recent.name);
        const oldQty = older ? older.quantity : 0;
        const growth = calculateGrowthRate(recent.quantity, oldQty);
        return { ...recent, growth };
    });

    return comparison.filter(item => item.growth > 20).sort((a, b) => b.growth - a.growth);
};

// Calculate sales velocity (items per day)
export const calculateSalesVelocity = (itemName, orders, days = 7) => {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentOrders = orders.filter(o => new Date(o.timestamp) >= cutoff);

    let totalQty = 0;
    recentOrders.forEach(order => {
        const orderItems = Array.isArray(order.items) ? order.items : [];
        orderItems.forEach(item => {
            if (item.name === itemName) {
                totalQty += item.qty;
            }
        });
    });

    return totalQty / days;
};

// Simple forecasting - predict next period based on moving average
export const predictNextPeriod = (historicalData, periods = 4) => {
    if (historicalData.length < periods) return null;

    const recent = historicalData.slice(-periods);
    const average = recent.reduce((sum, val) => sum + val, 0) / recent.length;

    // Calculate trend
    let trend = 0;
    for (let i = 1; i < recent.length; i++) {
        trend += recent[i] - recent[i - 1];
    }
    trend /= (recent.length - 1);

    return Math.max(0, Math.round(average + trend));
};

// Get insights based on data
export const generateInsights = (orders, items) => {
    const insights = [];

    if (orders.length === 0) {
        insights.push({ type: 'info', message: 'No orders yet. Start tracking sales to see insights!' });
        return insights;
    }

    // Revenue trend
    const last7Days = orders.filter(o => {
        const daysDiff = (Date.now() - new Date(o.timestamp)) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
    });
    const prev7Days = orders.filter(o => {
        const daysDiff = (Date.now() - new Date(o.timestamp)) / (1000 * 60 * 60 * 24);
        return daysDiff > 7 && daysDiff <= 14;
    });

    if (last7Days.length > 0 && prev7Days.length > 0) {
        const change = calculateGrowthRate(calculateRevenue(last7Days), calculateRevenue(prev7Days));
        if (Math.abs(change) > 5) {
            insights.push({
                type: change > 0 ? 'success' : 'warning',
                message: `Revenue is ${change > 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)}% this week`
            });
        }
    }

    // Best seller
    const topItems = rankItemsBySales(orders);
    if (topItems.length > 0) {
        insights.push({
            type: 'info',
            message: `${topItems[0].name} is your #1 seller with ${topItems[0].quantity} units sold`
        });
    }

    // Low stock warning
    const lowStockItems = items.filter(i => i.stock < 10 && i.stock > 0);
    if (lowStockItems.length > 0) {
        insights.push({
            type: 'warning',
            message: `${lowStockItems.length} item(s) running low on stock`
        });
    }

    // Rising stars
    const rising = findRisingStars(orders);
    if (rising.length > 0) {
        insights.push({
            type: 'success',
            message: `${rising[0].name} sales up ${rising[0].growth.toFixed(0)}% - trending!`
        });
    }

    return insights;
};

// Get peak hour from orders
export const getPeakHour = (orders) => {
    const hourCounts = Array(24).fill(0);
    orders.forEach(order => {
        const hour = new Date(order.timestamp).getHours();
        hourCounts[hour]++;
    });

    const maxCount = Math.max(...hourCounts);
    const peakHour = hourCounts.indexOf(maxCount);
    return { hour: peakHour, count: maxCount };
};
