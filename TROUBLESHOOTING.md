# 🔧 Troubleshooting Guide

Common issues and their solutions when deploying to Vercel with MongoDB Atlas.

## 🗄️ Database Issues

### Error: "Can't reach database server"

**Symptoms**: Backend can't connect to MongoDB Atlas

**Solutions**:
1. Check MongoDB Atlas Network Access:
   - Go to MongoDB Atlas → Network Access
   - Ensure 0.0.0.0/0 is in the IP Access List
   - Click "Add IP Address" → "Allow Access from Anywhere"

2. Verify connection string:
   ```
   mongodb+srv://habtebiruk13_db_user:@bura123@cluster0.i0zy09s.mongodb.net/aau-club-management?retryWrites=true&w=majority
   ```
   - Check username and password are correct
   - Ensure special characters in password are URL-encoded
   - Verify database name is included

3. Check database user permissions:
   - Go to MongoDB Atlas → Database Access
   - Ensure user has "Read and write to any database" role

### Error: "Authentication failed"

**Solutions**:
1. Verify database user credentials in MongoDB Atlas
2. Check if password contains special characters (needs URL encoding)
3. Recreate database user if needed

### Error: "Prisma Client not initialized"

**Solutions**:
1. Ensure `vercel-build` script runs in package.json:
   ```json
   "vercel-build": "npx prisma generate"
   ```

2. Check `@prisma/client` is in dependencies (not devDependencies):
   ```bash
   npm install @prisma/client --save
   ```

3. Redeploy after making changes

## 🌐 CORS Issues

### Error: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Symptoms**: Frontend can't communicate with backend

**Solutions**:
1. Check `FRONTEND_URL` environment variable in backend:
   - Go to Vercel → Backend Project → Settings → Environment Variables
   - Ensure `FRONTEND_URL` matches your frontend URL exactly
   - Example: `https://your-frontend.vercel.app` (no trailing slash)

2. Verify CORS configuration in `backend/src/server.js`:
   ```javascript
   app.use(cors({
       origin: process.env.FRONTEND_URL || 'http://localhost:3000',
       credentials: true,
   }));
   ```

3. Redeploy backend after updating environment variables

### Error: "Credentials flag is true, but Access-Control-Allow-Credentials is not"

**Solution**: Ensure `credentials: true` is set in CORS config (already configured)

## 🔐 Authentication Issues

### Error: "Invalid token" or "Token expired"

**Solutions**:
1. Check JWT secrets are set in backend environment variables:
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`

2. Clear browser localStorage and cookies:
   ```javascript
   localStorage.clear();
   ```

3. Try logging in again

### Error: "User not found" after login

**Solutions**:
1. Ensure database is seeded:
   ```bash
   cd backend
   node src/utils/seed.js
   ```

2. Check if user exists in MongoDB Atlas:
   - Go to MongoDB Atlas → Browse Collections
   - Check `users` collection

## 🚀 Deployment Issues

### Error: "Build failed" on Vercel

**Solutions**:
1. Check build logs in Vercel dashboard
2. Ensure all dependencies are installed:
   ```bash
   npm install
   ```

3. Test build locally:
   ```bash
   # Backend
   cd backend
   npm run vercel-build

   # Frontend
   cd frontend
   npm run build
   ```

4. Check for TypeScript errors:
   ```bash
   npm run build
   ```

### Error: "Function execution timed out"

**Solutions**:
1. Optimize database queries
2. Add indexes to frequently queried fields
3. Check MongoDB Atlas performance metrics
4. Consider upgrading Vercel plan for longer timeout

### Error: "Module not found"

**Solutions**:
1. Ensure all imports use correct paths
2. Check package.json has all required dependencies
3. Run `npm install` and redeploy

## 📡 API Route Issues

### Error: "404 Not Found" on API routes

**Solutions**:
1. Check `vercel.json` configuration:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "src/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "src/server.js"
       }
     ]
   }
   ```

2. Ensure API routes start with `/api`:
   - ✅ Correct: `https://backend.vercel.app/api/auth/login`
   - ❌ Wrong: `https://backend.vercel.app/auth/login`

3. Check route definitions in backend

### Error: "Cannot GET /api/..."

**Solutions**:
1. Verify route exists in backend
2. Check HTTP method (GET, POST, PUT, DELETE)
3. Review Vercel function logs

## 🎨 Frontend Issues

### Error: "API URL not defined"

**Solutions**:
1. Check `NEXT_PUBLIC_API_URL` in frontend environment variables
2. Ensure it's set in Vercel dashboard
3. Redeploy frontend after adding

### Error: "Hydration failed"

**Solutions**:
1. Check for mismatched HTML between server and client
2. Ensure `"use client"` directive is used for client components
3. Check for browser-only APIs used during SSR

### Error: "Module not found: Can't resolve '@/...'"

**Solutions**:
1. Check `tsconfig.json` has correct path mappings:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

2. Restart development server

## 🔍 Debugging Tips

### View Vercel Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click on "Deployments"
4. Click on a deployment
5. View "Function Logs" or "Build Logs"

### View MongoDB Atlas Logs

1. Go to MongoDB Atlas Dashboard
2. Select your cluster
3. Click "Metrics" or "Real-time Performance Panel"
4. Check for slow queries or connection issues

### Test API Endpoints

Use curl or Postman to test endpoints:

```bash
# Test health endpoint
curl https://your-backend.vercel.app/api/health

# Test login
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aau.edu.et","password":"Admin@123"}'
```

### Check Environment Variables

In Vercel dashboard:
1. Go to Settings → Environment Variables
2. Verify all required variables are set
3. Check for typos or extra spaces

### Local Testing

Always test locally before deploying:

```bash
# Backend
cd backend
npm run dev

# Frontend (in new terminal)
cd frontend
npm run dev
```

## 🆘 Still Having Issues?

### Checklist

- [ ] MongoDB Atlas IP whitelist includes 0.0.0.0/0
- [ ] Database user has correct permissions
- [ ] Connection string is correct
- [ ] All environment variables are set
- [ ] FRONTEND_URL matches frontend URL exactly
- [ ] Backend is deployed and running
- [ ] Frontend is deployed and running
- [ ] CORS is configured correctly
- [ ] Database is seeded with initial data

### Get Help

1. **Check Documentation**:
   - Vercel: https://vercel.com/docs
   - Prisma: https://www.prisma.io/docs
   - MongoDB Atlas: https://docs.atlas.mongodb.com
   - Next.js: https://nextjs.org/docs

2. **Review Logs**:
   - Vercel function logs
   - MongoDB Atlas logs
   - Browser console logs
   - Network tab in browser DevTools

3. **Common Solutions**:
   - Clear cache and cookies
   - Redeploy after changes
   - Check for typos in environment variables
   - Verify all services are running

## 📞 Support Resources

- Vercel Support: https://vercel.com/support
- Prisma Discord: https://pris.ly/discord
- MongoDB Community: https://www.mongodb.com/community/forums
- Stack Overflow: Tag questions with `vercel`, `prisma`, `mongodb`

## ✅ Prevention Tips

1. **Test Locally First**: Always test changes locally before deploying
2. **Use Environment Variables**: Never hardcode secrets
3. **Monitor Logs**: Regularly check Vercel and MongoDB logs
4. **Keep Dependencies Updated**: Run `npm update` regularly
5. **Backup Database**: Enable automatic backups in MongoDB Atlas
6. **Use Git Branches**: Test in preview deployments before production
7. **Document Changes**: Keep track of configuration changes

---

If you encounter an issue not listed here, check the deployment logs and error messages carefully. Most issues can be resolved by checking environment variables and connection settings.
