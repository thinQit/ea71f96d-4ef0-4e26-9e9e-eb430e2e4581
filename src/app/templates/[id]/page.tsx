'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Rating, SEO, Template } from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/providers/AuthProvider';

interface TemplateDetailResponse {
  template: Template;
  rating: { average: number; count: number };
}

interface RatingResponse {
  rating: Rating;
  newAverage: number;
  newCount: number;
}

export default function TemplateDetailsPage() {
  const params = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState<TemplateDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stars, setStars] = useState('5');
  const [comment, setComment] = useState('');
  const [ratingMessage, setRatingMessage] = useState('');

  useEffect(() => {
    const id = params?.id;
    if (!id) return;
    setLoading(true);
    setError('');
    api
      .get<TemplateDetailResponse>(`/api/templates/${id}`)
      .then((res) => setData(res ?? null))
      .catch((_error: unknown) => {
        setError('Unable to load template details.');
        setData(null);
      })
      .finally(() => setLoading(false));

    api
      .post<{ recorded: boolean }>(`/api/analytics/event`, { templateId: id, eventType: 'view', userId: user?.id })
      .catch((_error: unknown) => undefined);
  }, [params, user?.id]);

  const handleSubmitRating = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRatingMessage('');
    const id = params?.id;
    if (!id) return;
    try {
      const response = await api.post<RatingResponse>(`/api/templates/${id}/rate`, {
        stars: Number(stars),
        comment: comment || undefined
      });
      setRatingMessage('Thanks for your feedback!');
      if (data) {
        setData({
          template: data.template,
          rating: { average: response?.newAverage ?? data.rating.average, count: response?.newCount ?? data.rating.count }
        });
      }
      setComment('');
    } catch (_error: unknown) {
      setRatingMessage('Unable to submit rating.');
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-4xl px-6 py-16 text-slate-500">Loading template details...</div>;
  }

  if (error) {
    return <div className="mx-auto max-w-4xl px-6 py-16 text-slate-500">{error}</div>;
  }

  if (!data) {
    return <div className="mx-auto max-w-4xl px-6 py-16 text-slate-500">Template not found.</div>;
  }

  const { template, rating } = data;
  const seo = typeof template.seo === 'object' && template.seo !== null ? (template.seo as Partial<SEO>) : {};

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{template.title}</h1>
          <p className="mt-2 text-slate-600">{template.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary">{template.category}</Badge>
            <Badge variant="outline">{template.status}</Badge>
          </div>
        </div>
        <Link href={`/preview/${template.id}`}>
          <Button variant="primary">Open Preview</Button>
        </Link>
      </div>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">SEO metadata</h2>
          <p className="mt-2 text-sm text-slate-600">Title: {seo.title ?? 'Not set'}</p>
          <p className="text-sm text-slate-600">Description: {seo.metaDescription ?? 'Not set'}</p>
          <p className="text-sm text-slate-600">Canonical: {seo.canonicalUrl ?? 'Not set'}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Ratings</h2>
          <p className="mt-2 text-sm text-slate-600">
            Average rating: {rating.average.toFixed(1)} ({rating.count} reviews)
          </p>
          <div className="mt-4">
            <Link href={`/templates/${template.id}#ratings`}>
              <Button variant="secondary">Rate this template</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Assets & tags</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(template.tags ?? []).map((tag) => (
            <Badge key={tag} variant="ghost">
              {tag}
            </Badge>
          ))}
        </div>
      </section>

      <section id="ratings" className="mt-10 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Leave a rating</h2>
        <p className="mt-2 text-sm text-slate-600">
          {isAuthenticated ? 'Share your feedback to help others discover the best templates.' : 'Sign in to rate this template.'}
        </p>
        {isAuthenticated && (
          <form onSubmit={handleSubmitRating} className="mt-4 grid gap-4 md:grid-cols-2">
            <Input
              label="Stars (1-5)"
              type="number"
              min={1}
              max={5}
              value={stars}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStars(e.target.value)}
            />
            <Input
              label="Comment (optional)"
              placeholder="Share feedback"
              value={comment}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComment(e.target.value)}
            />
            <div className="md:col-span-2">
              <Button variant="primary" type="submit">
                Submit rating
              </Button>
            </div>
          </form>
        )}
        {ratingMessage && <p className="mt-3 text-sm text-slate-600">{ratingMessage}</p>}
      </section>
    </main>
  );
}
