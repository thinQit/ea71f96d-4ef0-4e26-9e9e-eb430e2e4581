export type TemplateStatus = 'draft' | 'published' | 'archived';
export type UserRole = 'admin' | 'editor' | 'viewer' | 'user';
export type AnalyticsEventType = 'view' | 'preview' | 'download' | 'rating';

export interface Template {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  tags: string[];
  status: TemplateStatus;
  assets: unknown;
  seo: unknown;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Rating {
  id: string;
  templateId: string;
  userId: string;
  stars: number;
  comment: string;
  createdAt: string;
}

export interface AnalyticsEvent {
  id: string;
  templateId: string;
  eventType: AnalyticsEventType;
  metadata: unknown;
  userId: string | null;
  createdAt: string;
}

export interface SEO {
  id: string;
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  structuredData: unknown;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
