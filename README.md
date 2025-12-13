# 🎓 BudhHub LMS

> **A modern, scalable Learning Management System built with cutting-edge technologies**

Welcome to BudhHub! This is a full-featured LMS platform that enables instructors to create engaging courses and learners to track their progress. Built with Next.js 16, TypeScript, and a modern tech stack.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?style=flat-square&logo=postgresql)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-orange?style=flat-square)

---

## 🚀 Quick Start

### Prerequisites

Before you begin, make sure you have:

- **Node.js** 18+ installed
- **pnpm** package manager (recommended) or npm/yarn
- **PostgreSQL** database (NeonDB, Supabase, or local)
- **Cloudflare R2** account (for file storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd budhhub
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Then fill in your `.env` file with the required values (see [Environment Setup](#-environment-setup) below).

4. **Run database migrations**
   ```bash
   pnpm migrate:generate
   pnpm migrate:push
   ```

5. **Seed the database** (optional, for demo data)
   ```bash
   pnpm seed
   ```

6. **Start the development server**
   ```bash
   pnpm dev
   ```

7. **Open your browser**
   ```
   http://localhost:3000
   ```

8. **Sign in with test credentials**
   - See [Test Credentials](./docs/TEST_CREDENTIALS.md) for login information
   - Or create a new account via the onboarding flow

That's it! 🎉 You should now see the BudhHub homepage.

---

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build production-ready application |
| `pnpm start` | Start production server (after build) |
| `pnpm lint` | Run ESLint to check code quality |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm migrate:generate` | Generate new database migrations |
| `pnpm migrate:push` | Apply migrations to database |
| `pnpm seed` | Populate database with sample data |

---

## 🔧 Environment Setup

Create a `.env` file in the root directory with the following variables:

### Required Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (for NextAuth magic links)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=your_email@gmail.com

# Cloudflare R2 (for file storage)
R2_ACCOUNT_ID=your_account_id
R2_BUCKET_NAME=your_bucket_name
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_PUBLIC_URL=https://your-custom-domain.com  # Optional
```

### Optional Variables

```env
# Redis (for caching - optional)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# File Upload Limits (defaults provided)
MAX_VIDEO_SIZE_MB=10
MAX_MATERIAL_SIZE_MB=15
```

> 💡 **Tip**: Generate `NEXTAUTH_SECRET` using: `openssl rand -base64 32`

---

## 🛠️ Third-Party Services Setup

### 1. Database (PostgreSQL)

**Option A: NeonDB (Recommended - Free Tier)**
- Sign up at [neon.tech](https://neon.tech)
- Create a new project
- Copy the connection string to `DATABASE_URL`

**Option B: Supabase**
- Sign up at [supabase.com](https://supabase.com)
- Create a new project
- Get the connection string from Settings → Database

**Option C: Local PostgreSQL**
- Install PostgreSQL locally
- Create a database: `CREATE DATABASE budhhub;`
- Use: `postgresql://user:password@localhost:5432/budhhub`

### 2. Cloudflare R2 (File Storage)

1. Sign up at [cloudflare.com](https://cloudflare.com)
2. Go to R2 Object Storage
3. Create a bucket (e.g., `budhhub`)
4. Create API tokens:
   - Go to "Manage R2 API Tokens"
   - Create token with read/write permissions
   - Copy `Account ID`, `Access Key ID`, and `Secret Access Key`
5. (Optional) Set up custom domain for public access

**Quick Links:**
- [Cloudflare R2 Dashboard](https://dash.cloudflare.com/)
- [R2 Documentation](https://developers.cloudflare.com/r2/)

### 3. Email Service (SMTP)

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate an App Password:
   - Go to Google Account → Security
   - Enable 2-Step Verification
   - Create App Password for "Mail"
   - Use this password in `SMTP_PASSWORD`

**Alternative Providers:**
- **SendGrid**: Use their SMTP settings
- **Mailgun**: Use their SMTP settings
- **AWS SES**: Use their SMTP settings

### 4. Redis (Optional - for caching)

**Upstash Redis (Free Tier):**
1. Sign up at [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy REST URL and Token
4. Add to `.env` file

---

## 📁 Project Structure

```
budhhub/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/                # API routes
│   │   ├── auth/               # Authentication pages
│   │   ├── courses/            # Course browsing
│   │   ├── dashboard/          # User dashboards
│   │   ├── instructor/         # Instructor pages
│   │   └── my-courses/         # Learner course pages
│   ├── components/            # React components
│   │   ├── courses/            # Course-related components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── layout/             # Layout components
│   │   └── upload/             # File upload components
│   ├── db/                     # Database configuration
│   │   └── schema/             # Drizzle ORM schemas
│   ├── hooks/                  # React hooks
│   ├── lib/                    # Utilities and configs
│   │   ├── auth/               # Authentication logic
│   │   ├── r2/                 # Cloudflare R2 utilities
│   │   └── validations/        # Zod schemas
│   └── middleware.ts           # Next.js middleware
├── docs/                       # Documentation
├── scripts/                    # Utility scripts
└── public/                     # Static assets
```

---

## ✨ Key Features

### For Instructors 👨‍🏫
- ✅ Create and manage courses
- ✅ Add modules and lessons
- ✅ Upload videos and study materials
- ✅ Track learner progress
- ✅ Publish/unpublish courses

### For Learners 🎓
- ✅ Browse published courses
- ✅ Enroll in courses
- ✅ Watch lesson videos
- ✅ Download study materials
- ✅ Track learning progress
- ✅ Mark lessons as complete

### Technical Features 🔧
- ✅ Role-based access control (RBAC)
- ✅ File upload with Cloudflare R2
- ✅ Signed URLs for secure file access
- ✅ Progress tracking
- ✅ Responsive design
- ✅ Dark mode support

---

## 🧪 Test Credentials

For local development and testing, we provide test accounts. Check out the [Test Credentials Guide](./docs/TEST_CREDENTIALS.md) for login information.

**Quick Access:**
- 👑 **Admin**: `deepakyadu404@gmail.com` / `Deepak@12345`
- 👨‍🏫 **Instructor**: `instructor@budhhub.com` / `Instructor@1234`
- 🎓 **Learner**: Use your own email during onboarding

> ⚠️ **Note**: These credentials are for development only. Never use in production!

---

## 🎯 What's Next?

- 📖 Read the [Product Documentation](./docs/PRODUCT.md) for detailed feature descriptions
- 🔧 Check out [Technical Documentation](./docs/TECHNICAL.md) for architecture details
- 🧪 Check [Test Credentials](./docs/TEST_CREDENTIALS.md) for development accounts
- 🐛 Found a bug? Open an issue!
- 💡 Have a feature request? We'd love to hear it!

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is private and proprietary.

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - The React Framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Cloudflare R2](https://developers.cloudflare.com/r2/) - Object Storage

---

## 📞 Support

Need help? Check out our documentation:
- [Product Features](./docs/PRODUCT.md)
- [Technical Details](./docs/TECHNICAL.md)

---

**Happy Learning! 🚀**
