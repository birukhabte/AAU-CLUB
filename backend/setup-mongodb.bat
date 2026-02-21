@echo off
echo.
echo AAU Club Management - MongoDB Setup
echo ======================================
echo.

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create a .env file with your MongoDB Atlas connection string
    exit /b 1
)

echo Installing dependencies...
call npm install

echo.
echo Generating Prisma Client for MongoDB...
call npx prisma generate

echo.
echo Pushing schema to MongoDB Atlas...
call npx prisma db push

echo.
echo Seeding database with initial data...
call node src/utils/seed.js

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Test locally: npm run dev
echo 2. Deploy to Vercel following DEPLOYMENT_GUIDE.md
echo.
pause
