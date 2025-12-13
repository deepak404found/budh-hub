# 🧪 Test Credentials

> **Test accounts for development and testing purposes**

These credentials are provided for local development and testing. **Never use these in production!**

---

## 👑 Admin Account

**Email:** `deepakyadu404@gmail.com`  
**Password:** `Deepak@12345`  
**Role:** `ADMIN`

**Capabilities:**
- Access to all courses
- User management
- Platform analytics
- Full system access

---

## 👨‍🏫 Instructor Account

**Email:** `instructor@budhhub.com`  
**Password:** `Instructor@1234`  
**Role:** `INSTRUCTOR`

**Capabilities:**
- Create and manage courses
- Upload videos and materials
- View learner progress
- Publish/unpublish courses

---

## 🎓 Learner Account

**Note:** Use your own email address to create a learner account during onboarding.

**Steps to create a learner account:**
1. Go to the homepage
2. Click "Get Started"
3. Select "LEARNER" role
4. Fill in your email and profile information
5. Optionally set a password
6. Complete onboarding

**Capabilities:**
- Browse published courses
- Enroll in courses
- Watch lesson videos
- Download study materials
- Track learning progress

---

## 🔐 Using Test Accounts

### Quick Login Steps

1. Navigate to `/auth/sign-in`
2. Enter the email address
3. Enter the password
4. Click "Sign In"

### For Magic Link Login

1. Enter the email address
2. Click "Send Magic Link"
3. Check your email for the magic link
4. Click the link to sign in

---

## ⚠️ Important Notes

- **These credentials are for development only**
- **Do not use in production environments**
- **Change passwords if deploying to staging**
- **Never commit real credentials to version control**

---

## 🧹 Resetting Test Data

If you need to reset the database with fresh test data:

```bash
# Drop and recreate database (⚠️ WARNING: This deletes all data)
pnpm migrate:push --force

# Reseed with test data
pnpm seed
```

The seed script creates:
- Admin account (if not exists)
- Instructor account (if not exists)
- Sample courses with modules and lessons
- Test enrollments

---

**Last Updated**: December 2024
