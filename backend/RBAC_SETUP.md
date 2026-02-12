# RBAC System Setup Guide

This guide will help you set up the Role-Based Access Control (RBAC) system for the AAU Club Management Platform.

## Quick Setup

Run this single command from the `backend` directory:

```bash
node setup-rbac.js
```

This will:
1. Run database migrations to add new tables and columns
2. Generate Prisma Client
3. Seed the database with test data

## Manual Setup (if quick setup fails)

### Step 1: Run Migration

```bash
node prisma/migrate-rbac.js
```

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

### Step 3: Seed Database

```bash
node prisma/seed-rbac.js
```

## Test Accounts

After setup, you'll have these test accounts:

### Admin Account
- **Email:** admin@aau.edu.et
- **Password:** admin123
- **Role:** ADMIN
- **Access:** Full system access

### Club Leader Accounts
- **Email:** leader1@aau.edu.et
- **Password:** leader123
- **Role:** CLUB_LEADER
- **Club:** Tech Club

- **Email:** leader2@aau.edu.et
- **Password:** leader123
- **Role:** CLUB_LEADER
- **Club:** Sports Club

### Member Accounts
- **Emails:** member1@aau.edu.et through member5@aau.edu.et
- **Password:** member123
- **Role:** MEMBER

## Database Changes

The migration adds:

### New Tables
- `membership_requests` - Tracks pending membership requests
- `refresh_tokens` - Stores JWT refresh tokens
- `activity_logs` - Logs system activities

### Modified Tables
- `users` - Added `clubId` column for club leader assignment
- `memberships` - Changed default status to 'APPROVED'

## Troubleshooting

### Error: "column clubId does not exist"
Run the migration script:
```bash
node prisma/migrate-rbac.js
```

### Error: "table already exists"
This is normal if you've run the migration before. The script handles this gracefully.

### Prisma Client errors
Regenerate the client:
```bash
npx prisma generate
```

### Need to reset everything?
```bash
# Delete the database
rm prisma/dev.db

# Run Prisma migrations
npx prisma migrate dev

# Run RBAC setup
node setup-rbac.js
```

## Next Steps

After setup:
1. Restart your backend server
2. Test login with admin account
3. Verify role-based access control is working
4. Check that admin is redirected to admin dashboard

## Environment Variables

Make sure these are set in your `.env` file:

```env
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
DATABASE_URL="file:./dev.db"
```

## Support

If you encounter issues, check:
1. Node.js version (should be 14+)
2. Prisma version (should be latest)
3. Database file permissions
4. Console error messages
