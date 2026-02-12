# AAU-Club backend — Vercel deployment notes

Quick steps to deploy the backend on Vercel:

- Ensure production environment variables are set in the Vercel project settings:
  - `DATABASE_URL` (Prisma)
  - `JWT_SECRET`
  - `FRONTEND_URL`
  - any email/SMTP vars used by `nodemailer`
  - `NODE_ENV=production`

- Build settings: `package.json` contains a `vercel-build` script that runs `npx prisma generate`.

- The project uses an API function entry at `/api/index.js` which adapts the Express app via `serverless-http`.

Prisma and serverless notes:
- Prisma opens DB connections per run; for serverless platforms consider:
  - using Prisma Data Proxy, or
  - connection pooling (PgBouncer) for PostgreSQL

Local test commands (from `backend`):
```bash
npm run prisma:generate
npm start
```

If you want, add any additional environment variables used in `backend/.env` into Vercel.
