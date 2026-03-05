'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { PaginatedResponse, Template } from '@/types';
import TemplateCard from '@/components/templates/TemplateCard';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function HomePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    api
      .get<PaginatedResponse<Template>>(`/api/templates?q=${encodeURIComponent(query)}`)
      .then((data) => {
        if (!mounted) return;
        setTemplates(data?.items ?? []);
      })
      .catch((_error: unknown) => {
        if (!mounted) return;
        setError('Unable to load templates.');
        setTemplates([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [query]);

  return (
    <main className="min-h-screen bg-white">
      <section className="bg-gradient-to-b from-primary/10 to-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">TemplateHub Marketplace</p>
              <h1 className="mt-3 text-4xl font-bold text-slate-900 md:text-5xl">
                Launch premium templates faster with a full admin dashboard.
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Manage template lifecycles, optimize SEO, review ratings, and track analytics in one command center built
                for teams.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="primary" size="lg">
                  Explore Templates
                </Button>
                <Link href="/admin/templates" className="inline-flex">
                  <Button variant="secondary" size="lg">
                    Open Admin Console
                  </Button>
                </Link>
              </div>
              <div className="mt-6 flex items-center gap-6 text-sm text-slate-500">
                <div>
                  <p className="font-semibold text-slate-900">120+</p>
                  <p>Published templates</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">4.8/5</p>
                  <p>Average rating</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">3k</p>
                  <p>Monthly previews</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <Image src="/images/hero.jpg" alt="TemplateHub hero" width={1200} height={675} className="h-auto w-full" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-slate-900">Find the right template</h3>
              <p className="mt-2 text-sm text-slate-600">
                Search by name, category, rating, or status to discover the best fit.
              </p>
              <div className="mt-4">
                <Input
                  label="Search templates"
                  placeholder="Search by title or tag"
                  value={query}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="font-semibold text-slate-900">SEO Ready</p>
                  <p>Canonical + structured data</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="font-semibold text-slate-900">Responsive</p>
                  <p>Desktop, tablet, mobile preview</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="font-semibold text-slate-900">Analytics</p>
                  <p>Track views & conversions</p>
                </div>
                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="font-semibold text-slate-900">Governed</p>
                  <p>Role-based access control</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured templates</h2>
            <p className="text-slate-600">Curated templates with high ratings and proven performance.</p>
          </div>
          <Link href="/admin/templates" className="text-sm font-semibold text-primary">
            Manage inventory →
          </Link>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
              Loading templates...
            </div>
          ) : error ? (
            <div className="col-span-full rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
              {error}
            </div>
          ) : templates.length === 0 ? (
            <div className="col-span-full rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-500">
              No templates yet. Create your first template in the admin console.
            </div>
          ) : (
            templates.slice(0, 6).map((template) => <TemplateCard key={template.id} template={template} />)
          )}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Optimized for SEO governance</h2>
              <p className="mt-3 text-slate-600">
                Configure canonical URLs, structured data, and metadata with approval workflows and audit logging.
              </p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-900">Structured data editor</p>
                  <p className="text-sm text-slate-600">Validate schemas and publish updates confidently.</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-900">Versioned previews</p>
                  <p className="text-sm text-slate-600">Test SEO updates across devices instantly.</p>
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <Image src="/images/feature.jpg" alt="TemplateHub features" width={1200} height={675} className="h-auto w-full" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">Responsive previews</h3>
            <p className="mt-2 text-sm text-slate-600">
              Switch between desktop, tablet, and mobile views instantly with version metadata.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">SEO governance</h3>
            <p className="mt-2 text-sm text-slate-600">
              Manage canonical URLs, structured data, and metadata per template.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">Analytics insights</h3>
            <p className="mt-2 text-sm text-slate-600">
              Capture view and preview events with auditing for every admin action.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-bold">Ready to scale your template marketplace?</h2>
            <p className="mt-3 text-slate-200">
              Bring your team into TemplateHub for controlled publishing, analytics, and collaboration.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="primary">Get started</Button>
              <Button variant="secondary">Schedule a demo</Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
            <Image src="/images/cta.jpg" alt="TemplateHub CTA" width={1200} height={675} className="h-auto w-full" />
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} TemplateHub. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/analytics">Analytics</Link>
            <Link href="/settings">Settings</Link>
            <Link href="/admin/templates">Admin</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
