import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  users,
  courses,
  modules,
  lessons,
  enrollments
} from "../src/db";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to run seed");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    const [instructor] = await db
      .insert(users)
      .values({
        name: "Instructor One",
        email: "instructor@example.com",
        password_hash: null,
        role: "INSTRUCTOR"
      })
      .returning();

    const [learner] = await db
      .insert(users)
      .values({
        name: "Learner One",
        email: "learner@example.com",
        password_hash: null,
        role: "LEARNER"
      })
      .returning();

    const [course] = await db
      .insert(courses)
      .values({
        instructor_id: instructor.id,
        title: "Sample Course",
        description: "A starter course for BudhHub LMS",
        category: "General",
        difficulty: "Beginner"
      })
      .returning();

    const [module] = await db
      .insert(modules)
      .values({
        course_id: course.id,
        title: "Getting Started",
        ord: 1
      })
      .returning();

    const lessonRows = await db
      .insert(lessons)
      .values([
        {
          module_id: module.id,
          title: "Welcome",
          content: "Intro to BudhHub",
          ord: 1
        },
        {
          module_id: module.id,
          title: "First Steps",
          content: "Setup and orientation",
          ord: 2
        }
      ])
      .returning();

    await db.insert(enrollments).values({
      course_id: course.id,
      learner_id: learner.id,
      progress: 0
    });

    console.log("Seed complete:", {
      instructor,
      learner,
      course,
      module,
      lessons: lessonRows
    });
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

