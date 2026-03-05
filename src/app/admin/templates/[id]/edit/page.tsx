'use client';

import { useParams } from 'next/navigation';
import TemplateForm from '@/components/templates/TemplateForm';

export default function EditTemplatePage() {
  const params = useParams<{ id: string }>();
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Edit Template</h1>
      <p className="text-slate-600">Update content, assets, and SEO metadata for this template.</p>
      <div className="mt-6">
        <TemplateForm mode="edit" templateId={params?.id} />
      </div>
    </main>
  );
}
