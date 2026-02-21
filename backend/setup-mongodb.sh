#!/bin/bash

# Setup script for MongoDB Atlas deployment

echo "🚀 AAU Club Management - MongoDB Setup"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your MongoDB Atlas connection string"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Generating Prisma Client for MongoDB..."
npx prisma generate

echo ""
echo "📤 Pushing schema to MongoDB Atlas..."
npx prisma db push

echo ""
echo "🌱 Seeding database with initial data..."
node src/utils/seed.js

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Test locally: npm run dev"
echo "2. Deploy to Vercel following DEPLOYMENT_GUIDE.md"
echo ""
