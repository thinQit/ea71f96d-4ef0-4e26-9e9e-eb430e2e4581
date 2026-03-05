'use client';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Settings & Integrations</h1>
      <p className="text-slate-600">Configure analytics providers, CDN delivery, and upload preferences.</p>

      <div className="mt-8 grid gap-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Analytics provider</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input label="Provider" placeholder="Segment / GA4" />
            <Input label="API Key" placeholder="Enter key" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Storage & CDN</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input label="Storage bucket" placeholder="templatehub-assets" />
            <Input label="CDN URL" placeholder="https://cdn.templatehub.com" />
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="primary">Save settings</Button>
        </div>
      </div>
    </main>
  );
}
