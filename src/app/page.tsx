export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-16 font-sans text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <h1 className="text-3xl font-semibold">BudhHub LMS Starter</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-300">
          Next.js App Router + Drizzle + NextAuth (email) + R2 signed uploads. Configure
          your `.env`, run migrations and seed, then start building.
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-zinc-700 dark:text-zinc-200">
          <li>Set env values from `.env.example`.</li>
          <li>Run `pnpm migrate:push` then `pnpm seed`.</li>
          <li>Start the dev server with `pnpm dev`.</li>
        </ol>
      </div>
    </main>
  );
}
