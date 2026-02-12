# Design Document: Role-Based Access Control System

## Overview

This design document outlines the implementation of a comprehensive role-based access control (RBAC) system for a club management platform. The system will enforce authorization at both API and UI levels, supporting three distinct user roles: Admin, Club Leader, and Member.

The design leverages the existing Node.js/Express backend with Prisma ORM, Next.js frontend with TypeScript, and JWT-based authentication infrastructure. The RBAC system will be implemented through middleware layers, role-checking utilities, and frontend route guards to ensure secure and appropriate access control throughout the application.

### Key Design Principles

1. **Defense in Depth**: Authorization checks at multiple layers (API, business logic, UI)
2. **Least Privilege**: Users receive only the permissions necessary for their role
3. **Separation of Concerns**: Authentication and authorization logic separated from business logic
4. **Extensibility**: Design supports adding new roles and permissions in the future
5. **Performance**: Efficient role checks that don't significantly impact response times

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Route Guards │  │ Role-Based   │  │  Dashboards  │      │
│  │              │  │ UI Components│  │  (3 types)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/JWT
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express/Node.js)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Middleware Layer                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │   Auth     │→ │   Role     │→ │  Resource  │    │   │
│  │  │ Middleware │  │ Middleware │  │ Ownership  │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Business Logic Layer                    │   │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐    │   │
│  │  │  User  │  │  Club  │  │ Event  │  │ Member │    │   │
│  │  │Service │  │Service │  │Service │  │Service │    │   │
│  │  └────────┘  └────────┘  └────────┘  └────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Data Access Layer (Prisma)              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Database    │
                    │  (PostgreSQL) │
                    └───────────────┘
```

### Authorization Flow

```
User Request
    │
    ▼
┌─────────────────┐
│ Extract JWT     │
│ from Header     │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Verify JWT      │
│ Signature       │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Extract User    │
│ ID & Role       │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Check Role      │
│ Permission      │
└─────────────────┘
    │
    ├─ Authorized ──────────┐
    │                       ▼
    │              ┌─────────────────┐
    │              │ Check Resource  │
    │              │ Ownership       │
    │              │ (if needed)     │
    │              └─────────────────┘
    │                       │
    │                       ▼
    │              ┌─────────────────┐
    │              │ Execute         │
    │              │ Business Logic  │
    │              └─────────────────┘
    │
    └─ Unauthorized ────────┐
                            ▼
                   ┌─────────────────┐
                   │ Return 403      │
                   │ Forbidden       │
                   └─────────────────┘
```

## Components and Interfaces

### 1. Authentication Middleware

**Purpose**: Verify JWT tokens and extract user information

**Interface**:
```typescript
interface AuthMiddleware {
  // Verify JWT and attach user to request
  authenticate(req: Request, res: Response, next: NextFunction): void;
}

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: 'ADMIN' | 'CLUB_LEADER' | 'MEMBER';
    clubId?: string; // Present for CLUB_LEADER role
  };
}
```

**Implementation Details**:
- Extract JWT from Authorization header (Bearer token)
- Verify token signature using secret key
- Check token expiration
- Decode payload and attach user info to request object
- Return 401 if token is missing, invalid, or expired

### 2. Role Authorization Middleware

**Purpose**: Enforce role-based access control on routes

**Interface**:
```typescript
interface RoleMiddleware {
  // Check if user has required role(s)
  requireRole(...roles: UserRole[]): MiddlewareFunction;
  
  // Check if user is admin
  requireAdmin(): MiddlewareFunction;
  
  // Check if user is club leader or admin
  requireClubLeaderOrAdmin(): MiddlewareFunction;
}

type UserRole = 'ADMIN' | 'CLUB_LEADER' | 'MEMBER';
type MiddlewareFunction = (req: Request, res: Response, next: NextFunction) => void;
```

**Implementation Details**:
- Assumes authentication middleware has already run
- Check if user's role matches any of the allowed roles
- Return 403 Forbidden if role doesn't match
- Support multiple allowed roles for flexible permissions

### 3. Resource Ownership Middleware

**Purpose**: Verify that Club Leaders can only access their own club's resources

**Interface**:
```typescript
interface ResourceOwnershipMiddleware {
  // Verify club leader owns the club
  verifyClubOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
  
  // Verify club leader owns the event's club
  verifyEventOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
  
  // Verify member belongs to the club
  verifyMembership(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
}
```

**Implementation Details**:
- Extract resource ID from request params
- Query database to check ownership/membership
- Admins bypass ownership checks
- Return 403 if ownership verification fails

### 4. JWT Service

**Purpose**: Handle token generation, verification, and refresh

**Interface**:
```typescript
interface JWTService {
  // Generate access token (15 min expiry)
  generateAccessToken(userId: string, email: string, role: UserRole, clubId?: string): string;
  
  // Generate refresh token (7 day expiry)
  generateRefreshToken(userId: string): string;
  
