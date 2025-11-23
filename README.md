# Jeevan Setu – Project Blueprint

## 1. Vision & Problem Statement
Jeevan Setu is a three-sided emergency response marketplace that synchronizes patients, ambulance drivers, and hospitals in real time. The application must minimize friction for patients, surface actionable alerts to drivers, and give hospitals a command-center view of inbound emergencies, resources, and live status.

## 2. Experience Pillars
- **Patient:** Tap-and-go emergency trigger with "no-login" fallback, geolocation capture, and transparent driver tracking.
- **Driver:** Clear availability toggle, high-signal alerts, and structured job workflow (accept → arrive → pickup → drop-off).
- **Hospital:** Dense dashboard showing inbound trips, ETA, vitals, and simple resource management with audible notifications.

## 3. High-Level Architecture
- **Frontend:** Next.js 14 (App Router) + React Server Components, TailwindCSS, shadcn/ui, Lucide icons, Leaflet.js for maps.
- **Backend:** Next.js API routes for RESTful CRUD + dedicated Node.js/Express Socket.io server (deployed alongside Next.js or via custom server entry). Prisma as ORM (TypeScript) for PostgreSQL.
- **Database:** PostgreSQL (hosted on Neon/Supabase/RDS). Schemas aligned with provided Mongo-style models.
- **Realtime:** Socket.io (namespaces for patient, driver, hospital). Redis (optional) for socket adapter + rate limiting.
- **Infrastructure:** Monorepo with turborepo-style structure (optional) or single Next.js app with `/api` and `/socket` server. Deployed on Vercel (frontend/API) + Fly.io/Render for WebSocket server, or all-in-one on a VPS.

## 4. Repository & Project Structure
```
JeevanSetu/
├─ app/                      # Next.js App Router pages
│  ├─ layout.tsx
│  ├─ page.tsx               # Landing page (patient-focused)
│  ├─ patient/
│  │  ├─ page.tsx            # Auth landing (token check)
│  │  ├─ emergency/page.tsx  # Red button + map state
│  │  └─ profile/page.tsx
│  ├─ driver/
│  │  ├─ page.tsx            # Dashboard shell
│  │  └─ dashboard/page.tsx
│  └─ hospital/
│     └─ dashboard/page.tsx
├─ components/
├─ lib/
│  ├─ auth.ts                # JWT helpers
│  ├─ socket-client.ts       # Socket initialization
│  └─ prisma.ts              # ORM singleton
├─ server/
│  └─ socket/index.ts        # Express + Socket.io server
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ public/
├─ scripts/
├─ tests/
└─ package.json
```

## 5. Routing & UX Overview
| Portal | Route | Highlights |
|--------|-------|------------|
| Patient | `/patient` | Token check, shows landing vs. emergency redirect |
| Patient Emergency | `/patient/emergency` | Pulsing button, geolocation prompt, socket trigger, live status & map |
| Driver | `/driver/dashboard` | Online toggle, map, job cards, modal for alerts |
| Hospital | `/hospital/dashboard` | Live table, resource controls, audio cues |

## 6. Data Modeling (PostgreSQL via Prisma)
### 6.1 User (Patient)
- `id (uuid PK)`
- `name`, `phone (unique)`, `passwordHash`
- `medical_history` JSONB `{ diabetes, heartCondition, allergies }`
- `emergency_contacts` TEXT[]
- `role ENUM('patient','driver','hospital')` – patients stored here for shared auth

### 6.2 Driver
- `id (uuid PK)` + FK to `User` for auth reuse or separate table referencing `users`
- `vehicle_number`, `is_available`, `current_location GEOGRAPHY(Point,4326)`

### 6.3 Hospital
- `id (uuid PK)`
- `name`, `address`, `contact_number`
- `resources` JSONB `{ icuBeds, oxygen, ambulances }`

### 6.4 EmergencyRequest
- `id (uuid PK)`
- `patient_id` FK → `users`
- `driver_id` FK → `drivers`
- `hospital_id` FK → `hospitals`
- `status ENUM('pending','accepted','picked_up','completed')`
- `pickup_location GEOGRAPHY(Point,4326)`
- `medical_summary TEXT`
- `created_at TIMESTAMP DEFAULT now()`

Add audit columns (`updated_at`, `status_history JSONB`). Consider PostGIS for distance queries.

