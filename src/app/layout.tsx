import './globals.css';
import Navigation from '@/components/layout/Navigation';
import AuthProvider from '@/providers/AuthProvider';

export const metadata = {
  title: 'TemplateHub',
  description: 'TemplateHub — an admin-focused template management and marketplace dashboard for creating, previewing, rating, and publishing website/app templates. Includes template CRUD, preview (responsive), SEO metadata management, analytics integration, and admin controls with role-based access.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
