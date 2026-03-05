import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: { email: 'admin@templatehub.com', name: 'Admin User', role: 'admin', passwordHash }
  });

  const editor = await prisma.user.create({
    data: { email: 'editor@templatehub.com', name: 'Editor User', role: 'editor', passwordHash }
  });

  const viewer = await prisma.user.create({
    data: { email: 'viewer@templatehub.com', name: 'Viewer User', role: 'viewer', passwordHash }
  });

  const regular = await prisma.user.create({
    data: { email: 'user@templatehub.com', name: 'Regular User', role: 'user', passwordHash }
  });

  const templateOne = await prisma.template.create({
    data: {
      title: 'SaaS Launch Kit',
      slug: 'saas-launch-kit',
      description: 'Modern SaaS marketing template with pricing and onboarding sections.',
      category: 'SaaS',
      tags: JSON.stringify(['saas', 'marketing', 'launch']),
      status: 'published',
      assets: JSON.stringify([{ type: 'image', url: '/assets/saas-hero.png' }]),
      createdBy: admin.id,
      seo: {
        create: {
          title: 'SaaS Launch Kit',
          metaDescription: 'Launch your SaaS with this premium template.',
          canonicalUrl: 'https://templatehub.dev/templates/saas-launch-kit',
          structuredData: JSON.stringify({ "@type": "Product", name: 'SaaS Launch Kit' })
        }
      }
    }
  });

  const templateTwo = await prisma.template.create({
    data: {
      title: 'Ecommerce Brand Suite',
      slug: 'ecommerce-brand-suite',
      description: 'Full ecommerce storefront with product highlights and reviews.',
      category: 'Ecommerce',
      tags: JSON.stringify(['ecommerce', 'retail', 'brand']),
      status: 'draft',
      assets: JSON.stringify([{ type: 'zip', url: '/assets/ecommerce-package.zip' }]),
      createdBy: editor.id,
      seo: {
        create: {
          title: 'Ecommerce Brand Suite',
          metaDescription: 'Premium ecommerce template with conversion-focused layout.',
          canonicalUrl: 'https://templatehub.dev/templates/ecommerce-brand-suite',
          structuredData: JSON.stringify({ "@type": "Product", name: 'Ecommerce Brand Suite' })
        }
      }
    }
  });

  const templateThree = await prisma.template.create({
    data: {
      title: 'Mobile App Showcase',
      slug: 'mobile-app-showcase',
      description: 'Landing page for mobile apps with feature highlights and CTA.',
      category: 'Mobile',
      tags: JSON.stringify(['mobile', 'app', 'landing']),
      status: 'published',
      assets: JSON.stringify([{ type: 'image', url: '/assets/mobile-hero.png' }]),
      createdBy: admin.id,
      seo: {
        create: {
          title: 'Mobile App Showcase',
          metaDescription: 'Showcase your app with this responsive template.',
          canonicalUrl: 'https://templatehub.dev/templates/mobile-app-showcase',
          structuredData: JSON.stringify({ "@type": "Product", name: 'Mobile App Showcase' })
        }
      }
    }
  });

  await prisma.rating.create({
    data: { templateId: templateOne.id, userId: regular.id, stars: 5, comment: 'Excellent layout and easy to customize.' }
  });

  await prisma.rating.create({
    data: { templateId: templateOne.id, userId: viewer.id, stars: 4, comment: 'Great, just needs more color options.' }
  });

  await prisma.analyticsEvent.create({
    data: { templateId: templateOne.id, eventType: 'view', metadata: JSON.stringify({ source: 'home' }), userId: regular.id }
  });

  await prisma.analyticsEvent.create({
    data: { templateId: templateOne.id, eventType: 'preview', metadata: JSON.stringify({ device: 'desktop' }), userId: regular.id }
  });

  await prisma.analyticsEvent.create({
    data: { templateId: templateThree.id, eventType: 'download', metadata: JSON.stringify({ package: 'zip' }), userId: viewer.id }
  });

  await prisma.auditLog.create({
    data: {
      action: 'template_publish',
      entity: 'Template',
      entityId: templateOne.id,
      userId: admin.id,
      metadata: JSON.stringify({ status: 'published' })
    }
  });

  await prisma.auditLog.create({
    data: {
      action: 'template_create',
      entity: 'Template',
      entityId: templateTwo.id,
      userId: editor.id,
      metadata: JSON.stringify({ status: 'draft' })
    }
  });

  console.log('Seed data created:', { admin: admin.email, editor: editor.email, viewer: viewer.email });
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