  // Verify and decode access token
  verifyAccessToken(token: string): TokenPayload | null;
  
  // Verify and decode refresh token
  verifyRefreshToken(token: string): RefreshTokenPayload | null;
  
  // Invalidate refresh token
  invalidateRefreshToken(userId: string): Promise<void>;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  clubId?: string;
  iat: number;
  exp: number;
}

interface RefreshTokenPayload {
  userId: string;
  iat: number;
  exp: number;
}
```

**Implementation Details**:
- Use jsonwebtoken library for token operations
- Store refresh tokens in database with user association
- Access tokens are stateless (not stored)
- Include role and clubId in access token payload
- Implement token blacklisting for logout

### 5. User Service

**Purpose**: Manage user accounts and role assignments

**Interface**:
```typescript
interface UserService {
  // Create new user with role
  createUser(email: string, password: string, role: UserRole, clubId?: string): Promise<User>;
  
  // Update user role
  updateUserRole(userId: string, newRole: UserRole, clubId?: string): Promise<User>;
  
  // Get user by ID with role info
  getUserById(userId: string): Promise<User | null>;
  
  // Get all users (admin only)
  getAllUsers(filters?: UserFilters): Promise<User[]>;
  
  // Authenticate user and return tokens
  authenticateUser(email: string, password: string): Promise<AuthResult>;
  
  // Refresh access token
  refreshAccessToken(refreshToken: string): Promise<string>;
  
  // Logout user
  logoutUser(userId: string): Promise<void>;
}

interface User {
  id: string;
  email: string;
  role: UserRole;
  clubId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}
```

### 6. Club Service

**Purpose**: Manage clubs and club leadership

**Interface**:
```typescript
interface ClubService {
  // Create new club (admin only)
  createClub(name: string, description: string, leaderId?: string): Promise<Club>;
  
  // Update club details
  updateClub(clubId: string, updates: ClubUpdates): Promise<Club>;
  
  // Activate/deactivate club (admin only)
  setClubStatus(clubId: string, active: boolean): Promise<Club>;
  
  // Get club by ID
  getClubById(clubId: string): Promise<Club | null>;
  
  // Get all clubs
  getAllClubs(activeOnly?: boolean): Promise<Club[]>;
  
  // Assign club leader
  assignClubLeader(clubId: string, userId: string): Promise<void>;
  
