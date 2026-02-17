# Student ID Registration Issue - Solution Guide

## Problem
When trying to register a new account, you receive the error:
```
Student ID "XXX" is already registered. Please use a different student ID or leave it blank.
```

## Why This Happens
The `studentId` field in the database has a **unique constraint**, meaning each student ID can only be used once across all users. This is by design to prevent duplicate student records.

## Solutions

### Option 1: Use a Different Student ID (Recommended)
If you're registering as a real student, use your actual unique student ID. Each student should have a different ID.

**Example:**
- User 1: `AAU/2024/001`
- User 2: `AAU/2024/002`
- User 3: `AAU/2024/003`

### Option 2: Leave Student ID Blank
The Student ID field is **optional**. You can register without providing a student ID.

1. Go to the registration page
2. Fill in all required fields (First Name, Last Name, Email, Password)
3. **Leave the "Student ID" field empty**
4. Click "Sign up"

### Option 3: Check Existing Users (Admin Only)
If you're an admin and need to see which student IDs are already taken:

1. Log in as an admin
2. Go to **Dashboard → Users & Roles**
3. Search for users to see their student IDs
4. Use a different student ID for new registrations

## For Testing/Development

If you're testing the application and need multiple accounts:

### Method 1: Use Different Student IDs
```
Test User 1: studentId = "TEST001"
Test User 2: studentId = "TEST002"
Test User 3: studentId = "TEST003"
```

### Method 2: Leave Student ID Empty
```
Test User 1: studentId = (empty)
Test User 2: studentId = (empty)
Test User 3: studentId = (empty)
```

### Method 3: Clear Database (Development Only)
If you're in development and want to start fresh:

```bash
# Navigate to backend directory
cd c:\Backend_Projects\AAU-Club\backend

# Reset the database (WARNING: This deletes all data!)
npx prisma migrate reset

# Or manually delete users from the database
```

## Technical Details

### Database Schema
```prisma
model User {
  id         String   @id @default(cuid())
  email      String   @unique
  studentId  String?  @unique  // Optional but must be unique if provided
  // ... other fields
}
```

### Validation Rules
- **Email**: Required, must be unique
- **Student ID**: Optional, but if provided must be unique
- **Password**: Required, minimum 8 characters with uppercase, lowercase, and numbers

## Error Message
The improved error message now shows:
```
Student ID "AAU/2024/001" is already registered. 
Please use a different student ID or leave it blank.
```

This makes it clear that:
1. The specific student ID is already in use
2. You can either use a different ID or leave it empty

## Need Help?
- Check the admin dashboard to see existing users
- Contact the system administrator if you believe there's an error
- For development, consider resetting the database
