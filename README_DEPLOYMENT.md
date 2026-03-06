# 🚀 AAU Club Management System - Deployment

Complete guide for deploying your application to Vercel with MongoDB Atlas.

## 📚 Documentation Overview

This project includes comprehensive deployment documentation:

| File | Purpose |
|------|---------|
| **DEPLOYMENT_SUMMARY.md** | ⭐ Start here - Overview and quick checklist |
| **QUICK_DEPLOY.md** | 🎯 Quick reference for deployment steps |
| **DEPLOYMENT_GUIDE.md** | 📖 Detailed step-by-step deployment guide |
| **TROUBLESHOOTING.md** | 🔧 Solutions to common deployment issues |

## 🎯 Quick Start

### Prerequisites
- ✅ MongoDB Atlas account (free tier works)
- ✅ Vercel account (free tier works)
- ✅ Git repository (GitHub, GitLab, or Bitbucket)
- ✅ Node.js installed locally

### Your MongoDB Connection String
```
mongodb+srv://habtebiruk13_db_user:@bura123@cluster0.i0zy09s.mongodb.net/aau-club-management?retryWrites=true&w=majority
```

## 🏃 Deploy in 3 Steps

### 1️⃣ Setup Database (5 minutes)

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
node src/utils/seed.js
```

### 2️⃣ Deploy Backend (10 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. Set root directory to `backend`
4. Add environment variables (see QUICK_DEPLOY.md)
5. Deploy

### 3️⃣ Deploy Frontend (5 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. Set root directory to `frontend`
4. Add `NEXT_PUBLIC_API_URL` environment variable
5. Deploy

## 📋 What's Included

### Backend
- ✅ Express.js API server
- ✅ Prisma ORM with MongoDB
- ✅ JWT authentication
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting
- ✅ Input validation
- ✅ Error handling

### Frontend
- ✅ Next.js 14 with App Router
- ✅ TypeScript
- ✅ Tailwind CSS
- ✅ Responsive design
- ✅ Authentication flow
- ✅ Role-based dashboards

### Database
- ✅ MongoDB Atlas (cloud database)
- ✅ Prisma schema configured
- ✅ Seed data included
- ✅ Indexes optimized

## 🔑 Default Credentials

After seeding the database:

```
Admin:
Email: admin@aau.edu.et
Password: Admin@123

Club Leader (Tech Club):
Email: admin6@aau.edu.et  
Password: Leader@123

Member:
Email: member@aau.edu.et
Password: Member@123
```

## 🌟 Features

### For Students (Members)
- Browse and join clubs
- View club events
- Receive notifications
- Manage profile

### For Club Leaders
- Manage club information
- Approve/reject membership requests
- Create events and announcements
- View member statistics

### For Admins
- Manage all clubs
- Manage users and roles
- View system analytics
- Assign club leaders

## 🛠️ Technology Stack

### Backend
- Node.js + Express.js
- Prisma ORM
- MongoDB Atlas
- JWT Authentication
- Zod Validation

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Axios
- React Hooks

### Deployment
- Vercel (Frontend + Backend)
- MongoDB Atlas (Database)

## 📊 Project Structure

```
aau-club-management/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   ├── vercel.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   ├── .env.production
│   └── package.json
└── Documentation files
```

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Refresh token rotation
- ✅ Rate limiting
- ✅ Input validation
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Role-based access control

## 📈 Performance

- ✅ Serverless functions (auto-scaling)
- ✅ Edge network (Vercel CDN)
- ✅ Database indexes
- ✅ Optimized queries
- ✅ Image optimization (Next.js)

## 🧪 Testing Your Deployment

After deployment, test these workflows:

1. **User Registration**
   - Create a new account
   - Verify email validation

2. **User Login**
   - Login with test credentials
   - Check token storage

3. **Browse Clubs**
   - View all clubs
   - Search and filter

4. **Join Club**
   - Request membership
   - Check pending status

5. **Leader Dashboard**
   - Login as leader
   - Approve membership requests
   - View statistics

6. **Admin Dashboard**
   - Login as admin
   - Manage clubs and users
   - View analytics

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| CORS Error | Update FRONTEND_URL in backend |
| Database Connection | Check MongoDB Atlas IP whitelist |
| 404 on API | Verify vercel.json configuration |
| Prisma Client Error | Run `npx prisma generate` |

See **TROUBLESHOOTING.md** for detailed solutions.

## 📞 Support

Need help? Check these resources:

1. **DEPLOYMENT_SUMMARY.md** - Overview and checklist
2. **QUICK_DEPLOY.md** - Quick reference
3. **DEPLOYMENT_GUIDE.md** - Detailed guide
4. **TROUBLESHOOTING.md** - Common issues

## 🎓 Learning Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)

## 📝 License

This project is for educational purposes.

## 👥 Contributors

AAU Club Management System Development Team

---

**Ready to deploy?** Start with **DEPLOYMENT_SUMMARY.md** 🚀