  // Remove club leader
  removeClubLeader(clubId: string, userId: string): Promise<void>;
}

interface Club {
  id: string;
  name: string;
  description: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 7. Membership Service

**Purpose**: Handle club membership requests and member management

**Interface**:
```typescript
interface MembershipService {
  // Request to join club
  requestMembership(userId: string, clubId: string): Promise<MembershipRequest>;
  
  // Approve membership request
  approveMembership(requestId: string, approverId: string): Promise<Membership>;
  
  // Reject membership request
  rejectMembership(requestId: string, approverId: string): Promise<void>;
  
  // Get pending requests for club
  getPendingRequests(clubId: string): Promise<MembershipRequest[]>;
  
  // Get club members
  getClubMembers(clubId: string): Promise<Member[]>;
  
  // Export club members
  exportClubMembers(clubId: string, format: 'CSV' | 'PDF'): Promise<Buffer>;
  
  // Check if user is member of club
  isMember(userId: string, clubId: string): Promise<boolean>;
}

interface MembershipRequest {
  id: string;
  userId: string;
  clubId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
}

interface Member {
  id: string;
  userId: string;
  clubId: string;
  joinedAt: Date;
  user: {
    email: string;
    name?: string;
  };
}
```

### 8. Event Service

**Purpose**: Manage club events and RSVPs

**Interface**:
```typescript
interface EventService {
  // Create event (club leader only)
  createEvent(clubId: string, creatorId: string, details: EventDetails): Promise<Event>;
  
  // Update event
  updateEvent(eventId: string, updates: EventUpdates): Promise<Event>;
  
  // Delete event
  deleteEvent(eventId: string): Promise<void>;
  
  // Get events for club
  getClubEvents(clubId: string): Promise<Event[]>;
  
  // Get events for member (from joined clubs)
  getMemberEvents(userId: string): Promise<Event[]>;
  
  // RSVP to event
  rsvpToEvent(eventId: string, userId: string, status: RSVPStatus): Promise<RSVP>;
  
  // Get RSVPs for event
  getEventRSVPs(eventId: string): Promise<RSVP[]>;
}

interface Event {
  id: string;
  clubId: string;
  creatorId: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location: string;
  createdAt: Date;
}

type RSVPStatus = 'GOING' | 'NOT_GOING' | 'MAYBE';

interface RSVP {
  id: string;
  eventId: string;
  userId: string;
  status: RSVPStatus;
  createdAt: Date;
}
```

### 9. Announcement Service

**Purpose**: Manage club announcements

**Interface**:
```typescript
interface AnnouncementService {
  // Create announcement (club leader only)
  createAnnouncement(clubId: string, creatorId: string, content: string, title: string): Promise<Announcement>;
  
  // Get announcements for club
  getClubAnnouncements(clubId: string): Promise<Announcement[]>;
  
  // Get announcements for member (from joined clubs)
  getMemberAnnouncements(userId: string): Promise<Announcement[]>;
  
  // Get all announcements (admin only)
  getAllAnnouncements(): Promise<Announcement[]>;
  
  // Delete announcement
  deleteAnnouncement(announcementId: string): Promise<void>;
}

interface Announcement {
  id: string;
  clubId: string;
  creatorId: string;
  title: string;
  content: string;
  createdAt: Date;
}
```

### 10. Analytics Service

**Purpose**: Provide system-wide analytics and activity logs

**Interface**:
```typescript
interface AnalyticsService {
  // Get system metrics
  getSystemMetrics(): Promise<SystemMetrics>;
  
  // Get activity logs
  getActivityLogs(filters?: LogFilters): Promise<ActivityLog[]>;
  
  // Log activity
  logActivity(userId: string, action: string, details: object): Promise<void>;
}

interface SystemMetrics {
  totalClubs: number;
  activeClubs: number;
  totalMembers: number;
  totalEvents: number;
  totalAnnouncements: number;
  recentActivity: ActivitySummary[];
}

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: object;
  timestamp: Date;
}
```

### 11. Frontend Route Guards

**Purpose**: Protect frontend routes based on user role

**Interface**:
```typescript
interface RouteGuard {
  // Check if user can access route
  canActivate(route: string, userRole: UserRole): boolean;
  
  // Get redirect path for unauthorized access
  getRedirectPath(userRole: UserRole): string;
  
  // Wrap component with role check
  withRoleGuard(Component: React.ComponentType, allowedRoles: UserRole[]): React.ComponentType;
}
```

**Implementation Details**:
- Check user role from JWT stored in client
- Redirect unauthorized users to appropriate dashboard
- Show loading state while verifying authentication
- Support both page-level and component-level guards

### 12. Role-Based UI Components

**Purpose**: Conditionally render UI elements based on user role

**Interface**:
```typescript
interface RoleBasedComponent {
  // Render children only if user has required role
  <RoleGuard allowedRoles={UserRole[]}>
    {children}
  </RoleGuard>
  
  // Render different content based on role
  <RoleSwitch>
    <RoleCase role="ADMIN">{adminContent}</RoleCase>
    <RoleCase role="CLUB_LEADER">{leaderContent}</RoleCase>
    <RoleCase role="MEMBER">{memberContent}</RoleCase>
  </RoleSwitch>
}
```

## Data Models

### Database Schema Extensions

The existing User model already has a role field. We need to extend the schema to support club leadership and membership tracking.

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  password      String
  role          Role     @default(MEMBER)
  clubId        String?  // For CLUB_LEADER role
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  club          Club?    @relation("ClubLeader", fields: [clubId], references: [id])
  memberships   Membership[]
  events        Event[]
  announcements Announcement[]
  rsvps         RSVP[]
  activityLogs  ActivityLog[]
  refreshTokens RefreshToken[]
}

enum Role {
  ADMIN
  CLUB_LEADER
  MEMBER
}

model Club {
  id            String   @id @default(cuid())
  name          String
  description   String
  active        Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  leaders       User[]   @relation("ClubLeader")
  members       Membership[]
  events        Event[]
  announcements Announcement[]
  membershipRequests MembershipRequest[]
}

model Membership {
  id        String   @id @default(cuid())
  userId    String
  clubId    String
  joinedAt  DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  club      Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)
  
  @@unique([userId, clubId])
}

model MembershipRequest {
  id        String   @id @default(cuid())
  userId    String
  clubId    String
  status    RequestStatus @default(PENDING)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  club      Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)
  
  @@unique([userId, clubId])
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
}

model Event {
  id          String   @id @default(cuid())
  clubId      String
  creatorId   String
  title       String
  description String
  startTime   DateTime
  endTime     DateTime
  location    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  club        Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)
  creator     User     @relation(fields: [creatorId], references: [id])
  rsvps       RSVP[]
}

model RSVP {
  id        String     @id @default(cuid())
  eventId   String
  userId    String
  status    RSVPStatus
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  
  event     Event      @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([eventId, userId])
}

enum RSVPStatus {
  GOING
  NOT_GOING
  MAYBE
}

model Announcement {
  id        String   @id @default(cuid())
  clubId    String
  creatorId String
  title     String
  content   String
  createdAt DateTime @default(now())
  
  club      Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)
  creator   User     @relation(fields: [creatorId], references: [id])
}

model RefreshToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model ActivityLog {
  id        String   @id @default(cuid())
  userId    String
  action    String
  details   Json
  timestamp DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Role Permission Matrix

| Feature | Admin | Club Leader | Member |
|---------|-------|-------------|--------|
| View all clubs | ✓ | ✓ | ✓ |
| Create club | ✓ | ✗ | ✗ |
| Update any club | ✓ | Own club only | ✗ |
| Deactivate club | ✓ | ✗ | ✗ |
| View all users | ✓ | ✗ | ✗ |
| Change user roles | ✓ | ✗ | ✗ |
| Approve membership | ✓ | Own club only | ✗ |
| Request membership | ✗ | ✗ | ✓ |
| Create event | ✓ | Own club only | ✗ |
| Update event | ✓ | Own club only | ✗ |
| Delete event | ✓ | Own club only | ✗ |
| RSVP to event | ✓ | ✓ | ✓ (joined clubs) |
| Create announcement | ✓ | Own club only | ✗ |
| View announcements | ✓ (all) | ✓ (own club) | ✓ (joined clubs) |
| Export members | ✓ | Own club only | ✗ |
| View analytics | ✓ | ✗ | ✗ |
| View activity logs | ✓ | ✗ | ✗ |


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, I identified several redundancies:
- Requirements 1.2 is subsumed by 1.1 (JWT containing role)
- Requirements 7.3 is duplicate of 1.3 (token invalidation on role change)
- Requirements 8.1 is duplicate of 7.2 (club leader requiring club assignment)
- Requirements 8.4 is duplicate of 3.6 (club leader boundary enforcement)
- Requirements 10.1 is duplicate of 3.3 (event association with club)
- Requirements 10.5 is duplicate of 4.3 (event visibility scoping)
- Requirements 10.6 is the inverse of 10.4 (covered by same property)
- Requirements 11.2 is duplicate of 3.4 (announcement delivery scoping)
- Requirements 11.3 is duplicate of 4.5 (announcement visibility scoping)
- Requirements 15.1-15.5 are architectural requirements covered by functional properties

The following properties represent the unique, testable correctness guarantees after eliminating redundancies.

### Authentication and Token Management Properties

**Property 1: JWT contains role information**
*For any* authenticated user, the issued JWT access token should contain their current role ('ADMIN', 'CLUB_LEADER', or 'MEMBER') and clubId (if applicable) in the payload.
**Validates: Requirements 1.1, 1.2**

**Property 2: Role change invalidates tokens**
*For any* user whose role is changed, all previously issued access tokens should be rejected by the authentication middleware, requiring re-authentication.
**Validates: Requirements 1.3, 7.3**

**Property 3: Password hashing**
*For any* user account created, the stored password in the database should be a hashed value (not plaintext) that can be verified against the original password using the hashing algorithm.
**Validates: Requirements 1.4**

**Property 4: Token expiration enforcement**
*For any* JWT access token with an expiration time in the past, authentication middleware should reject the token and return a 401 Unauthorized error.
**Validates: Requirements 1.5**

**Property 5: Access token expiration time**
*For any* generated access token, the expiration time should be no more than 15 minutes from the issue time.
**Validates: Requirements 14.1**

**Property 6: Refresh token expiration time**
*For any* generated refresh token, the expiration time should be no more than 7 days from the issue time.
**Validates: Requirements 14.2**

**Property 7: Token refresh updates role**
*For any* valid refresh token, using it to obtain a new access token should result in an access token containing the user's current role information (reflecting any role changes since the refresh token was issued).
**Validates: Requirements 14.3**

**Property 8: Logout invalidates refresh token**
*For any* user who logs out, their refresh token should be invalidated and subsequent attempts to use it should fail.
**Validates: Requirements 14.4**

### Admin Role Permission Properties

**Property 9: Admin can manage all clubs**
*For any* admin user, they should be able to create, update, activate, and deactivate any club without authorization errors.
**Validates: Requirements 2.1**

**Property 10: Admin can manage all users**
*For any* admin user, they should be able to view all users and modify any user's role.
**Validates: Requirements 2.2**

**Property 11: Admin can manage all events**
*For any* admin user and any event, the admin should be able to view, update, and delete the event regardless of which club it belongs to.
**Validates: Requirements 2.3**

**Property 12: Admin can view all announcements**
*For any* admin user, they should be able to view all announcements across all clubs.
**Validates: Requirements 2.4, 11.4**

**Property 13: Admin can access analytics**
*For any* admin user, they should be able to access analytics endpoints and view system-wide metrics without authorization errors.
**Validates: Requirements 2.5**

**Property 14: Admin bypasses all authorization checks**
*For any* protected API endpoint and any admin user, the request should succeed (not return 403 Forbidden) regardless of resource ownership requirements.
**Validates: Requirements 2.6**

### Club Leader Permission Properties

**Property 15: Club leader can only update own club**
*For any* club leader and any club, the club leader should be able to update the club if and only if they are assigned to that club (clubId matches).
**Validates: Requirements 3.1**

**Property 16: Club leader can only manage own membership requests**
*For any* club leader and any membership request, the club leader should be able to approve or reject the request if and only if the request is for their assigned club.
**Validates: Requirements 3.2, 9.2**

**Property 17: Event association with club**
*For any* event created by a club leader, the event's clubId should match the club leader's assigned clubId.
**Validates: Requirements 3.3, 10.1**

**Property 18: Announcement scoped to club members**
*For any* announcement created by a club leader, only members of that club (and admins) should be able to view the announcement.
**Validates: Requirements 3.4, 11.2**

**Property 19: Member list scoped to club**
*For any* club leader requesting a member list, the returned list should contain only members of their assigned club.
**Validates: Requirements 3.5**

**Property 20: Club leader boundary enforcement**
*For any* club leader attempting to access another club's data (events, members, announcements), the system should return a 403 Forbidden error.
**Validates: Requirements 3.6, 8.4**

**Property 21: Club ownership verification**
*For any* club leader accessing club-specific data, the system should verify that the club leader's clubId matches the resource's clubId before allowing access.
**Validates: Requirements 8.2**

**Property 22: Multiple leaders per club**
*For any* club with multiple assigned leaders, all leaders should be able to manage the club's data (events, members, announcements) without authorization errors.
**Validates: Requirements 8.3**

**Property 23: Inactive club restrictions**
*For any* club that is deactivated, club leaders assigned to that club should receive authorization errors when attempting management actions (creating events, approving members).
**Validates: Requirements 8.5**

### Member Permission Properties

**Property 24: Member can view active clubs**
*For any* member user, they should be able to view all clubs where active=true without authorization errors.
**Validates: Requirements 4.1**

**Property 25: Membership request creation**
*For any* member user and any active club, the member should be able to create a membership request with status='PENDING'.
**Validates: Requirements 4.2, 9.1**

**Property 26: Event visibility scoped to joined clubs**
*For any* member user, the events they can view should be exactly the events from clubs they have joined (membership exists).
**Validates: Requirements 4.3, 10.5**

**Property 27: RSVP recording**
*For any* member user RSVPing to an event, the system should create or update an RSVP record with the specified status.
**Validates: Requirements 4.4**

**Property 28: Announcement visibility scoped to joined clubs**
*For any* member user, the announcements they can view should be exactly the announcements from clubs they have joined.
**Validates: Requirements 4.5, 11.3**

**Property 29: Member boundary enforcement**
*For any* member user attempting to access admin or club management endpoints, the system should return a 403 Forbidden error.
**Validates: Requirements 4.6**

**Property 30: RSVP authorization**
*For any* member attempting to RSVP to an event, the RSVP should succeed if and only if the member has joined the event's club.
**Validates: Requirements 10.4, 10.6**

### API Authorization Properties

**Property 31: Protected endpoint JWT verification**
*For any* request to a protected API endpoint, the authentication middleware should verify the JWT signature and expiration before proceeding.
**Validates: Requirements 5.1, 15.1**

**Property 32: Role mismatch returns 403**
*For any* authenticated request to an endpoint requiring a specific role, if the user's role does not match the required role(s), the system should return a 403 Forbidden error.
**Validates: Requirements 5.2, 15.2, 15.3**

**Property 33: Missing JWT returns 401**
*For any* request to a protected endpoint without a valid JWT, the system should return a 401 Unauthorized error.
**Validates: Requirements 5.3**

**Property 34: Admin endpoint protection**
*For any* admin-only endpoint and any non-admin user, the request should return a 403 Forbidden error.
**Validates: Requirements 5.5**

**Property 35: Club leader endpoint protection**
*For any* club leader endpoint, the request should succeed if the user has role='CLUB_LEADER' or role='ADMIN', and fail with 403 otherwise.
**Validates: Requirements 5.6, 15.4**

**Property 36: Member endpoint authentication**
*For any* member endpoint, the request should succeed if the user is authenticated with any valid role, and fail with 401 if not authenticated.
**Validates: Requirements 5.7**

### UI Authorization Properties

**Property 37: Role-specific dashboard redirect**
*For any* user logging in, the system should redirect them to a dashboard URL that corresponds to their role (admin → /admin-dashboard, club leader → /club-dashboard, member → /dashboard).
**Validates: Requirements 6.1**

**Property 38: Admin navigation rendering**
*For any* admin user viewing the navigation component, the rendered HTML should contain all administrative menu options (users, clubs, analytics, events, announcements).
**Validates: Requirements 6.2**

**Property 39: Club leader navigation rendering**
*For any* club leader viewing the navigation component, the rendered HTML should contain club management menu options (my club, events, members, announcements).
**Validates: Requirements 6.3**

**Property 40: Member navigation rendering**
*For any* member user viewing the navigation component, the rendered HTML should contain member-specific menu options (browse clubs, my clubs, events).
**Validates: Requirements 6.4**

**Property 41: Frontend route guard redirect**
*For any* user attempting to navigate to a route they lack permission for, the route guard should redirect them to an unauthorized page or their role-specific dashboard.
**Validates: Requirements 6.5, 15.5**

**Property 42: Conditional component rendering**
*For any* UI component wrapped in a role guard, the component should render if the user's role matches the allowed roles, and not render otherwise.
**Validates: Requirements 6.6**

### Role Management Properties

**Property 43: Role assignment persistence**
*For any* admin assigning a role to a user, the user's role field in the database should be updated to the new role value.
**Validates: Requirements 7.1**

**Property 44: Club leader requires club assignment**
*For any* user being assigned the 'CLUB_LEADER' role, the operation should fail unless a valid clubId is also provided.
**Validates: Requirements 7.2, 8.1**

**Property 45: Role demotion clears club assignment**
*For any* user with role='CLUB_LEADER' being changed to role='MEMBER', the user's clubId field should be set to null.
**Validates: Requirements 7.4**

**Property 46: Non-admin cannot change roles**
*For any* non-admin user attempting to change any user's role, the system should return a 403 Forbidden error.
**Validates: Requirements 7.5**

### Membership Workflow Properties

**Property 47: Membership request approval creates membership**
*For any* club leader approving a membership request, the system should create a Membership record linking the user to the club and update the request status to 'APPROVED'.
**Validates: Requirements 9.3**

**Property 48: Membership request rejection**
*For any* club leader rejecting a membership request, the system should update the request status to 'REJECTED' without creating a Membership record.
**Validates: Requirements 9.4**

**Property 49: Duplicate membership request prevention**
*For any* member with a pending membership request for a club, attempting to create another request for the same club should fail with an error.
**Validates: Requirements 9.5**

### Event Management Properties

**Property 50: Event update authorization**
*For any* club leader attempting to update an event, the update should succeed if and only if the event's clubId matches the leader's clubId (or user is admin).
**Validates: Requirements 10.2**

**Property 51: Event deletion cascades to RSVPs**
*For any* event being deleted, all RSVP records associated with that event should also be deleted.
**Validates: Requirements 10.3**

### Announcement Properties

**Property 52: Announcement association with club**
*For any* announcement created by a club leader, the announcement's clubId should match the club leader's assigned clubId.
**Validates: Requirements 11.1**

**Property 53: Club leader announcement authorization**
*For any* club leader attempting to create an announcement for a club, the operation should succeed if and only if the club matches their assigned clubId (or user is admin).
**Validates: Requirements 11.5**

### Export Properties

**Property 54: Export scoped to club**
*For any* club leader requesting a member export, the exported data should contain only members of their assigned club.
**Validates: Requirements 12.1**

**Property 55: CSV export format**
*For any* member export with format='CSV', the returned data should be a valid CSV file with proper comma separation and headers.
**Validates: Requirements 12.2**

**Property 56: PDF export format**
*For any* member export with format='PDF', the returned data should be a valid PDF file.
**Validates: Requirements 12.3**

**Property 57: Export content completeness**
*For any* member export, each member record should include name, email, join date, and status fields.
**Validates: Requirements 12.4**

**Property 58: Export authorization**
*For any* non-club-leader (excluding admins) attempting to export member data, the system should return a 403 Forbidden error.
**Validates: Requirements 12.5**

### Analytics Properties

**Property 59: Analytics data accuracy**
*For any* admin accessing analytics, the returned metrics should accurately reflect the current database state (total clubs, members, events counts).
**Validates: Requirements 13.1**

**Property 60: Activity log completeness**
*For any* admin viewing activity logs, the logs should include user actions with timestamps and details.
**Validates: Requirements 13.2**

**Property 61: Analytics date filtering**
*For any* admin filtering analytics by date range, the returned metrics should only include data within the specified date range.
**Validates: Requirements 13.3**

**Property 62: Activity logging**
*For any* significant action (role change, club creation, membership approval), the system should create an ActivityLog record with the action details.
**Validates: Requirements 13.4**

**Property 63: Analytics authorization**
*For any* non-admin user attempting to access analytics endpoints, the system should return a 403 Forbidden error.
**Validates: Requirements 13.5**


## Error Handling

### Error Response Format

All API errors should follow a consistent format:

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: object;
  };
  timestamp: string;
  path: string;
}
```

### HTTP Status Codes

| Status Code | Usage | Example |
|-------------|-------|---------|
| 400 Bad Request | Invalid input data | Missing required fields, invalid email format |
| 401 Unauthorized | Authentication failure | Missing JWT, expired token, invalid credentials |
| 403 Forbidden | Authorization failure | Insufficient permissions, accessing another club's data |
| 404 Not Found | Resource doesn't exist | Club ID not found, event doesn't exist |
| 409 Conflict | Resource conflict | Duplicate membership request, email already exists |
| 500 Internal Server Error | Unexpected server error | Database connection failure, unhandled exception |

### Error Scenarios

**Authentication Errors**:
- Missing Authorization header → 401 with code 'AUTH_TOKEN_MISSING'
- Invalid JWT signature → 401 with code 'AUTH_TOKEN_INVALID'
- Expired JWT → 401 with code 'AUTH_TOKEN_EXPIRED'
- Invalid credentials → 401 with code 'AUTH_INVALID_CREDENTIALS'

**Authorization Errors**:
- Insufficient role permissions → 403 with code 'AUTH_INSUFFICIENT_PERMISSIONS'
- Accessing another club's resources → 403 with code 'AUTH_RESOURCE_FORBIDDEN'
- Non-admin attempting role change → 403 with code 'AUTH_ADMIN_REQUIRED'

**Validation Errors**:
- Missing required fields → 400 with code 'VALIDATION_REQUIRED_FIELD'
- Invalid email format → 400 with code 'VALIDATION_INVALID_EMAIL'
- Club leader without clubId → 400 with code 'VALIDATION_CLUB_REQUIRED'

**Resource Errors**:
- Club not found → 404 with code 'RESOURCE_CLUB_NOT_FOUND'
- User not found → 404 with code 'RESOURCE_USER_NOT_FOUND'
- Event not found → 404 with code 'RESOURCE_EVENT_NOT_FOUND'

**Conflict Errors**:
- Duplicate membership request → 409 with code 'CONFLICT_MEMBERSHIP_EXISTS'
- Email already registered → 409 with code 'CONFLICT_EMAIL_EXISTS'

### Error Handling Middleware

```typescript
// Global error handler
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Log error for monitoring
  logger.error(err);
  
  // Determine status code and error response
  if (err instanceof AuthenticationError) {
    return res.status(401).json({
      error: {
        code: err.code,
        message: err.message
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
  
  if (err instanceof AuthorizationError) {
    return res.status(403).json({
      error: {
        code: err.code,
        message: err.message
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
  
  // Default to 500 for unexpected errors
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    },
    timestamp: new Date().toISOString(),
    path: req.path
  });
}
```

### Frontend Error Handling

**API Error Handling**:
- Display user-friendly error messages based on error codes
- Redirect to login on 401 errors
- Show "Access Denied" page on 403 errors
- Provide retry mechanisms for 500 errors

**Token Refresh Flow**:
- Automatically attempt token refresh on 401 errors
- Redirect to login if refresh fails
- Queue failed requests and retry after refresh

**Error Boundaries**:
- Implement React error boundaries to catch rendering errors
- Display fallback UI instead of crashing the application
- Log errors for debugging

## Testing Strategy

### Dual Testing Approach

The RBAC system requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
- Specific role permission scenarios
- Error response formats
- Edge cases (empty data, null values)
- Integration between components

**Property-Based Tests**: Verify universal properties across all inputs
- Role-based authorization rules
- Token generation and validation
- Data scoping and ownership
- Comprehensive input coverage through randomization

Both testing approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing Configuration

**Library Selection**: 
- Backend: Use `fast-check` for Node.js/TypeScript property-based testing
- Frontend: Use `fast-check` for React component property testing

**Test Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `// Feature: rbac-system, Property {number}: {property_text}`

**Example Property Test Structure**:

```typescript
import fc from 'fast-check';

describe('RBAC System - Authentication Properties', () => {
  // Feature: rbac-system, Property 1: JWT contains role information
  it('should include role in JWT payload for any user', () => {
    fc.assert(
      fc.property(
        fc.record({
          userId: fc.uuid(),
          email: fc.emailAddress(),
          role: fc.constantFrom('ADMIN', 'CLUB_LEADER', 'MEMBER'),
          clubId: fc.option(fc.uuid())
        }),
        (user) => {
          const token = jwtService.generateAccessToken(
            user.userId,
            user.email,
            user.role,
            user.clubId
          );
          const decoded = jwtService.verifyAccessToken(token);
          
          expect(decoded).not.toBeNull();
          expect(decoded!.role).toBe(user.role);
          if (user.clubId) {
            expect(decoded!.clubId).toBe(user.clubId);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Organization

**Backend Tests**:
```
backend/
├── tests/
│   ├── unit/
│   │   ├── middleware/
│   │   │   ├── auth.test.ts
│   │   │   ├── role.test.ts
│   │   │   └── ownership.test.ts
│   │   ├── services/
│   │   │   ├── user.service.test.ts
│   │   │   ├── club.service.test.ts
│   │   │   ├── membership.service.test.ts
│   │   │   ├── event.service.test.ts
│   │   │   └── announcement.service.test.ts
│   │   └── utils/
│   │       └── jwt.test.ts
│   └── properties/
│       ├── auth.properties.test.ts
│       ├── admin-permissions.properties.test.ts
│       ├── club-leader-permissions.properties.test.ts
│       ├── member-permissions.properties.test.ts
│       ├── api-authorization.properties.test.ts
│       └── role-management.properties.test.ts
```

**Frontend Tests**:
```
frontend/
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   │   ├── RoleGuard.test.tsx
│   │   │   └── Navigation.test.tsx
│   │   └── hooks/
│   │       └── useAuth.test.ts
│   └── properties/
│       ├── route-guards.properties.test.ts
│       └── ui-rendering.properties.test.ts
```

### Test Coverage Goals

**Backend**:
- Middleware: 100% coverage (critical security component)
- Services: 90%+ coverage
- Routes: 90%+ coverage
- All 63 correctness properties implemented as property tests

**Frontend**:
- Route guards: 100% coverage
- Role-based components: 90%+ coverage
- UI rendering properties implemented as property tests

### Integration Testing

**API Integration Tests**:
- Test complete request/response flows
- Verify middleware chain execution
- Test database interactions
- Verify error handling end-to-end

**E2E Testing** (Optional):
- Test complete user workflows (login → browse clubs → join → RSVP)
- Verify role-specific UI rendering
- Test cross-browser compatibility

### Test Data Generation

**Property Test Generators**:

```typescript
// User generators
const userGen = fc.record({
  id: fc.uuid(),
  email: fc.emailAddress(),
  role: fc.constantFrom('ADMIN', 'CLUB_LEADER', 'MEMBER'),
  clubId: fc.option(fc.uuid())
});

// Club generators
const clubGen = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 3, maxLength: 50 }),
  description: fc.string({ maxLength: 500 }),
  active: fc.boolean()
});

