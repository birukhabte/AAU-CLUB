const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting RBAC schema migration...');

  try {
    // Add clubId column to users table
    await prisma.$executeRawUnsafe(`
      ALTER TABLE users ADD COLUMN clubId TEXT;
    `).catch(() => console.log('clubId column already exists or error adding it'));

    // Create membership_requests table
    await prisma.$executeRawUnsafe(`
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
    `);
    console.log('✓ Created membership_requests table');

    // Create refresh_tokens table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expiresAt DATETIME NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ Created refresh_tokens table');

    // Create activity_logs table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ Created activity_logs table');

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Run: node prisma/seed-rbac.js (to seed test data)');
    console.log('2. Restart your backend server');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
