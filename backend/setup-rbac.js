const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up RBAC System...\n');

// Step 1: Run migration
console.log('Step 1: Running database migration...');
try {
  execSync('node prisma/migrate-rbac.js', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Migration completed\n');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

// Step 2: Generate Prisma Client
console.log('Step 2: Generating Prisma Client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Prisma Client generated\n');
} catch (error) {
  console.error('⚠️  Prisma generate had issues, but continuing...\n');
}

// Step 3: Seed database
console.log('Step 3: Seeding database with test data...');
try {
  execSync('node prisma/seed-rbac.js', { stdio: 'inherit', cwd: __dirname });
  console.log('✅ Database seeded\n');
} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
}

console.log('🎉 RBAC System setup completed successfully!\n');
console.log('Test accounts created:');
console.log('  Admin: admin@aau.edu.et / admin123');
console.log('  Club Leader 1: leader1@aau.edu.et / leader123');
console.log('  Club Leader 2: leader2@aau.edu.et / leader123');
console.log('  Members: member1@aau.edu.et to member5@aau.edu.et / member123\n');
console.log('You can now restart your backend server!');
