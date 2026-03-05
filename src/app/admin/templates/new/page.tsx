'use client';

import TemplateForm from '@/components/templates/TemplateForm';

export default function CreateTemplatePage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Create Template</h1>
      <p className="text-slate-600">Fill in the template metadata, upload assets, and configure SEO settings.</p>
      <div className="mt-6">
        <TemplateForm mode="create" />
      </div>
    </main>
  );
}
