-- Add clubId column to users table
ALTER TABLE users ADD COLUMN clubId TEXT;

-- Create membership_requests table
CREATE TABLE IF NOT EXISTS membership_requests (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    clubId TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (clubId) REFERENCES clubs(id) ON DELETE CASCADE,
    UNIQUE(userId, clubId)
);

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Update memberships table to change default status
-- Note: SQLite doesn't support ALTER COLUMN, so we need to recreate the table
CREATE TABLE memberships_new (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    clubId TEXT NOT NULL,
    status TEXT DEFAULT 'APPROVED' NOT NULL,
    joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (clubId) REFERENCES clubs(id) ON DELETE CASCADE,
    UNIQUE(userId, clubId)
);

-- Copy data from old table
INSERT INTO memberships_new (id, userId, clubId, status, joinedAt, createdAt, updatedAt)
SELECT id, userId, clubId, 
    CASE WHEN status = 'PENDING' THEN 'APPROVED' ELSE status END,
    COALESCE(joinedAt, createdAt),
    createdAt, 
    updatedAt
FROM memberships;

-- Drop old table and rename new one
DROP TABLE memberships;
ALTER TABLE memberships_new RENAME TO memberships;

-- Remove refreshToken column from users table (if exists)
-- Note: SQLite doesn't support DROP COLUMN directly, so we recreate the table
CREATE TABLE users_new (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    studentId TEXT UNIQUE,
    phone TEXT,
    avatar TEXT,
    bio TEXT,
    role TEXT DEFAULT 'MEMBER' NOT NULL,
    clubId TEXT,
    isActive INTEGER DEFAULT 1 NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Copy data from old users table
INSERT INTO users_new (id, email, password, firstName, lastName, studentId, phone, avatar, bio, role, isActive, createdAt, updatedAt)
SELECT id, email, password, firstName, lastName, studentId, phone, avatar, bio, role, isActive, createdAt, updatedAt
FROM users;

-- Drop old table and rename new one
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;
