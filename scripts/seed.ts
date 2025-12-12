import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and } from "drizzle-orm";
import { users } from "../src/db/schema/users.js";
import { courses } from "../src/db/schema/courses.js";
import { modules } from "../src/db/schema/modules.js";
import { lessons } from "../src/db/schema/lessons.js";
import { enrollments } from "../src/db/schema/enrollments.js";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to run seed");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    // Upsert admin - check if exists by email, update or insert
    const adminEmail = process.env.ADMIN_EMAIL || "admin@budhhub.com";
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);

    let admin;
    if (existingAdmin.length > 0) {
      // Update existing admin
      [admin] = await db
        .update(users)
        .set({
          name: "Admin",
          role: "ADMIN",
        })
        .where(eq(users.id, existingAdmin[0].id))
        .returning();
      console.log("Updated existing admin:", admin.email);
    } else {
      // Insert new admin
      [admin] = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          name: "Admin",
          email: adminEmail,
          password_hash: null, // Admin should set password via password reset or onboarding
          role: "ADMIN",
        })
        .returning();
      console.log("Created new admin:", admin.email);
    }

    // Upsert instructor - check if exists by email, update or insert
    const instructorEmail = "deepakyadu404@gmail.com";
    const existingInstructor = await db
      .select()
      .from(users)
      .where(eq(users.email, instructorEmail))
      .limit(1);

    let instructor;
    if (existingInstructor.length > 0) {
      // Update existing instructor
      [instructor] = await db
        .update(users)
        .set({
          name: "Deepak",
          role: "INSTRUCTOR",
        })
        .where(eq(users.id, existingInstructor[0].id))
        .returning();
      console.log("Updated existing instructor:", instructor.email);
    } else {
      // Insert new instructor
      [instructor] = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          name: "Deepak",
          email: instructorEmail,
          password_hash: null,
          role: "INSTRUCTOR",
        })
        .returning();
      console.log("Created new instructor:", instructor.email);
    }

    // Upsert learner - check if exists by email, update or insert
    const learnerEmail = "learner@example.com";
    const existingLearner = await db
      .select()
      .from(users)
      .where(eq(users.email, learnerEmail))
      .limit(1);

    let learner;
    if (existingLearner.length > 0) {
      // Update existing learner
      [learner] = await db
        .update(users)
        .set({
          name: "Learner One",
          role: "LEARNER",
        })
        .where(eq(users.id, existingLearner[0].id))
        .returning();
      console.log("Updated existing learner:", learner.email);
    } else {
      // Insert new learner
      [learner] = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          name: "Learner One",
          email: learnerEmail,
          password_hash: null,
          role: "LEARNER",
        })
        .returning();
      console.log("Created new learner:", learner.email);
    }

    // Upsert course - check if exists by title and instructor
    const courseTitle = "Sample Course";
    const existingCourse = await db
      .select()
      .from(courses)
      .where(eq(courses.instructor_id, instructor.id))
      .limit(1);

    let course;
    if (existingCourse.length > 0) {
      // Update existing course
      [course] = await db
        .update(courses)
        .set({
          title: courseTitle,
          description: "A starter course for BudhHub LMS",
          category: "General",
          difficulty: "Beginner",
        })
        .where(eq(courses.id, existingCourse[0].id))
        .returning();
      console.log("Updated existing course:", course.title);
    } else {
      // Insert new course
      [course] = await db
        .insert(courses)
        .values({
          instructor_id: instructor.id,
          title: courseTitle,
          description: "A starter course for BudhHub LMS",
          category: "General",
          difficulty: "Beginner",
        })
        .returning();
      console.log("Created new course:", course.title);
    }

    // Upsert module - check if exists by course and title
    const moduleTitle = "Getting Started";
    const existingModule = await db
      .select()
      .from(modules)
      .where(eq(modules.course_id, course.id))
      .limit(1);

    let module;
    if (existingModule.length > 0) {
      // Update existing module
      [module] = await db
        .update(modules)
        .set({
          title: moduleTitle,
          ord: 1,
        })
        .where(eq(modules.id, existingModule[0].id))
        .returning();
      console.log("Updated existing module:", module.title);
    } else {
      // Insert new module
      [module] = await db
        .insert(modules)
        .values({
          course_id: course.id,
          title: moduleTitle,
          ord: 1,
        })
        .returning();
      console.log("Created new module:", module.title);
    }

    // Upsert lessons - delete existing and insert new ones for this module
    await db.delete(lessons).where(eq(lessons.module_id, module.id));

    const lessonRows = await db
      .insert(lessons)
      .values([
        {
          module_id: module.id,
          title: "Welcome",
          content: "Intro to BudhHub",
          ord: 1,
        },
        {
          module_id: module.id,
          title: "First Steps",
          content: "Setup and orientation",
          ord: 2,
        },
      ])
      .returning();
    console.log("Created/updated lessons:", lessonRows.length);

    // Upsert enrollment - check if exists
    const existingEnrollment = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.course_id, course.id),
          eq(enrollments.learner_id, learner.id)
        )
      )
      .limit(1);

    if (existingEnrollment.length > 0) {
      await db
        .update(enrollments)
        .set({ progress: 0 })
        .where(eq(enrollments.id, existingEnrollment[0].id));
      console.log("Updated existing enrollment");
    } else {
      await db.insert(enrollments).values({
        course_id: course.id,
        learner_id: learner.id,
        progress: 0,
      });
      console.log("Created new enrollment");
    }

    console.log("\n✅ Seed complete:", {
      admin: { id: admin.id, email: admin.email },
      instructor: { id: instructor.id, email: instructor.email },
      learner: { id: learner.id, email: learner.email },
      course: { id: course.id, title: course.title },
      module: { id: module.id, title: module.title },
      lessons: lessonRows.length,
    });
  } catch (error) {
    console.error("❌ Seed error:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
