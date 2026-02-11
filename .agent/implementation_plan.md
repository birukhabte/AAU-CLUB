# AAU Club Management System - Implementation Plan

## Architecture
- **Backend**: Node.js + Express.js + Prisma + MongoDB
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Auth**: JWT (access + refresh tokens) + bcrypt
- **Validation**: Zod

## Project Structure
```
AAU-Club/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── hooks/
│   │   └── styles/
│   ├── package.json
│   └── .env.local
└── README.md
```

## Phase 1: Backend Foundation
1. Initialize Express.js project
2. Setup Prisma with MongoDB
3. Define database schema
4. Implement auth (register, login, JWT)
5. RBAC middleware

## Phase 2: Backend API
1. User CRUD
2. Club CRUD
3. Membership management
4. Event CRUD + RSVP
5. Announcements & Notifications

## Phase 3: Frontend Foundation
1. Initialize Next.js with Tailwind
2. Auth pages (login, register)
3. Layout & navigation
4. Role-based routing

## Phase 4: Frontend Features
1. Club directory (search, filter)
2. Club detail pages
3. Event calendar
4. Member profiles
5. Dashboards (Admin, Leader, Member)
6. Notification system

## Database Models
- User, Club, Membership, Event, RSVP, Announcement, Notification
