# Quick Deployment Reference

## 🚀 Quick Start (5 Steps)

### 1️⃣ Setup MongoDB Atlas
```
✅ Connection String: mongodb+srv://habtebiruk13_db_user:@bura123@cluster0.i0zy09s.mongodb.net/aau-club-management?retryWrites=true&w=majority
✅ Network Access: Allow 0.0.0.0/0 (all IPs)
✅ Database User: Read/Write permissions
```

### 2️⃣ Prepare Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node src/utils/seed.js
```

### 3️⃣ Deploy Backend to Vercel
```
1. Go to vercel.com
2. Import your repository
3. Root Directory: backend
4. Add Environment Variables (see below)
5. Deploy
```

**Backend Environment Variables:**
```
DATABASE_URL=mongodb+srv://habtebiruk13_db_user:@bura123@cluster0.i0zy09s.mongodb.net/aau-club-management?retryWrites=true&w=majority
JWT_SECRET=aau-club-jwt-secret-key-2026
JWT_REFRESH_SECRET=aau-club-refresh-secret-key-2026
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

### 4️⃣ Deploy Frontend to Vercel
```
1. Go to vercel.com
2. Import your repository (or add new project)
3. Root Directory: frontend
4. Add Environment Variables (see below)
5. Deploy
```

**Frontend Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app/api
```

### 5️⃣ Update CORS
```
1. Go to Backend Vercel Project
2. Settings → Environment Variables
3. Update FRONTEND_URL with actual frontend URL
4. Redeploy
```

## 📝 Checklist

### Before Deployment
- [ ] MongoDB Atlas cluster created
- [ ] Network access configured (0.0.0.0/0)
- [ ] Database user created with permissions
- [ ] Connection string tested
- [ ] Code pushed to Git repository

### Backend Deployment
- [ ] Backend deployed to Vercel
- [ ] Environment variables configured
- [ ] Database schema pushed
- [ ] Database seeded
- [ ] API endpoint tested

### Frontend Deployment
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] API URL updated
- [ ] CORS configured on backend
- [ ] Frontend tested

### Post-Deployment
- [ ] Test user registration
- [ ] Test user login
- [ ] Test club browsing
- [ ] Test club joining
- [ ] Test leader dashboard
- [ ] Test admin dashboard

## 🔗 Important URLs

After deployment, save these URLs:

```
Backend API: https://your-backend.vercel.app
Frontend App: https://your-frontend.vercel.app
MongoDB Atlas: https://cloud.mongodb.com
```

## 🆘 Quick Troubleshooting

### CORS Error
- Check FRONTEND_URL in backend environment variables
- Redeploy backend after updating

### Database Connection Error
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Ensure database user has permissions

### API Not Found (404)
- Check vercel.json configuration
- Verify routes start with /api
- Check Vercel function logs

### Prisma Client Error
- Run `npx prisma generate` in backend
- Check @prisma/client is in dependencies
- Redeploy after generating client

## 📞 Support Resources

- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Next.js Docs: https://nextjs.org/docs

## 🎯 Test Credentials (After Seeding)

```
Admin:
Email: admin@aau.edu.et
Password: Admin@123

Club Leader:
Email: admin6@aau.edu.et
Password: Leader@123

Member:
Email: member@aau.edu.et
Password: Member@123
```

---

For detailed instructions, see DEPLOYMENT_GUIDE.md
