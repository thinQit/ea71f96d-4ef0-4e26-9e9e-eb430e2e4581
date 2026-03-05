'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

const routes = [
  { route: '/', title: 'Home' },
  { route: '/admin/templates', title: 'Admin' },
  { route: '/analytics', title: 'Analytics' },
  { route: '/settings', title: 'Settings' }
];

export function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold text-slate-900">TemplateHub</Link>
        <button
          className="md:hidden"
          aria-label="Toggle navigation"
          onClick={() => setOpen((prev) => !prev)}
        >
          <span className="block h-0.5 w-6 bg-slate-900" />
          <span className="mt-1 block h-0.5 w-6 bg-slate-900" />
          <span className="mt-1 block h-0.5 w-6 bg-slate-900" />
        </button>
        <div className="hidden items-center gap-6 md:flex">
          {routes.map((link) => (
            <Link key={link.route} href={link.route} className="text-sm font-medium text-slate-600 hover:text-slate-900">
              {link.title}
            </Link>
          ))}
          <div className="flex gap-2">
            <Button variant="ghost">Sign In</Button>
            <Button variant="primary">Sign Up</Button>
          </div>
        </div>
      </div>
      {open && (
        <div className="border-t border-slate-200 bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {routes.map((link) => (
              <Link key={link.route} href={link.route} className="text-sm font-medium text-slate-600">
                {link.title}
              </Link>
            ))}
            <div className="flex gap-2">
              <Button variant="ghost">Sign In</Button>
              <Button variant="primary">Sign Up</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;