## 7. API Surface (REST via Next.js API routes)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/login` | Phone/password → JWT + refresh token |
| POST | `/api/auth/register` | Create patient/driver/hospital accounts |
| GET | `/api/patient/me` | Fetch current patient profile |
| PATCH | `/api/patient/medical` | Update medical history |
| POST | `/api/emergencies` | Trigger emergency (also emits `request_emergency`) |
| GET | `/api/emergencies/:id` | Fetch emergency status |
| POST | `/api/drivers/:id/availability` | Toggle driver online |
| POST | `/api/emergencies/:id/accept` | Driver accept (validates availability) |
| POST | `/api/emergencies/:id/trip-update` | Status transitions |
| GET | `/api/hospitals` | List hospitals + resources |
| PATCH | `/api/hospitals/:id/resources` | Adjust counters |

JWT middleware ensures role-based access (patient/driver/hospital). Refresh token rotation via HTTP-only cookies; short-lived access token stored in memory/localStorage for bypass scenario.

## 8. Real-Time Socket Workflows
1. **`join_room`**
   - Clients emit with `{ role, entityId }`.
   - Server joins `drivers_room`, `hospital:{id}`, `patient:{id}` etc.
2. **`request_emergency`**
   - From patient/bystander: `{ userId, location, medicalSummary }`
   - Server persists emergency, emits `broadcast_emergency` to `drivers_room`.
3. **`broadcast_emergency`**
   - Payload includes `emergencyId`, patient info, severity tags, distance estimate.
4. **`accept_emergency`**
   - Driver emits with `{ emergencyId, driverId }`.
   - Server locks record (optimistic concurrency) and notifies patient + hospital.
5. **`send_location`**
   - Driver emits every 5s with coords; server forwards to patient + hospital channel.
6. **`trip_update`**
   - Driver or hospital updates status transitions.
   - Server updates DB and emits to patient/hospital dashboards.

Use acknowledgements to handle race conditions (e.g., first driver to accept). Consider storing socket-client ↔ entity map in Redis for horizontal scaling.

## 9. UI Component Highlights
- **Patient**
  - `EmergencyButton` (pulsing animation via Tailwind keyframes)
  - `StatusCard` showing driver details + ETA
  - `MapPanel` (Leaflet) with patient + ambulance markers
- **Driver**
  - `AvailabilitySwitch`
  - `AlertModal` for new requests
  - `TripTimeline` buttons
- **Hospital**
  - `LiveTable` with row color coding by status
  - `ResourceCounters` with increment/decrement buttons
  - `AudioAlert` hook triggered by socket event

## 10. Maps & Geolocation
- Use Leaflet with OpenStreetMap tiles via `react-leaflet`.
- Geolocation API for patient location; fallback to manual entry.
- Driver updates feed Leaflet markers for patient/hospital views.
- Compute ETA via OSRM or Mapbox Directions (optional) or simple Haversine + average speed for prototyping.

## 11. Authentication & Security
- Phone + OTP optional for future; start with password-based login + JWT.
- `localStorage` stores access token for patient auto-redirect. Sensitive actions rely on HTTP-only refresh cookie.
- Rate limit emergency triggers and driver accept actions.
- Encrypt medical history at rest if feasible; audit logs for hospital access.

## 12. Testing Strategy
- Unit tests: Zustand stores/hooks, utility functions (distance calc, socket handlers).
- Integration tests: Next.js route handlers using `supertest` against in-memory Postgres (pg-mem) or Prisma test db.
- E2E: Playwright flows for patient red-button, driver accept, hospital dashboard update.

## 13. Delivery Roadmap (Example)
1. **Week 1** – Repo scaffolding, auth, Prisma schema, socket server baseline.
2. **Week 2** – Patient portal (red button flow + map), emergency creation API, socket integration.
3. **Week 3** – Driver dashboard, alert modal, job lifecycle, live location streaming.
4. **Week 4** – Hospital dashboard, resource manager, audio alerts, analytics, hardening.
5. **Week 5** – QA, load testing, deployment pipelines, observability (logs, metrics).

## 14. Risks & Mitigations
- **Socket scaling:** Plan for Redis adapter early.
- **Location accuracy:** Provide manual override and handle denied permissions.
- **Data privacy:** Store minimal PHI, ensure TLS everywhere.
- **Offline scenarios:** Cache last-known driver/hospital info, queue requests.

## 15. Next Steps
- Initialize Next.js 14 project with Tailwind + shadcn boilerplate.
- Set up Prisma schema + migrations.
- Implement auth flows + JWT helpers.
- Stand up Socket.io server and wire basic events.
- Build patient emergency experience end-to-end before layering driver/hospital dashboards.

## 16. Patient-First Implementation Plan
- Start with the patient profile + emergency workflow described in [`docs/patient-roadmap.md`](./docs/patient-roadmap.md).
- Follow the phased backlog (P0–P4) to introduce registration intake, emergency triggers, bystander flow, offline fallbacks, and compliance metrics before expanding to driver/hospital tooling.
- Keep the playbook and roadmap in sync whenever schemas, APIs, or socket contracts change.
