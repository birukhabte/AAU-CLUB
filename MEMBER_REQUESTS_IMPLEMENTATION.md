# Member Request Management System

## Overview
This implementation allows club leaders to view and manage membership requests from students who want to join their club.

## Features Implemented

### 1. **Member Requests Page** (`/dashboard/leader/requests`)
   - Displays all pending membership requests for the club leader's club
   - Shows detailed information about each requester:
     - Full name
     - Email address
     - Student ID
     - Phone number (if available)
     - Request date
   - Provides action buttons to:
     - **Approve** membership requests
     - **Reject** membership requests
   - Real-time updates after processing requests
   - Loading states and error handling

### 2. **Leader Dashboard** (`/dashboard/leader`)
   - Overview statistics:
     - Total members count
     - Pending requests count (clickable to navigate to requests page)
     - Approved members count
     - Rejected requests count
   - Quick action links to:
     - Review member requests
     - View all members
     - Manage events

### 3. **Navigation**
   - Updated LeaderSidebar with correct routes
   - "Member Requests" menu item in the sidebar
   - Integrated with existing dashboard layout

## How It Works

### Backend Flow
1. When a student clicks "Join Club" on a club page, a membership record is created with status `PENDING`
2. A notification is sent to the club leader
3. The membership is stored in the database with the relationship: `userId` + `clubId`

### Frontend Flow
1. Club leader navigates to `/dashboard/leader/requests`
2. System fetches the club where the user is the leader
3. System fetches all memberships with status `PENDING` for that club
4. Leader can approve or reject each request
5. When approved/rejected:
   - API call updates the membership status
   - User receives a notification
   - Request is removed from the pending list
   - If approved, `joinedAt` timestamp is set

## API Endpoints Used

- `GET /api/clubs` - Fetch all clubs to find the leader's club
- `GET /api/clubs/:id/members?status=PENDING` - Fetch pending membership requests
- `PATCH /api/memberships/:membershipId/status` - Approve or reject a membership

## File Structure

```
frontend/src/app/dashboard/leader/
├── layout.tsx                 # Leader dashboard layout with sidebar
├── page.tsx                   # Leader dashboard homepage with stats
└── requests/
    └── page.tsx              # Member requests management page
```

## Color Scheme
All components use the updated color scheme: `rgb(2 116 181 / 50%)` for consistency with the rest of the application.

## Access Control
- Only users with role `CLUB_LEADER` can access these pages
- Club leaders can only manage requests for their own club
- Authentication is required for all leader dashboard routes
