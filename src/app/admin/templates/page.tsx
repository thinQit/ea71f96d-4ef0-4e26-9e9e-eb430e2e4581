'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { PaginatedResponse, Template } from '@/types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    api
      .get<PaginatedResponse<Template>>(`/api/templates?q=${encodeURIComponent(query)}`)
      .then((res) => setTemplates(res?.items ?? []))
      .catch((_error: unknown) => {
        setTemplates([]);
        setError('Unable to load templates.');
      })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Template Management</h1>
          <p className="text-slate-600">Create, edit, archive, and publish templates with role controls.</p>
        </div>
        <Link href="/admin/templates/new">
          <Button variant="primary">Create Template</Button>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Input
          label="Search"
          placeholder="Search by title"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
        />
        <Input label="Category" placeholder="All categories" />
        <Input label="Status" placeholder="Draft / Published" />
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid grid-cols-5 gap-4 border-b border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600">
          <span>Template</span>
          <span>Category</span>
          <span>Status</span>
          <span>Updated</span>
          <span>Actions</span>
        </div>
        {loading ? (
          <div className="px-6 py-10 text-center text-slate-500">Loading templates...</div>
        ) : error ? (
          <div className="px-6 py-10 text-center text-slate-500">{error}</div>
        ) : templates.length === 0 ? (
          <div className="px-6 py-10 text-center text-slate-500">No templates found.</div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="grid grid-cols-5 gap-4 border-b border-slate-100 px-6 py-4 text-sm">
              <div>
                <p className="font-semibold text-slate-900">{template.title}</p>
                <p className="text-slate-500">{template.slug}</p>
              </div>
              <span className="text-slate-600">{template.category}</span>
              <Badge variant={template.status === 'published' ? 'success' : 'secondary'}>{template.status}</Badge>
              <span className="text-slate-600">
                {template.updatedAt ? new Date(template.updatedAt).toLocaleDateString() : 'N/A'}
              </span>
              <div className="flex gap-2">
                <Link href={`/admin/templates/${template.id}/edit`} className="text-primary">
                  Edit
                </Link>
                <Link href={`/templates/${template.id}`} className="text-slate-500">
                  View
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
