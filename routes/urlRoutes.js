import express from "express";
import { store, getBaseUrl } from "../config/config.js";

const router = express.Router();

// const { isAuthenticated } = require("../auth/authMiddleware");
// router.use(isAuthenticated);

// Create Short URL API
router.post("/shorten", async (req, res, next) => {
  try {
    const baseUrl = getBaseUrl(req);
    const { longUrl, customAlias, topic } = req.body;
    if (!longUrl) return res.status(400).json({ error: "longUrl required" });
    const alias = customAlias || nanoid(6);
    if (store[alias]) return res.status(409).json({ error: "Alias exists" });
    const createdAt = new Date();
    store[alias] = {
      longUrl,
      createdAt,
      topic,
      analytics: {
        totalClicks: 0,
        uniqueUsers: new Set(),
        clicksByDate: {},
        osType: {},
        deviceType: {},
      },
    };
    res.json({ shortUrl: `${baseUrl}/api/shorten/${alias}`, createdAt });
  } catch (error) {
    next(error);
  }
});

// Redirect Short URL API (updates analytics)
router.get("/shorten/:alias", (req, res) => {
  const data = store[req.params.alias];
  if (!data) return res.status(404).json({ error: "Not found" });

  const analytics = data.analytics;
  const ip = req.ip;
  analytics.totalClicks++;
  analytics.uniqueUsers.add(ip);

  const date = new Date().toISOString().slice(0, 10);
  if (!analytics.clicksByDate[date]) {
    analytics.clicksByDate[date] = { clickCount: 0, uniqueUsers: new Set() };
  }
  analytics.clicksByDate[date].clickCount++;
  analytics.clicksByDate[date].uniqueUsers.add(ip);

  const os = req.useragent.os || "Unknown";
  if (!analytics.osType[os]) {
    analytics.osType[os] = { clicks: 0, uniqueUsers: new Set() };
  }
  analytics.osType[os].clicks++;
  analytics.osType[os].uniqueUsers.add(ip);

  const device = req.useragent.isMobile ? "mobile" : "desktop";
  if (!analytics.deviceType[device]) {
    analytics.deviceType[device] = { clicks: 0, uniqueUsers: new Set() };
  }
  analytics.deviceType[device].clicks++;
  analytics.deviceType[device].uniqueUsers.add(ip);

  res.redirect(data.longUrl);
});

export default router;