// Event generators
const eventGen = fc.record({
  id: fc.uuid(),
  clubId: fc.uuid(),
  title: fc.string({ minLength: 3, maxLength: 100 }),
  description: fc.string({ maxLength: 1000 }),
  startTime: fc.date(),
  endTime: fc.date(),
  location: fc.string({ maxLength: 200 })
});

// JWT generators
const jwtPayloadGen = fc.record({
  userId: fc.uuid(),
  email: fc.emailAddress(),
  role: fc.constantFrom('ADMIN', 'CLUB_LEADER', 'MEMBER'),
  clubId: fc.option(fc.uuid()),
  iat: fc.integer({ min: 0 }),
  exp: fc.integer({ min: 0 })
});
```

### Continuous Integration

**CI Pipeline**:
1. Run linting and type checking
2. Run unit tests
3. Run property-based tests (100 iterations each)
4. Generate coverage reports
5. Fail build if coverage below thresholds
6. Run integration tests
7. Deploy to staging if all tests pass

**Test Performance**:
- Unit tests should complete in < 30 seconds
- Property tests should complete in < 2 minutes
- Integration tests should complete in < 5 minutes
- Total CI pipeline should complete in < 10 minutes

### Security Testing

**Security-Specific Tests**:
- Test JWT tampering detection
- Test expired token rejection
- Test role escalation prevention
- Test SQL injection prevention (via Prisma)
- Test XSS prevention in UI
- Test CSRF protection

**Penetration Testing Scenarios**:
- Attempt to access admin endpoints as member
- Attempt to modify another club's data as club leader
- Attempt to use expired or invalid tokens
- Attempt to bypass role checks
- Attempt to inject malicious data

## Implementation Notes

### Migration Strategy

1. **Phase 1: Backend Foundation**
   - Implement middleware (auth, role, ownership)
   - Update JWT service with role information
   - Add database schema changes
   - Implement core services

2. **Phase 2: API Endpoints**
   - Protect existing endpoints with middleware
   - Implement new role-specific endpoints
   - Add error handling

3. **Phase 3: Frontend Integration**
   - Implement route guards
   - Create role-specific dashboards
   - Add role-based UI components
   - Update navigation

4. **Phase 4: Testing & Refinement**
   - Write property-based tests
   - Write unit tests
   - Perform security testing
   - Fix identified issues

### Performance Considerations

**Caching**:
- Cache user role information in JWT (avoid database lookups)
- Cache club membership status for frequent checks
- Implement Redis for session management if needed

**Database Optimization**:
- Add indexes on frequently queried fields (userId, clubId, role)
- Use database-level constraints for data integrity
- Optimize queries with proper joins and select statements

**Middleware Optimization**:
- Order middleware efficiently (auth → role → ownership)
- Fail fast on authorization errors
- Avoid redundant database queries

### Security Best Practices

- Never trust client-side role checks (always verify on backend)
- Use parameterized queries (Prisma handles this)
- Implement rate limiting on authentication endpoints
- Log all authorization failures for monitoring
- Use HTTPS in production
- Implement CORS properly
- Sanitize all user inputs
- Use httpOnly cookies for refresh tokens
- Implement token rotation on refresh

### Extensibility

The design supports future enhancements:
- Adding new roles (e.g., 'MODERATOR', 'SUPER_ADMIN')
- Implementing fine-grained permissions (permission-based vs role-based)
- Adding role hierarchies
- Implementing temporary role assignments
- Adding multi-club leadership support
- Implementing role-based feature flags
