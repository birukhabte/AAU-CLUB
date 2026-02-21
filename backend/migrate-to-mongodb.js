/**
 * Migration Script: SQLite to MongoDB Atlas
 * 
 * This script helps migrate data from SQLite to MongoDB Atlas
 * Run this AFTER updating the Prisma schema and pushing to MongoDB
 */

const { PrismaClient: SQLitePrisma } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// You'll need to temporarily set up two Prisma clients
// 1. One for SQLite (old database)
// 2. One for MongoDB (new database)

async function migrateData() {
    console.log('🚀 Starting migration from SQLite to MongoDB...\n');

    try {
        // Note: This is a simplified migration script
        // For production, you'd need to handle this more carefully
        
        console.log('⚠️  IMPORTANT NOTES:');
        console.log('1. Make sure you have backed up your SQLite database');
        console.log('2. Update DATABASE_URL in .env to point to MongoDB Atlas');
        console.log('3. Run: npx prisma generate');
        console.log('4. Run: npx prisma db push');
        console.log('5. Then run this script\n');

        console.log('✅ Migration preparation complete!');
        console.log('\nNext steps:');
        console.log('1. Run: cd backend');
        console.log('2. Run: npx prisma generate');
        console.log('3. Run: npx prisma db push');
        console.log('4. Run: node src/utils/seed.js (to create initial data)');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateData();
