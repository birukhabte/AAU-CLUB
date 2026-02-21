# AAU Club Management System - Vercel Deployment Guide

## Prerequisites
- MongoDB Atlas account with a cluster created
- Vercel account
- Git repository (GitHub, GitLab, or Bitbucket)

## Part 1: Backend Deployment (API)

### Step 1: Prepare MongoDB Atlas

1. **Database Connection String**
   - Your connection string: `mongodb+srv://habtebiruk13_db_user:@bura123@cluster0.i0zy09s.mongodb.net/aau-club-management?retryWrites=true&w=majority`
   - Make sure to:
     - Add your IP address to the IP Whitelist (or use 0.0.0.0/0 for all IPs)
     - Verify the database user has read/write permissions

2. **Network Access**
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0) for Vercel deployment

### Step 2: Update Backend for MongoDB

The Prisma schema has been updated to use MongoDB. Now run these commands in the `backend` folder:

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Generate Prisma Client for MongoDB
npx prisma generate

# Push schema to MongoDB Atlas
npx prisma db push
```

### Step 3: Deploy Backend to Vercel

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment with MongoDB"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - Select the `backend` folder as the root directory
   - Configure environment variables:

   **Environment Variables to Add:**
   ```
   DATABASE_URL=mongodb+srv://habtebiruk13_db_user:@bura123@cluster0.i0zy09s.mongodb.net/aau-club-management?retryWrites=true&w=majority
   JWT_SECRET=aau-club-jwt-secret-key-2026
   JWT_REFRESH_SECRET=aau-club-refresh-secret-key-2026
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   FRONTEND_URL=https://your-frontend-app.vercel.app
   NODE_ENV=production
   ```

3. **Build Settings**
   - Framework Preset: Other
   - Build Command: `npm run vercel-build`
   - Output Directory: (leave empty)
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your backend API URL (e.g., `https://your-backend-app.vercel.app`)

### Step 4: Seed the Database (Optional)

After deployment, you can seed the database by running the seed script locally:

```bash
# Make sure DATABASE_URL points to MongoDB Atlas
npx prisma db push
node src/utils/seed.js
```

Or create a seed endpoint in your API and call it once after deployment.

## Part 2: Frontend Deployment

### Step 1: Update Frontend Environment Variables

1. Create/Update `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-app.vercel.app/api
   ```

2. Create `frontend/.env.production`:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-app.vercel.app/api
   ```

### Step 2: Deploy Frontend to Vercel

1. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - Select the `frontend` folder as the root directory

2. **Configure Environment Variables:**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-app.vercel.app/api
   ```

3. **Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Copy your frontend URL

### Step 3: Update Backend CORS

Go back to your backend Vercel project:
1. Update the `FRONTEND_URL` environment variable with your actual frontend URL
2. Redeploy the backend

## Part 3: Post-Deployment

### Update Backend FRONTEND_URL
1. Go to Vercel Dashboard → Your Backend Project → Settings → Environment Variables
2. Update `FRONTEND_URL` to your actual frontend URL: `https://your-frontend-app.vercel.app`
3. Redeploy the backend

### Test Your Deployment
1. Visit your frontend URL
2. Try to register a new user
3. Try to login
4. Test club browsing and joining

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Make sure `FRONTEND_URL` in backend matches your frontend URL exactly
   - Check that CORS is properly configured in `backend/src/server.js`

2. **Database Connection Issues**
   - Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
   - Check that the connection string is correct
   - Ensure database user has proper permissions

3. **Prisma Client Issues**
   - Make sure `vercel-build` script runs `npx prisma generate`
   - Check that `@prisma/client` is in dependencies (not devDependencies)

4. **API Routes Not Working**
   - Verify `vercel.json` configuration
   - Check that all routes start with `/api`
   - Review Vercel function logs

### Viewing Logs
- Go to Vercel Dashboard → Your Project → Deployments
- Click on a deployment → View Function Logs
- Check for errors and debug accordingly

## Environment Variables Summary

### Backend (.env)
```
DATABASE_URL=mongodb+srv://habtebiruk13_db_user:@bura123@cluster0.i0zy09s.mongodb.net/aau-club-management?retryWrites=true&w=majority
JWT_SECRET=aau-club-jwt-secret-key-2026
JWT_REFRESH_SECRET=aau-club-refresh-secret-key-2026
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-app.vercel.app
NODE_ENV=production
```

### Frontend (.env.production)
```
NEXT_PUBLIC_API_URL=https://your-backend-app.vercel.app/api
```

## Security Recommendations

1. **Change JWT Secrets** - Use strong, random secrets in production
2. **Enable MongoDB Atlas Encryption** - Use encryption at rest
3. **Use Environment Variables** - Never commit secrets to Git
4. **Enable HTTPS** - Vercel provides this by default
5. **Rate Limiting** - Already configured in the backend
6. **Input Validation** - Already implemented with Zod

## Monitoring

- Use Vercel Analytics for frontend monitoring
- Use MongoDB Atlas monitoring for database performance
- Set up error tracking (e.g., Sentry) for production errors

## Backup Strategy

1. **MongoDB Atlas Backups**
   - Enable automatic backups in MongoDB Atlas
   - Configure backup retention policy

2. **Code Backups**
   - Keep your Git repository up to date
   - Tag releases for easy rollback

## Next Steps

1. Set up custom domain (optional)
2. Configure email service for notifications
3. Set up monitoring and alerts
4. Create admin user for production
5. Test all features thoroughly

## Support

If you encounter issues:
1. Check Vercel function logs
2. Check MongoDB Atlas logs
3. Review this guide
4. Check Vercel and Prisma documentation
