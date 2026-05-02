import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq, ilike, and } from "drizzle-orm";
import { ListUsersQueryParams, UpdateUserStatusParams, UpdateUserStatusBody, SignUpBody, LoginBody } from "@workspace/api-zod";
import { randomBytes, createHash } from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return createHash("sha256").update(password + "eventsphere_salt").digest("hex");
}

router.get("/users", async (req, res) => {
  try {
    const query = ListUsersQueryParams.parse(req.query);
    const conditions = [];
    if (query.search) conditions.push(ilike(usersTable.fullName, `%${query.search}%`));
    if (query.role) conditions.push(eq(usersTable.role, query.role as any));
    if (query.status) conditions.push(eq(usersTable.status, query.status as any));

    const users = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        role: usersTable.role,
        status: usersTable.status,
        department: usersTable.department,
        year: usersTable.year,
        avatarUrl: usersTable.avatarUrl,
        joinedAt: usersTable.joinedAt,
      })
      .from(usersTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    res.json(users.map((u) => ({ ...u, joinedAt: u.joinedAt?.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Error listing users");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/me", async (req, res) => {
  try {
    // Return the first participant as the demo user
    const [user] = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        role: usersTable.role,
        status: usersTable.status,
        department: usersTable.department,
        year: usersTable.year,
        avatarUrl: usersTable.avatarUrl,
        joinedAt: usersTable.joinedAt,
      })
      .from(usersTable)
      .where(eq(usersTable.role, "participant"))
      .limit(1);

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ ...user, joinedAt: user.joinedAt?.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error getting current user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/users/:userId/status", async (req, res) => {
  try {
    const { userId } = UpdateUserStatusParams.parse({ userId: Number(req.params.userId) });
    const body = UpdateUserStatusBody.parse(req.body);

    const [user] = await db
      .update(usersTable)
      .set({ status: body.status })
      .where(eq(usersTable.id, userId))
      .returning({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        role: usersTable.role,
        status: usersTable.status,
        department: usersTable.department,
        year: usersTable.year,
        avatarUrl: usersTable.avatarUrl,
        joinedAt: usersTable.joinedAt,
      });

    res.json({ ...user, joinedAt: user.joinedAt?.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error updating user status");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/signup", async (req, res) => {
  try {
    const body = SignUpBody.parse(req.body);
    const passwordHash = hashPassword(body.password);

    const [user] = await db
      .insert(usersTable)
      .values({
        fullName: body.fullName,
        email: body.email,
        passwordHash,
        role: body.role as any,
        status: "active",
      })
      .returning({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        role: usersTable.role,
        status: usersTable.status,
        department: usersTable.department,
        year: usersTable.year,
        avatarUrl: usersTable.avatarUrl,
        joinedAt: usersTable.joinedAt,
      });

    const token = randomBytes(32).toString("hex");
    res.status(201).json({
      user: { ...user, joinedAt: user.joinedAt?.toISOString() },
      token,
      message: "Account created successfully",
    });
  } catch (err) {
    req.log.error({ err }, "Error signing up");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const body = LoginBody.parse(req.body);
    const passwordHash = hashPassword(body.password);

    const [user] = await db
      .select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        role: usersTable.role,
        status: usersTable.status,
        department: usersTable.department,
        year: usersTable.year,
        avatarUrl: usersTable.avatarUrl,
        joinedAt: usersTable.joinedAt,
      })
      .from(usersTable)
      .where(and(eq(usersTable.email, body.email), eq(usersTable.passwordHash, passwordHash)))
      .limit(1);

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const token = randomBytes(32).toString("hex");
    res.json({
      user: { ...user, joinedAt: user.joinedAt?.toISOString() },
      token,
      message: "Logged in successfully",
    });
  } catch (err) {
    req.log.error({ err }, "Error logging in");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", async (_req, res) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
