'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Template } from '@/types';

interface TemplateFormProps {
  mode: 'create' | 'edit';
  templateId?: string;
}

interface TemplateResponse {
  template: Template;
}

export function TemplateForm({ mode, templateId }: TemplateFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (mode === 'edit' && templateId) {
      api
        .get<TemplateResponse>(`/api/templates/${templateId}`)
        .then((res) => {
          const template = res?.template;
          setTitle(template?.title ?? '');
          setDescription(template?.description ?? '');
          setCategory(template?.category ?? '');
          setStatus(template?.status ?? 'draft');
        })
        .catch((_error: unknown) => {
          setMessage('Unable to load template.');
        });
    }
  }, [mode, templateId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    const payload = { title, description, category, status };
    try {
      if (mode === 'create') {
        await api.post<TemplateResponse>('/api/templates', payload);
        setMessage('Template created successfully.');
      } else if (templateId) {
        await api.put<TemplateResponse>(`/api/templates/${templateId}`, payload);
        setMessage('Template updated successfully.');
      }
    } catch (_error: unknown) {
      setMessage('Unable to save template.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 rounded-xl border border-slate-200 bg-white p-6">
      <Input
        label="Title"
        placeholder="Template title"
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        required
      />
      <Input
        label="Description"
        placeholder="Short description"
        value={description}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
      />
      <Input
        label="Category"
        placeholder="Dashboard, SaaS, Ecommerce"
        value={category}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)}
      />
      <Input
        label="Status"
        placeholder="draft / published / archived"
        value={status}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStatus(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">SEO metadata and asset uploads are managed separately.</p>
        <Button variant="primary" size="lg" disabled={loading}>
          {loading ? 'Saving...' : 'Save template'}
        </Button>
      </div>
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </form>
  );
}

export default TemplateForm;
