# 🔧 Technical Documentation

> **In-depth technical details of BudhHub LMS architecture and implementation**

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Architecture](#api-architecture)
5. [Authentication & Authorization](#authentication--authorization)
6. [File Storage System](#file-storage-system)
7. [State Management](#state-management)
8. [Security Implementation](#security-implementation)
9. [Performance Optimizations](#performance-optimizations)
10. [Deployment Architecture](#deployment-architecture)

---

## 🏗️ Architecture Overview

BudhHub LMS follows a **modern full-stack architecture** using Next.js 16 App Router with a clear separation between client and server components.

### Architecture Pattern

```
┌─────────────────────────────────────────────────┐
│           Client (Browser)                     │
│  ┌──────────────────────────────────────────┐ │
│  │  React Components (Client Components)      │ │
│  │  - Interactive UI                          │ │
│  │  - React Hooks                             │ │
│  │  - Form Handling                          │ │
│  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                    ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────┐
│      Next.js Server (App Router)               │
│  ┌──────────────────────────────────────────┐ │
│  │  Server Components                         │ │
│  │  - Data Fetching                           │ │
│  │  - Authentication                          │ │
│  │  - Route Handlers (API)                    │ │
│  └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────────┐
│           Data Layer                            │
│  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │  Cloudflare   │          │
│  │  (NeonDB)    │  │  R2 Storage   │          │
│  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────┘
```

### Design Principles

- **Type Safety**: Full TypeScript coverage with strict mode
- **Schema-First**: Database schemas defined with Drizzle ORM
- **Server-First**: Maximum use of Server Components for performance
- **API Routes**: RESTful API design with Next.js Route Handlers
- **Component Composition**: Reusable, composable React components

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.10 | React framework with App Router |
| **React** | 19.2.1 | UI library |
| **TypeScript** | 5.6.3 | Type-safe JavaScript |
| **Tailwind CSS** | 4.0.0 | Utility-first CSS framework |
| **Lucide React** | 0.561.0 | Icon library |
| **React Hook Form** | 7.68.0 | Form state management |
| **Zod** | 4.1.13 | Schema validation |
| **Sonner** | 2.0.7 | Toast notifications |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js API Routes** | 16.0.10 | Server-side API endpoints |
| **Drizzle ORM** | 0.38.2 | Type-safe database queries |
| **PostgreSQL** | 15+ | Relational database |
| **NextAuth.js** | 5.0.0-beta.30 | Authentication |
| **AWS SDK S3** | 3.726.1 | Cloudflare R2 client |
| **Nodemailer** | 7.0.7 | Email sending |
| **bcryptjs** | 3.0.3 | Password hashing |

### Infrastructure

| Service | Purpose |
|---------|---------|
| **NeonDB** | Serverless PostgreSQL hosting |
| **Cloudflare R2** | Object storage for videos & files |
| **Upstash Redis** | Caching (optional) |
| **Vercel** | Hosting & deployments |

---

## 🗄️ Database Schema

### Core Tables

#### `users`
Stores user accounts with authentication and role information.

```typescript
{
  id: string (primary key, text)
  email: string (unique, not null)
  name: string (nullable)
  password_hash: string (nullable)
  role: 'ADMIN' | 'INSTRUCTOR' | 'LEARNER' (default: 'LEARNER')
  emailVerified: timestamp (nullable)
  image: string (nullable)
  created_at: timestamp
}
```

#### `courses`
Main course entity with metadata.

```typescript
{
  id: UUID (primary key)
  instructor_id: string (FK to users.id)
  title: string (max 512 chars)
  description: text (nullable)
  category: string (nullable)
  difficulty: string (nullable)
  thumbnail_url: string (nullable)
  price: numeric (nullable, for future)
  estimated_duration: integer (nullable)
  total_lessons: integer (default: 0)
  is_published: boolean (default: false)
  created_at: timestamp
}
```

#### `modules`
Course modules for organizing lessons.

```typescript
{
  id: UUID (primary key)
  course_id: UUID (FK to courses.id)
  title: string (max 512 chars)
  ord: integer (default: 0) // Order within course
  created_at: timestamp
}
```

#### `lessons`
Individual lessons within modules.

```typescript
{
  id: UUID (primary key)
  module_id: UUID (FK to modules.id)
  title: string (max 512 chars)
  content: text (nullable, markdown/html)
  video_key: string (nullable, R2 object key)
  video_size: integer (nullable, bytes)
  video_duration: integer (nullable, seconds)
  video_mime_type: string (nullable)
  ord: integer (default: 0) // Order within module
  created_at: timestamp
}
```

#### `course_materials`
Study materials (PDFs, images, documents).

```typescript
{
  id: UUID (primary key)
  course_id: UUID (FK to courses.id)
  lesson_id: UUID (nullable, FK to lessons.id)
  file_name: string (max 512 chars)
  file_key: string (R2 object key)
  file_type: string (nullable, MIME type)
  file_size: integer (nullable, bytes)
  material_type: string (nullable, 'image'|'document'|'pdf')
  created_at: timestamp
}
```

#### `enrollments`
Tracks learner course enrollments.

```typescript
{
  id: UUID (primary key)
  course_id: UUID (FK to courses.id)
  learner_id: string (FK to users.id)
  enrolled_at: timestamp
  progress: integer (default: 0, 0-100)
}
```

#### `lesson_progress`
Tracks individual lesson completion.

```typescript
{
  id: UUID (primary key)
  enrollment_id: UUID (FK to enrollments.id)
  lesson_id: UUID (FK to lessons.id)
  completed: boolean (default: false)
  completed_at: timestamp (nullable)
}
```

### Relationships

```
users (1) ──→ (N) courses (instructor_id)
courses (1) ──→ (N) modules (course_id)
modules (1) ──→ (N) lessons (module_id)
courses (1) ──→ (N) enrollments (course_id)
users (1) ──→ (N) enrollments (learner_id)
enrollments (1) ──→ (N) lesson_progress (enrollment_id)
lessons (1) ──→ (N) lesson_progress (lesson_id)
courses (1) ──→ (N) course_materials (course_id)
lessons (1) ──→ (N) course_materials (lesson_id)
```

---

## 🔌 API Architecture

### API Route Structure

All API routes follow RESTful conventions and are located in `src/app/api/`.

#### Authentication APIs

- `POST /api/auth/signin` - User sign in
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/[...nextauth]` - NextAuth handler

#### Course APIs

- `GET /api/courses` - List all published courses (with filters)
- `GET /api/courses/[courseId]` - Get course details
- `POST /api/courses/[courseId]/enroll` - Enroll in course

#### Instructor APIs

- `GET /api/instructor/courses` - List instructor's courses
- `POST /api/instructor/courses` - Create new course
- `GET /api/instructor/courses/[courseId]` - Get course details
- `PATCH /api/instructor/courses/[courseId]` - Update course
- `DELETE /api/instructor/courses/[courseId]` - Delete course
- `POST /api/instructor/courses/[courseId]/publish` - Publish/unpublish

#### Module APIs

- `POST /api/instructor/courses/[courseId]/modules` - Create module
- `PATCH /api/instructor/courses/[courseId]/modules/[moduleId]` - Update module
- `DELETE /api/instructor/courses/[courseId]/modules/[moduleId]` - Delete module

#### Lesson APIs

- `POST /api/instructor/courses/[courseId]/modules/[moduleId]/lessons` - Create lesson
- `GET /api/instructor/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]` - Get lesson
- `PATCH /api/instructor/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]` - Update lesson
- `DELETE /api/instructor/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]` - Delete lesson
- `DELETE /api/instructor/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/video` - Delete lesson video

#### Material APIs

- `GET /api/instructor/courses/[courseId]/materials` - List course materials
- `POST /api/instructor/courses/[courseId]/materials` - Create course material
- `GET /api/instructor/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/materials` - List lesson materials
- `POST /api/instructor/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/materials` - Create lesson material
- `DELETE /api/instructor/courses/[courseId]/materials/[materialId]` - Delete material
- `DELETE /api/instructor/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/materials/[materialId]` - Delete lesson material

#### Upload APIs

- `POST /api/upload/video` - Upload lesson video
- `POST /api/upload/material` - Upload study material
- `POST /api/upload/thumbnail` - Upload course thumbnail

#### Learner APIs

- `GET /api/my-courses` - List enrolled courses
- `GET /api/my-courses/[courseId]` - Get enrolled course details
- `POST /api/my-courses/[courseId]/lessons/[lessonId]/complete` - Mark lesson complete
- `GET /api/my-courses/[courseId]/lessons/[lessonId]/video-url` - Get signed video URL
- `GET /api/my-courses/[courseId]/lessons/[lessonId]/materials/[materialId]/url` - Get signed material URL
- `GET /api/my-courses/[courseId]/materials/[materialId]/url` - Get signed course material URL

### API Design Patterns

#### Error Handling

All API routes follow consistent error handling:

```typescript
try {
  // Business logic
  return NextResponse.json({ data }, { status: 200 });
} catch (error) {
  console.error("Error:", error);
  return NextResponse.json(
    { error: "User-friendly message" },
    { status: 500 }
  );
}
```

#### Validation

All inputs are validated using Zod schemas:

```typescript
const schema = z.object({
  title: z.string().min(1).max(512),
  // ...
});

const validatedData = schema.parse(body);
```

#### Authentication

Protected routes check authentication:

```typescript
const user = await getCurrentUserWithRole();
if (!user || !user.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

#### Authorization

Role-based checks:

```typescript
const canEdit = await canEditCourse(user.id, courseId);
if (!canEdit) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **User Registration/Login**
   - User signs in via NextAuth email provider
   - Magic link sent to email (or password-based)
   - Session created with JWT token
   - Token stored in HTTP-only cookie

2. **Session Management**
   - NextAuth handles session lifecycle
   - Middleware validates tokens on protected routes
   - Automatic token refresh

3. **Onboarding**
   - New users select role (INSTRUCTOR/LEARNER)
   - Profile information collected
   - Optional password setup

### Authorization System

#### Role-Based Access Control (RBAC)

Three roles with different permissions:

**LEARNER**
- ✅ Browse published courses
- ✅ Enroll in courses
- ✅ Access enrolled course content
- ✅ Track progress
- ❌ Create/edit courses

**INSTRUCTOR**
- ✅ All learner permissions
- ✅ Create/edit own courses
- ✅ Manage modules and lessons
- ✅ Upload videos and materials
- ✅ View learner analytics
- ❌ Access other instructors' courses

**ADMIN**
- ✅ All instructor permissions
- ✅ Access all courses
- ✅ Manage users
- ✅ Platform analytics

#### Permission Checks

Implemented in `src/lib/auth/course-permissions.ts`:

```typescript
// Check if user can edit a course
export async function canEditCourse(
  userId: string,
  courseId: string
): Promise<boolean> {
  // Admin can edit any course
  // Instructor can only edit own courses
  // Learner cannot edit courses
}
```

### Middleware Protection

Routes are protected via Next.js middleware:

```typescript
// Protected routes require authentication
const protectedRoutes = [
  "/dashboard",
  "/courses",
  "/my-courses",
  "/instructor",
  "/admin",
];
```

---

## 📦 File Storage System

### Cloudflare R2 Integration

BudhHub uses Cloudflare R2 for storing:
- **Videos**: Lesson video files (max 10MB)
- **Materials**: Study materials, PDFs, images (max 15MB)
- **Thumbnails**: Course thumbnail images

### Storage Architecture

#### File Upload Flow

1. **Client** → Uploads file via `FormData`
2. **API Route** → Receives file, validates size/type
3. **R2 Upload** → File uploaded to R2 bucket
4. **Database** → Metadata stored (file_key, size, type)
5. **Response** → Returns R2 key and public URL

#### File Access

**Public URLs** (if `R2_PUBLIC_URL` configured):
```
https://your-domain.com/courses/{courseId}/thumbnails/{filename}
```

**Signed URLs** (when public access disabled):
- Generated on-demand via `GetObjectCommand`
- Valid for 1 hour
- Includes authentication token

#### File Key Structure

```
courses/{courseId}/thumbnails/{timestamp}-{random}-{filename}
lessons/{lessonId}/videos/{timestamp}-{random}-{filename}
courses/{courseId}/materials/{materialId}-{filename}
lessons/{lessonId}/materials/{materialId}-{filename}
```

### File Management

#### Upload Components

- `VideoUpload` - Handles video file uploads
- `MaterialUpload` - Handles study material uploads
- `ThumbnailUpload` - Handles course thumbnail uploads

All components:
- Validate file type and size
- Show upload progress
- Handle errors gracefully
- Support file replacement

#### Deletion

Files are deleted from R2 when:
- Course is deleted
- Lesson is deleted
- Material is deleted
- Video is removed from lesson

---

## 🎨 State Management

### Client-Side State

**React Hooks** for local component state:
- `useState` - Component state
- `useEffect` - Side effects
- `useCallback` - Memoized callbacks
- `useRef` - Refs for DOM access

### Server State

**Custom Hooks** for server data:
- `useCourses` - Fetch and filter courses
- `useCourseDetails` - Fetch course details
- `useMyCourses` - Fetch enrolled courses
- `useLessons` - Manage lesson CRUD
- `useEnrollCourse` - Handle enrollment

### Data Fetching Pattern

```typescript
// Server Component (preferred)
export default async function Page() {
  const data = await fetchData();
  return <Component data={data} />;
}

// Client Component (when needed)
"use client";
export function Component() {
  const { data, isLoading } = useCustomHook();
  // ...
}
```

---

## 🔒 Security Implementation

### Input Validation

All user inputs validated with **Zod**:

```typescript
const courseSchema = z.object({
  title: z.string().min(1).max(512),
  description: z.string().max(5000).optional(),
  category: z.string().max(128).optional(),
});
```

### SQL Injection Prevention

**Drizzle ORM** provides type-safe queries:

```typescript
// ✅ Safe - Parameterized
await db.select().from(courses).where(eq(courses.id, courseId));

// ❌ Never use raw SQL with user input
```

### XSS Prevention

- React automatically escapes content
- `dangerouslySetInnerHTML` only used for trusted markdown
- All user inputs sanitized

### CSRF Protection

- NextAuth handles CSRF tokens
- SameSite cookies enabled
- API routes validate requests

### File Upload Security

- File type validation (whitelist)
- File size limits enforced
- Filenames sanitized
- Files stored in isolated R2 buckets

### Authentication Security

- Passwords hashed with bcrypt
- JWT tokens in HTTP-only cookies
- Session expiration
- Secure password reset flow

---

## ⚡ Performance Optimizations

### Server-Side Rendering (SSR)

Most pages use SSR for:
- Faster initial load
- Better SEO
- Reduced client-side JavaScript

### Static Generation

Where possible, pages are statically generated:
- Course catalog (with ISR)
- Public course pages

### Code Splitting

- Automatic route-based splitting
- Dynamic imports for heavy components
- Lazy loading of non-critical features

### Database Optimizations

- Indexed foreign keys
- Efficient queries with Drizzle
- Pagination for large datasets
- Cached counts (e.g., `total_lessons`)

### File Loading

- Videos loaded on-demand
- Signed URLs cached client-side
- Material URLs fetched only when needed

### Caching Strategy

- **Redis** (optional) for API response caching
- Browser caching for static assets
- CDN for R2 public URLs

---

## 🚀 Deployment Architecture

### Production Setup

**Recommended Stack:**
- **Hosting**: Vercel
- **Database**: NeonDB (serverless PostgreSQL)
- **Storage**: Cloudflare R2
- **CDN**: Cloudflare (for R2)
- **CI/CD**: GitHub Actions

### Environment Variables

All sensitive data stored in:
- Vercel Environment Variables (production)
- `.env.local` (local development)
- Never committed to git

### Build Process

```bash
# Development
pnpm dev

# Production Build
pnpm build
pnpm start

# Type Checking
pnpm typecheck

# Linting
pnpm lint
```

### Database Migrations

Migrations run automatically on Vercel:
- Generated locally: `pnpm migrate:generate`
- Applied on deploy: `pnpm migrate:push`

### Monitoring

- Error logging via console (production)
- Performance monitoring via Vercel Analytics
- Database query monitoring via NeonDB dashboard

---

## 📊 Logging & Debugging

### Structured Logging

All API routes include detailed logging:

```typescript
console.log(`[UPLOAD:VIDEO] Starting upload - User: ${user.id}, File: ${filename}`);
console.error(`[UPLOAD:VIDEO] Error after ${time}ms`, error);
```

### Log Prefixes

- `[UPLOAD:VIDEO]` - Video upload operations
- `[UPLOAD:MATERIAL]` - Material upload operations
- `[UPLOAD:THUMBNAIL]` - Thumbnail upload operations
- `[DELETE:VIDEO]` - Video deletion operations
- `[MIDDLEWARE]` - Middleware operations

### Development Tools

- React DevTools for component debugging
- Next.js Fast Refresh for hot reloading
- TypeScript for compile-time error checking
- ESLint for code quality

---

## 🔄 Data Flow Examples

### Course Creation Flow

```
1. Instructor fills form (Client Component)
   ↓
2. Form submission → POST /api/instructor/courses
   ↓
3. Validate input (Zod schema)
   ↓
4. Check permissions (canEditCourse)
   ↓
5. Insert into database (Drizzle ORM)
   ↓
6. Return course data
   ↓
7. Update UI (React state)
```

### Video Upload Flow

```
1. User selects file (VideoUpload component)
   ↓
2. Validate file (size, type)
   ↓
3. Upload to /api/upload/video (FormData)
   ↓
4. Generate R2 key
   ↓
5. Upload to R2 (PutObjectCommand)
   ↓
6. Store metadata in database
   ↓
7. Return R2 key and URL
   ↓
8. Update lesson with video_key
```

### Lesson Viewing Flow (Learner)

```
1. Learner clicks lesson
   ↓
2. Fetch lesson data (Server Component)
   ↓
3. Check enrollment status
   ↓
4. Fetch video URL (signed URL if needed)
   ↓
5. Fetch materials
   ↓
6. Render lesson page
   ↓
7. Mark complete → Update lesson_progress
```

---

## 🧪 Testing Strategy

### Current Status

- Type checking via TypeScript
- Linting via ESLint
- Manual testing in development

### Future Testing

- Unit tests for utilities
- Integration tests for API routes
- E2E tests for critical flows
- Performance testing

---

## 📈 Scalability Considerations

### Database

- Indexed foreign keys for fast joins
- Pagination for large result sets
- Connection pooling via NeonDB

### File Storage

- R2 scales automatically
- CDN for global distribution
- Signed URLs for secure access

### Application

- Serverless functions scale automatically
- Stateless design for horizontal scaling
- Caching layer for frequently accessed data

---

## 🔮 Future Technical Enhancements

### Planned Improvements

1. **Caching Layer**
   - Redis integration for API responses
   - Query result caching
   - Session caching

2. **Real-time Features**
   - WebSocket support for live updates
   - Real-time progress tracking
   - Live notifications

3. **Performance**
   - Image optimization
   - Video streaming optimization
   - Database query optimization

4. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Analytics integration

---

**Last Updated**: December 2024  
**Version**: 1.0.0
