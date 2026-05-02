# EventSphere — College Events Platform

## Overview
EventSphere is a full-stack college events management platform built with React + Vite (frontend), Express + Drizzle ORM (backend), and PostgreSQL (database).

## Architecture

### Stack
- **Frontend**: React 18, Vite, Wouter (routing), TanStack Query, Tailwind CSS v4, shadcn/ui, Recharts
- **Backend**: Node.js, Express, Drizzle ORM, Pino (logging)
- **Database**: PostgreSQL (Replit managed)
- **API Contract**: OpenAPI spec → Orval codegen → typed React Query hooks
- **Monorepo**: pnpm workspaces

### Workspace Packages
| Package | Path | Role |
|---|---|---|
| `@workspace/eventsphere` | `artifacts/eventsphere` | React/Vite frontend, serves at `/` |
| `@workspace/api-server` | `artifacts/api-server` | Express REST API, serves at `/api` |
| `@workspace/db` | `lib/db` | Drizzle schema + client |
| `@workspace/api-spec` | `lib/api-spec` | OpenAPI YAML + Orval config |
| `@workspace/api-zod` | `lib/api-zod` | Generated Zod validators |
| `@workspace/api-client-react` | `lib/api-client-react` | Generated TanStack Query hooks |

## Database Schema (lib/db/src/schema/)
- **users** — id, fullName, email, passwordHash, role (participant/organizer/admin), status (active/suspended), department, year, avatarUrl, joinedAt
- **events** — id, title, description, category, department, venue, format (in_person/online), startDate, endDate, capacity, registeredCount, status (pending/approved/rejected/ongoing/completed), isFeatured, price, imageUrl, organizerId→users
- **registrations** — id, eventId→events, userId→users, ticketType (general/vip), status (registered/checked_in/waitlist/cancelled), passCode, registeredAt
- **reviews** — id, eventId→events, userId→users, rating, comment, createdAt
- **media** — id, eventId→events, imageUrl, capturedAt

## API Routes (artifacts/api-server/src/routes/)
- `GET /api/events` — list with filters (category, search, format, department, page, limit)
- `POST /api/events` — create event
- `GET /api/events/featured` — featured events
- `GET /api/events/categories` — categories with counts
- `GET /api/events/:eventId` — event detail with reviews, media, ratings
- `PUT /api/events/:eventId` — update event
- `DELETE /api/events/:eventId` — delete event
- `POST /api/events/:eventId/approve` — approve/reject event (admin)
- `GET /api/events/:eventId/registrations` — list registrations
- `POST /api/events/:eventId/register` — register for event
- `DELETE /api/events/:eventId/register` — cancel registration
- `GET /api/users` — list users
- `GET /api/users/me` — current user (mock: first participant)
- `PUT /api/users/:userId/status` — update user status
- `POST /api/auth/signup` — register (SHA256 hash with "eventsphere_salt")
- `POST /api/auth/login` — login
- `POST /api/auth/logout` — logout
- `GET /api/media` — list media
- `GET /api/analytics/overview` — platform overview stats
- `GET /api/analytics/trends` — participation trends
- `GET /api/analytics/departments` — department breakdown
- `GET /api/dashboard/participant` — participant dashboard data
- `GET /api/dashboard/organizer` — organizer dashboard data
- `GET /api/dashboard/admin` — admin dashboard data

## Frontend Pages (artifacts/eventsphere/src/pages/)
| Route | Component | Description |
|---|---|---|
| `/` | `landing.tsx` | Hero, category browser, featured events, CTA |
| `/explore` | `explore.tsx` | Event grid with sidebar filters and search |
| `/events/:id` | `event-detail.tsx` | Event detail, reviews, registration card |
| `/signup` | `signup.tsx` | Role selector, email/social signup |
| `/login` | `login.tsx` | Email/social login with demo credentials |
| `/dashboard/participant` | `dashboard/participant.tsx` | Schedule, notifications, certificates |
| `/dashboard/organizer` | `dashboard/organizer.tsx` | Active events, check-ins, feedback |
| `/dashboard/admin` | `dashboard/admin.tsx` | Approval workflow, user mgmt, alerts |
| `/dashboard/analytics` | `dashboard/analytics.tsx` | Charts, trends, department performance |
| `/gallery` | `gallery.tsx` | Masonry photo gallery with lightbox |

## Shared Components
- `Navbar.tsx` — Sticky nav with responsive mobile menu
- `DashboardLayout.tsx` — Sidebar layout used by all 3 dashboard types
- `EventCard.tsx` — Reusable event card with registration progress

## Seed Data
- 10 users (1 admin, 2 organizers, 7 participants)
- 14 events across 6 categories with real images from picsum.photos
- Reviews and media linked to events
- Demo login: any user / admin123

## Codegen Workflow
After changing `lib/api-spec/openapi.yaml`:
```bash
pnpm --filter @workspace/api-spec run codegen
```
This regenerates:
- `lib/api-zod/src/generated/api.ts` — Zod schemas
- `lib/api-client-react/src/generated/api.ts` — React Query hooks

## Key Decisions
- Auth is mock (no JWT/session) — `/users/me` returns first participant; passwords stored as SHA256 hash
- Orval config has NO `schemas` output path to avoid duplicate exports
- `lib/api-zod/src/index.ts` only exports from `./generated/api`
- API uses Drizzle with raw SQL joins (no ORM relations) for flexibility
- Frontend uses Wouter (not React Router) for lightweight routing
- All charts use Recharts
