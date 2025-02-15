import express from 'express';
import { getBaseUrl, store } from '../config/config.js';

const router = express.Router();

// const { isAuthenticated } = require('../auth/authMiddleware');
// router.use(isAuthenticated);

// Get Overall Analytics API
router.get('/overall', (req, res) => {
    let totalUrls = 0;
    let totalClicks = 0;
    const overallUniqueUsers = new Set();
    const overallClicksByDate = {};
    const overallOsType = {};
    const overallDeviceType = {};

    for (const alias in store) {
        totalUrls++;
        const analytics = store[alias].analytics;
        totalClicks += analytics.totalClicks;
        analytics.uniqueUsers.forEach(ip => overallUniqueUsers.add(ip));

        for (const date in analytics.clicksByDate) {
            overallClicksByDate[date] = (overallClicksByDate[date] || 0) + analytics.clicksByDate[date].clickCount;
        }

        for (const os in analytics.osType) {
            if (!overallOsType[os]) {
                overallOsType[os] = { clicks: 0, uniqueUsers: new Set() };
            }
            overallOsType[os].clicks += analytics.osType[os].clicks;
            analytics.osType[os].uniqueUsers.forEach(ip => overallOsType[os].uniqueUsers.add(ip));
        }

        for (const device in analytics.deviceType) {
            if (!overallDeviceType[device]) {
                overallDeviceType[device] = { clicks: 0, uniqueUsers: new Set() };
            }
            overallDeviceType[device].clicks += analytics.deviceType[device].clicks;
            analytics.deviceType[device].uniqueUsers.forEach(ip => overallDeviceType[device].uniqueUsers.add(ip));
        }
    }

    const clicksByDate = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        clicksByDate.push({ date: dateStr, clickCount: overallClicksByDate[dateStr] || 0 });
    }

    const osType = Object.keys(overallOsType).map(osName => ({
        osName,
        uniqueClicks: overallOsType[osName].clicks,
        uniqueUsers: overallOsType[osName].uniqueUsers.size
    }));

    const deviceType = Object.keys(overallDeviceType).map(deviceName => ({
        deviceName,
        uniqueClicks: overallDeviceType[deviceName].clicks,
        uniqueUsers: overallDeviceType[deviceName].uniqueUsers.size
    }));

    res.json({
        totalUrls,
        totalClicks,
        uniqueUsers: overallUniqueUsers.size,
        clicksByDate,
        osType,
        deviceType
    });
});

// Get Topic-Based Analytics API
router.get('/topic/:topic', (req, res) => {
    const baseUrl = getBaseUrl(req);
    const topic = req.params.topic;
    let totalClicks = 0;
    const allUniqueUsers = new Set();
    const clicksByDateAgg = {};
    const urls = [];

    for (const alias in store) {
        const data = store[alias];
        if (data.topic === topic) {
            totalClicks += data.analytics.totalClicks;
            data.analytics.uniqueUsers.forEach(ip => allUniqueUsers.add(ip));
            for (const date in data.analytics.clicksByDate) {
                clicksByDateAgg[date] = (clicksByDateAgg[date] || 0) + data.analytics.clicksByDate[date].clickCount;
            }
            urls.push({
                shortUrl: `${baseUrl}/api/shorten/${alias}`,
                totalClicks: data.analytics.totalClicks,
                uniqueUsers: data.analytics.uniqueUsers.size
            });
        }
    }

    const clicksByDate = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        clicksByDate.push({ date: dateStr, clickCount: clicksByDateAgg[dateStr] || 0 });
    }

    res.json({
        totalClicks,
        uniqueUsers: allUniqueUsers.size,
        clicksByDate,
        urls
    });
});

// Get URL Analytics API (for specific alias)
router.get('/:alias', (req, res) => {
    const data = store[req.params.alias];
    if (!data) return res.status(404).json({ error: 'Not found' });

    const analytics = data.analytics;
    const totalClicks = analytics.totalClicks;
    const uniqueUsers = analytics.uniqueUsers.size;

    const clicksByDate = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const count = analytics.clicksByDate[dateStr] ? analytics.clicksByDate[dateStr].clickCount : 0;
        clicksByDate.push({ date: dateStr, clickCount: count });
    }

    const osType = Object.keys(analytics.osType).map(osName => ({
        osName,
        uniqueClicks: analytics.osType[osName].clicks,
        uniqueUsers: analytics.osType[osName].uniqueUsers.size
    }));

    const deviceType = Object.keys(analytics.deviceType).map(deviceName => ({
        deviceName,
        uniqueClicks: analytics.deviceType[deviceName].clicks,
        uniqueUsers: analytics.deviceType[deviceName].uniqueUsers.size
    }));

    res.json({ totalClicks, uniqueUsers, clicksByDate, osType, deviceType });
});

export default router;
