# TemplateHub

TemplateHub is an admin-focused template management and marketplace dashboard for creating, previewing, rating, and publishing website/app templates. It includes template CRUD, responsive previews, SEO metadata management, analytics tracking, and role-based admin controls.

## Features
- Template CRUD with search, filters, and pagination
- Responsive previews with device toggles
- Ratings and comments for templates
- SEO metadata management per template
- Analytics events and summary dashboard
- JWT authentication with role-based access control

## Setup
1. Copy `.env.example` to `.env` and set values.
2. Install dependencies:
   ```bash
   ./install.sh
   ```
3. Run Prisma migrations (if added) and start dev server:
   ```bash
   npm run dev
   ```

## API Endpoints
- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `GET /api/templates`
- `POST /api/templates`
- `GET /api/templates/:id`
- `PUT /api/templates/:id`
- `DELETE /api/templates/:id`
- `POST /api/templates/:id/preview`
- `POST /api/templates/:id/rate`
- `POST /api/templates/:id/seo`
- `POST /api/uploads`
- `POST /api/analytics/event`
- `GET /api/analytics/templates/:id/summary`
- `GET /api/users`
