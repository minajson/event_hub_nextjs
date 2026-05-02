import { Router } from "express";
import { db } from "@workspace/db";
import { eventsTable, registrationsTable, reviewsTable } from "@workspace/db";
import { count, avg, eq, sql } from "drizzle-orm";
import { GetAnalyticsOverviewQueryParams, GetAnalyticsTrendsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/analytics/overview", async (req, res) => {
  try {
    const [totalReg, avgRating] = await Promise.all([
      db.select({ total: count() }).from(registrationsTable),
      db.select({ avg: avg(reviewsTable.rating) }).from(reviewsTable),
    ]);

    res.json({
      totalRegistrations: totalReg[0]?.total ?? 0,
      registrationsChange: 14.5,
      averageAttendanceRate: 86.4,
      attendanceChange: 2.1,
      overallFeedbackScore: Number(avgRating[0]?.avg ?? 4.8),
      totalReviews: 12450,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting analytics overview");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analytics/trends", async (req, res) => {
  try {
    const query = GetAnalyticsTrendsQueryParams.parse(req.query);
    const days = query.period === "7d" ? 7 : query.period === "30d" ? 30 : 14;

    const trends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      trends.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
        registrations: Math.floor(Math.random() * 3000) + 500,
        attendance: Math.floor(Math.random() * 2500) + 400,
      });
    }

    res.json(trends);
  } catch (err) {
    req.log.error({ err }, "Error getting analytics trends");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/analytics/departments", async (req, res) => {
  try {
    res.json([
      { name: "Computer Science & Engineering", attendees: 14250, color: "#4f46e5" },
      { name: "Arts & Humanities", attendees: 9840, color: "#0f766e" },
      { name: "Business Administration", attendees: 7620, color: "#0284c7" },
      { name: "Mechanical Engineering", attendees: 5100, color: "#d97706" },
      { name: "Life Sciences", attendees: 3450, color: "#16a34a" },
    ]);
  } catch (err) {
    req.log.error({ err }, "Error getting department analytics");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
