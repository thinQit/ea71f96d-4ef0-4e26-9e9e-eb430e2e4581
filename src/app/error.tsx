'use client';

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-slate-600">{error.message}</p>
      <button className="mt-6 rounded-lg bg-primary px-4 py-2 text-white" onClick={reset}>Try again</button>
    </div>
  );
}
