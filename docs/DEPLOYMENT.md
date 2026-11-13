# WebStart — Deployment Guide (`docs/DEPLOYMENT.md`)

**Target Hosting Platform:** Vercel (Free / Hobby Tier compatible)  
**Database:** Neon Serverless PostgreSQL  
**Authentication:** Clerk  
**File Storage:** Cloudinary  
**Email Delivery:** Resend (Optional)  

---

## 1. Serverless & Free-Tier Design Constraints

WebStart is architected specifically to operate reliably within Vercel's Free Tier:
- **Stateless Execution**: No in-memory session state or background daemons.
- **Pooled Database Connections**: Uses `@neondatabase/serverless` over Neon's PgBouncer pooled connection string (`DATABASE_URL`).
- **Cloud Object Storage**: Uploaded client files are stored via the `StorageProvider` adapter (Cloudinary in production) and never rely on ephemeral serverless disk storage.
- **Lightweight PDF Generation**: Uses pure Node/TypeScript PDF synthesis rather than headless Chromium, staying well under Vercel's 250 MB serverless function bundle limit.

---

## 2. Provider Limits & Upgrade Thresholds

| Service | Free Tier Limit | Upgrade Trigger |
| :--- | :--- | :--- |
| **Vercel Hobby** | 100 GB bandwidth, 10s–60s function timeout | High concurrent PDF generations or commercial team seats |
| **Neon Free Tier** | 0.5 GB storage, 190 compute hours/month | Large multi-workspace audit logs or >10,000 projects |
| **Clerk Free Tier** | 10,000 Monthly Active Users (MAUs) | Agency client volume exceeding 10k active accounts |
| **Cloudinary Free** | 25 monthly credits (~25 GB storage/bandwidth) | High-resolution video/photo uploads across many projects |
| **Resend Free Tier** | 3,000 emails/month (100/day) | High-volume automated reminder campaigns |

---

## 3. Step-by-Step Production Deployment

1. **Provision Neon PostgreSQL**:
   - Create a project in Neon.
   - Set `DATABASE_URL` (pooled) and `DIRECT_DATABASE_URL` (direct) in Vercel Environment Variables.
2. **Configure Clerk**:
   - Create a production Clerk instance.
   - Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to Vercel.
3. **Configure Cloudinary**:
   - Add `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` to Vercel.
4. **Configure Resend (Optional)**:
   - Verify your sending domain in Resend and set `RESEND_API_KEY` and `EMAIL_FROM`.
5. **Run Database Migrations & Seed**:
   ```bash
   bun run db:migrate
   bun run db:seed
   ```
6. **Deploy on Vercel**:
   - Install Command: `bun install`
   - Build Command: `bun run build`
   - Verify `/api/health` returns `200 OK`.
