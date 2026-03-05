'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface Summary {
  templateId: string;
  metrics: { views: number; previews: number; downloads: number };
  timeseries: { timestamp: string; value: number }[];
}

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [templateId, setTemplateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadSummary = async () => {
    if (!templateId) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get<Summary>(`/api/analytics/templates/${templateId}/summary`);
      setSummary(res ?? null);
    } catch (_error: unknown) {
      setSummary(null);
      setError('Unable to load analytics summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSummary(null);
  }, [templateId]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600">Track template views, previews, and downloads.</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <Input
          label="Template ID"
          placeholder="Enter template ID"
          value={templateId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTemplateId(e.target.value)}
        />
        <Button variant="primary" onClick={loadSummary}>
          {loading ? 'Loading...' : 'Load summary'}
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-slate-500">{error}</p>}

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card>
          <Card.Header>
            <h3 className="text-sm font-semibold text-slate-600">Views</h3>
          </Card.Header>
          <Card.Content>
            <p className="text-3xl font-bold text-slate-900">{summary?.metrics.views ?? 0}</p>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <h3 className="text-sm font-semibold text-slate-600">Previews</h3>
          </Card.Header>
          <Card.Content>
            <p className="text-3xl font-bold text-slate-900">{summary?.metrics.previews ?? 0}</p>
          </Card.Content>
        </Card>
        <Card>
          <Card.Header>
            <h3 className="text-sm font-semibold text-slate-600">Downloads</h3>
          </Card.Header>
          <Card.Content>
            <p className="text-3xl font-bold text-slate-900">{summary?.metrics.downloads ?? 0}</p>
          </Card.Content>
        </Card>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Preview activity</h2>
        <div className="mt-4 grid gap-3">
          {(summary?.timeseries ?? []).map((point) => (
            <div key={point.timestamp} className="flex items-center justify-between text-sm text-slate-600">
              <span>{new Date(point.timestamp).toLocaleDateString()}</span>
              <span className="font-semibold text-slate-900">{point.value}</span>
            </div>
          ))}
          {!loading && (!summary || (summary?.timeseries ?? []).length === 0) && (
            <p className="text-sm text-slate-500">No analytics data yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
