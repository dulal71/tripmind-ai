'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiUsers,
  FiMap,
  FiBarChart2,
  FiShield,
  FiArrowLeft,
} from 'react-icons/fi';
import { authClient } from '@/lib/auth-client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const adminLinks = [
  { href: '/admin', label: 'Overview', icon: FiBarChart2 },
  { href: '/admin/users', label: 'Users', icon: FiUsers },
  { href: '/admin/destinations', label: 'Destinations', icon: FiMap },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/profile`, {
          headers: {
            Authorization: `Bearer ${session?.session?.token}`,
          },
        });
        const data = await res.json();
        setRole(data.data?.role || 'user');
      } catch {
        setRole('user');
      } finally {
        setLoading(false);
      }
    };

    if (session?.session?.token) {
      fetchRole();
    } else if (!isPending) {
      setLoading(false);
    }
  }, [session, isPending]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!session?.user) {
    router.push('/login');
    return null;
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-8 text-center max-w-md">
          <FiShield className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">You need admin privileges to access this page.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all">
            <FiArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="border-b border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center gap-6">
            <div className="flex items-center gap-2">
              <FiShield className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">Admin Panel</span>
            </div>
            <nav className="flex items-center gap-1">
              {adminLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <Link
              href="/dashboard"
              className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
