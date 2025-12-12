import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <h1 className="text-3xl font-semibold">BudhHub LMS</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-300">
          A modern learning management system built with Next.js, Drizzle ORM, and NextAuth.
        </p>
        <div className="flex gap-4">
          <Link
            href={"/auth/sign-in" as any}
            className="rounded-md bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Sign In
          </Link>
          <Link
            href={"/onboarding" as any}
            className="rounded-md border border-zinc-300 bg-white px-6 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            Get Started
          </Link>
        </div>
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <ol className="list-decimal space-y-2 pl-5 text-zinc-700 dark:text-zinc-200">
            <li>Set env values from `.env.example`.</li>
            <li>Run `pnpm migrate:push` then `pnpm seed`.</li>
            <li>Start the dev server with `pnpm dev`.</li>
          </ol>
        </div>
      </div>
    </main>
  );
}
