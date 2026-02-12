# Frontend — Vercel deployment

Quick steps to deploy the Next.js frontend to Vercel:

- Set environment variables in your Vercel project settings (or in the dashboard for the production deployment):
  - `NEXT_PUBLIC_API_URL` — the base URL of the backend API (e.g. `https://your-backend.vercel.app/api`)
  - Any other `NEXT_PUBLIC_*` vars used by the app

- Vercel will automatically run `npm run build` (project `package.json` has a `build` script).

- If you need to run additional build steps before `next build`, add a `vercel-build` script to `package.json`.

Local commands:
```bash
cd frontend
npm install
npm run build
npm start # serves the production build locally
```

Notes:
- The frontend expects `NEXT_PUBLIC_API_URL` to point to the backend API.
- Keep any sensitive secrets (JWT secret, DB connection strings) in the backend; only expose public endpoints to the frontend.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
