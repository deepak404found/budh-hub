# BudhHub LMS Starter (single app)

Single-package Next.js 16 App Router starter with Drizzle schemas, NextAuth email provider, Cloudflare R2 signed upload, seed script, and CI wiring.

## Stack
- Next.js 16 (App Router, TypeScript) in root `src/app`
- Drizzle ORM + Postgres schemas under `src/db`
- NextAuth (email)
- Cloudflare R2 signed uploads
- pnpm

## Getting Started
1) Install deps
```bash
pnpm install
```
2) Copy `.env.example` → `.env` and fill secrets (see below).
3) Run migrations (requires `DATABASE_URL`)
```bash
pnpm migrate:generate
pnpm migrate:push
```
4) Seed demo data
```bash
pnpm seed
```
5) Start dev server
```bash
pnpm dev
```

## Environment
Set these in `.env`:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`, SMTP fields (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`)
- `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
- Optional: Supabase, Upstash, HF/Google keys

## Commands
- `pnpm migrate:generate` / `pnpm migrate:push` — Drizzle migrations to `drizzle/`.
- `pnpm seed` — sample instructor, learner, course, module, lessons, enrollment.
- `pnpm dev` — run Next.js app.

## Security / Ops Notes
- Do NOT commit `.env` or secrets; configure locally/CI/Vercel secrets.
- Keep R2 keys server-side only.
- Store auth/Google tokens securely when added later.
- Keep DB access in server-only code paths.

## CI
`.github/workflows/ci.yml` installs deps and runs lint/typecheck/test placeholders; migrate job gated to `main` with `DATABASE_URL` secret.
