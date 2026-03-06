const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Quick fix: Adding clubId column to users table...\n');

db.serialize(() => {
  // Add clubId column
  db.run(`ALTER TABLE users ADD COLUMN clubId TEXT;`, (err) => {
    if (err) {
      if (err.message.includes('duplicate column')) {
        console.log('✓ clubId column already exists');
      } else {
        console.error('❌ Error adding clubId:', err.message);
      }
    } else {
      console.log('✅ Added clubId column to users table');
    }
  });

  // Create membership_requests table
  db.run(`
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
  `, (err) => {
    if (err) {
      console.error('❌ Error creating membership_requests:', err.message);
    } else {
      console.log('✅ Created membership_requests table');
    }
  });

  // Create refresh_tokens table
  db.run(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expiresAt DATETIME NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `, (err) => {
    if (err) {
      console.error('❌ Error creating refresh_tokens:', err.message);
    } else {
      console.log('✅ Created refresh_tokens table');
    }
  });

  // Create activity_logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `, (err) => {
    if (err) {
      console.error('❌ Error creating activity_logs:', err.message);
    } else {
      console.log('✅ Created activity_logs table');
    }
    
    // Close database after all operations
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('\n✅ Database migration completed!');
        console.log('\n📝 Next steps:');
        console.log('1. Restart your backend server');
        console.log('2. Try logging in again');
        console.log('\nIf you want to add test data, run: node prisma/seed-rbac.js');
      }
    });
  });
});
