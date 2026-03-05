'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import Button from '@/components/ui/Button';

interface PreviewResponse {
  previewUrl: string;
  expiry: string;
  width?: number;
  height?: number;
}

export default function TemplatePreviewPage() {
  const params = useParams<{ id: string }>();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    setLoading(true);
    setError('');
    api
      .post<PreviewResponse>(`/api/templates/${id}/preview`, { device })
      .then((res) => setPreview(res ?? null))
      .catch((_error: unknown) => {
        setPreview(null);
        setError('Preview not available.');
      })
      .finally(() => setLoading(false));

    api
      .post<{ recorded: boolean }>(`/api/analytics/event`, { templateId: id, eventType: 'preview', metadata: { device } })
      .catch((_error: unknown) => undefined);
  }, [params, device]);

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
        <h1 className="text-2xl font-semibold">Template Preview</h1>
        <div className="flex gap-2">
          <Button variant={device === 'desktop' ? 'primary' : 'secondary'} onClick={() => setDevice('desktop')}>
            Desktop
          </Button>
          <Button variant={device === 'tablet' ? 'primary' : 'secondary'} onClick={() => setDevice('tablet')}>
            Tablet
          </Button>
          <Button variant={device === 'mobile' ? 'primary' : 'secondary'} onClick={() => setDevice('mobile')}>
            Mobile
          </Button>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-6 pb-10">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          {loading ? (
            <div className="h-[60vh] animate-pulse rounded-lg bg-slate-700" />
          ) : error ? (
            <div className="h-[60vh] rounded-lg border border-dashed border-slate-600 p-10 text-center text-slate-400">
              {error}
            </div>
          ) : preview ? (
            <div className="flex h-[60vh] items-center justify-center rounded-lg bg-slate-950">
              <iframe
                title="Template preview"
                src={preview.previewUrl}
                className="h-full w-full rounded-lg border border-slate-700"
              />
            </div>
          ) : (
            <div className="h-[60vh] rounded-lg border border-dashed border-slate-600 p-10 text-center text-slate-400">
              Preview not available.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
