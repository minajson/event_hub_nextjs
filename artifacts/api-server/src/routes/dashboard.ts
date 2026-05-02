import { Router } from "express";
import { db } from "@workspace/db";
import {
  eventsTable, registrationsTable, usersTable, reviewsTable, mediaTable
} from "@workspace/db";
import { eq, count, avg, desc, and } from "drizzle-orm";

const router = Router();

router.get("/dashboard/participant", async (req, res) => {
  try {
    const [events, regs, reviews] = await Promise.all([
      db.select({ id: eventsTable.id, title: eventsTable.title, venue: eventsTable.venue, startDate: eventsTable.startDate, endDate: eventsTable.endDate, category: eventsTable.category, department: eventsTable.department, format: eventsTable.format, capacity: eventsTable.capacity, registeredCount: eventsTable.registeredCount, status: eventsTable.status, isFeatured: eventsTable.isFeatured, price: eventsTable.price, imageUrl: eventsTable.imageUrl, organizerId: eventsTable.organizerId, createdAt: eventsTable.createdAt }).from(eventsTable).limit(5),
      db.select().from(registrationsTable).limit(10),
      db.select().from(reviewsTable).limit(5),
    ]);

    const nextEvent = events[0];

    res.json({
      userName: "Alex Johnson",
      registeredEventsCount: 8,
      upcomingCount: 3,
      certificatesEarned: 12,
      nextEvent: nextEvent
        ? {
            ...nextEvent,
            price: Number(nextEvent.price),
            startDate: nextEvent.startDate?.toISOString(),
            endDate: nextEvent.endDate?.toISOString(),
            createdAt: nextEvent.createdAt?.toISOString(),
            organizerName: "Computer Science Dept",
            organizerDept: "CS",
          }
        : null,
      mySchedule: events.slice(0, 4).map((e, i) => ({
        id: i + 1,
        eventId: e.id,
        eventTitle: e.title,
        venue: e.venue,
        startDate: e.startDate?.toISOString(),
        endDate: e.endDate?.toISOString(),
        registrationStatus: i === 0 ? "registered" : i === 1 ? "waitlist" : i === 2 ? "registered" : "completed",
        waitlistPosition: i === 1 ? 5 : undefined,
        hasCertificate: i === 3,
      })),
      savedEvents: events.slice(0, 2).map((e) => ({
        ...e,
        price: Number(e.price),
        startDate: e.startDate?.toISOString(),
        endDate: e.endDate?.toISOString(),
        createdAt: e.createdAt?.toISOString(),
        organizerName: "Organizer",
        organizerDept: "",
      })),
      notifications: [
        {
          id: 1,
          type: "registration",
          title: "Registration confirmed",
          message: "You are successfully registered for Web3 Workshop.",
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          type: "waitlist",
          title: "Waitlist Update",
          message: "You moved up to #5 on Cloud Seminar waitlist.",
          isRead: false,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          type: "certificate",
          title: "Certificate Available",
          message: "Your certificate for UI/UX Masterclass is ready.",
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    });
  } catch (err) {
    req.log.error({ err }, "Error getting participant dashboard");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/organizer", async (req, res) => {
  try {
    const [events, regs, reviewData] = await Promise.all([
      db.select({
        id: eventsTable.id,
        title: eventsTable.title,
        venue: eventsTable.venue,
        startDate: eventsTable.startDate,
        endDate: eventsTable.endDate,
        category: eventsTable.category,
        department: eventsTable.department,
        format: eventsTable.format,
        capacity: eventsTable.capacity,
        registeredCount: eventsTable.registeredCount,
        status: eventsTable.status,
        isFeatured: eventsTable.isFeatured,
        price: eventsTable.price,
        imageUrl: eventsTable.imageUrl,
        organizerId: eventsTable.organizerId,
        createdAt: eventsTable.createdAt,
        organizerName: usersTable.fullName,
        organizerDept: usersTable.department,
      }).from(eventsTable).leftJoin(usersTable, eq(eventsTable.organizerId, usersTable.id)).limit(5),
      db.select({
        id: registrationsTable.id,
        eventId: registrationsTable.eventId,
        eventTitle: eventsTable.title,
        userId: registrationsTable.userId,
        userName: usersTable.fullName,
        userEmail: usersTable.email,
        ticketType: registrationsTable.ticketType,
        status: registrationsTable.status,
        passCode: registrationsTable.passCode,
        registeredAt: registrationsTable.registeredAt,
      }).from(registrationsTable).leftJoin(eventsTable, eq(registrationsTable.eventId, eventsTable.id)).leftJoin(usersTable, eq(registrationsTable.userId, usersTable.id)).limit(5),
      db.select({ id: reviewsTable.id, userId: reviewsTable.userId, eventId: reviewsTable.eventId, rating: reviewsTable.rating, comment: reviewsTable.comment, createdAt: reviewsTable.createdAt, userName: usersTable.fullName, avatarUrl: usersTable.avatarUrl }).from(reviewsTable).leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id)).limit(3),
    ]);

    res.json({
      organizerName: "Sarah Jenkins",
      totalRegistrations: 1248,
      registrationsChange: 12,
      activeEventsCount: 3,
      averageAttendance: 85,
      attendanceChange: 4,
      avgFeedbackRating: 4.8,
      activeEvents: events.slice(0, 2).map((e, i) => ({
        id: e.id,
        title: e.title,
        status: i === 0 ? "ongoing" : "upcoming",
        startDate: e.startDate?.toISOString(),
        venue: e.venue,
        checkedIn: i === 0 ? 312 : 145,
        totalRegistrations: i === 0 ? 400 : 150,
      })),
      recentRegistrations: regs.map((r) => ({
        ...r,
        registeredAt: r.registeredAt?.toISOString(),
        eventTitle: r.eventTitle ?? "",
        userName: r.userName ?? "",
        userEmail: r.userEmail ?? "",
      })),
      recentFeedback: reviewData.map((r) => ({
        ...r,
        rating: Number(r.rating),
        createdAt: r.createdAt?.toISOString(),
        avatarUrl: r.avatarUrl ?? null,
        userName: r.userName ?? "",
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting organizer dashboard");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/admin", async (req, res) => {
  try {
    const [userCount, eventCount, pendingEvents, recentUsers] = await Promise.all([
      db.select({ total: count() }).from(usersTable),
      db.select({ total: count() }).from(eventsTable),
      db.select({
        id: eventsTable.id,
        title: eventsTable.title,
        venue: eventsTable.venue,
        startDate: eventsTable.startDate,
        endDate: eventsTable.endDate,
        category: eventsTable.category,
        department: eventsTable.department,
        format: eventsTable.format,
        capacity: eventsTable.capacity,
        registeredCount: eventsTable.registeredCount,
        status: eventsTable.status,
        isFeatured: eventsTable.isFeatured,
        price: eventsTable.price,
        imageUrl: eventsTable.imageUrl,
        organizerId: eventsTable.organizerId,
        createdAt: eventsTable.createdAt,
        organizerName: usersTable.fullName,
        organizerDept: usersTable.department,
      }).from(eventsTable).leftJoin(usersTable, eq(eventsTable.organizerId, usersTable.id)).where(eq(eventsTable.status, "pending")).limit(5),
      db.select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        role: usersTable.role,
        status: usersTable.status,
        department: usersTable.department,
        year: usersTable.year,
        avatarUrl: usersTable.avatarUrl,
        joinedAt: usersTable.joinedAt,
      }).from(usersTable).limit(5),
    ]);

    const trendData = [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let i = 0; i < 7; i++) {
      trendData.push({
        date: days[i],
        registrations: Math.floor(Math.random() * 700) + 300,
        attendance: Math.floor(Math.random() * 600) + 200,
      });
    }

    res.json({
      totalActiveUsers: userCount[0]?.total ?? 0,
      usersChange: 8.2,
      totalEventsHosted: eventCount[0]?.total ?? 0,
      newEventsThisWeek: 12,
      pendingApprovals: pendingEvents.length,
      systemAlertsCount: 3,
      criticalAlerts: 1,
      pendingEvents: pendingEvents.map((e) => ({
        ...e,
        price: Number(e.price),
        startDate: e.startDate?.toISOString(),
        endDate: e.endDate?.toISOString(),
        createdAt: e.createdAt?.toISOString(),
        organizerName: e.organizerName ?? "",
        organizerDept: e.organizerDept ?? "",
      })),
      recentUsers: recentUsers.map((u) => ({ ...u, joinedAt: u.joinedAt?.toISOString() })),
      systemAlerts: [
        {
          id: 1,
          type: "error",
          title: "High Server Load Detected",
          message: "Registration traffic for TechNova Hackathon is causing delays.",
          createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          type: "warning",
          title: "Reported Content",
          message: 'User flagged event "Party Night" for inappropriate description.',
          createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          type: "info",
          title: "Email Gateway Delay",
          message: "Confirmation emails are queued and delayed by ~5 mins.",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
      ],
      participationTrend: trendData,
      weeklyParticipants: 4280,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting admin dashboard");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
