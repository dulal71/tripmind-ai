'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCompass, FiLogIn, FiUserPlus, FiMenu, FiX, FiLogOut, FiUser, FiMap, FiStar, FiMessageCircle, FiTrendingUp, FiHeart, FiShield } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import ThemeToggle from '@/components/ui/ThemeToggle';

const navLinks = [
  { href: '/explore', label: 'Explore', icon: FiCompass },
  { href: '/trips', label: 'My Trips', icon: FiMap },
];

const aiLinks = [
  { href: '/planner', label: 'AI Planner', icon: FiStar },
  { href: '/recommendations', label: 'Recommend', icon: FiTrendingUp },
  { href: '/chat', label: 'AI Chat', icon: FiMessageCircle },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const user = session?.user;
  const isLoggedIn = !!user;

  useEffect(() => {
    const fetchRole = async () => {
      if (!session?.session?.token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/profile`, {
          headers: { Authorization: `Bearer ${session.session.token}` },
        });
        const data = await res.json();
        setUserRole(data.data?.role || 'user');
      } catch {
        setUserRole('user');
      }
    };
    fetchRole();
  }, [session]);

  if (pathname?.startsWith('/login') || pathname?.startsWith('/register')) return null;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      router.push('/');
      router.refresh();
    } catch {
      // silent
    } finally {
      setIsSigningOut(false);
    }
  };

  const linkClass = (isActive: boolean, color?: string) => {
    const activeColor = color || 'blue';
    const colorMap: Record<string, string> = {
      blue: 'text-blue-500 dark:text-blue-400',
      rose: 'text-rose-500 dark:text-rose-400',
    };
    return `relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
      isActive
        ? colorMap[activeColor] || colorMap.blue
        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
    }`;
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            <FiCompass className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white hidden sm:inline">
            Trip<span className="text-blue-500 dark:text-blue-400">Mind</span> AI
          </span>
        </Link>

        {/* Desktop Nav Links (centered) */}
        <div className="hidden lg:flex items-center justify-center gap-0.5 min-w-0 flex-1 mx-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass(isActive)}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-x-0 -bottom-[calc(0.5rem+1px)] h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          {isLoggedIn && (
            <>
              <Link
                href="/favorites"
                className={linkClass(pathname === '/favorites', 'rose')}
              >
                <FiHeart className="h-4 w-4 shrink-0" />
                Favorites
                {pathname === '/favorites' && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-x-0 -bottom-[calc(0.5rem+1px)] h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </Link>
              {aiLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={linkClass(isActive)}
                  >
                    <link.icon className="h-4 w-4 shrink-0" />
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute inset-x-0 -bottom-[calc(0.5rem+1px)] h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </>
          )}
        </div>

        {/* Desktop Auth (right side) */}
        <div className="hidden lg:flex items-center gap-1.5 shrink-0">
          <ThemeToggle />
          {isPending ? (
            <div className="h-9 w-32 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          ) : isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors whitespace-nowrap"
              >
                <FiUser className="h-4 w-4 shrink-0" />
                <span className="truncate max-w-[120px]">{user.name || user.email}</span>
              </Link>
              {userRole === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors whitespace-nowrap"
                >
                  <FiShield className="h-4 w-4 shrink-0" />
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                <FiLogOut className="h-4 w-4 shrink-0" />
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors whitespace-nowrap"
              >
                <FiLogIn className="h-4 w-4 shrink-0" />
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-violet-500 active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <FiUserPlus className="h-4 w-4 shrink-0" />
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile + md: Menu Icon */}
        <div className="lg:hidden flex items-center gap-1 shrink-0">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center rounded-lg p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
          >
            {mobileOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile + md: Dropdown Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-zinc-200 dark:border-zinc-800/60 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <link.icon className="h-4 w-4 shrink-0" />
                    {link.label}
                  </Link>
                );
              })}
              {isLoggedIn && (
                <>
                  <Link
                    href="/favorites"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      pathname === '/favorites'
                        ? 'text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <FiHeart className="h-4 w-4 shrink-0" />
                    Favorites
                  </Link>
                  {aiLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                          isActive
                            ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                        }`}
                      >
                        <link.icon className="h-4 w-4 shrink-0" />
                        {link.label}
                      </Link>
                    );
                  })}
                </>
              )}
              <div className="mt-2 border-t border-zinc-200 dark:border-zinc-800 pt-3 flex flex-col gap-2">
                {isPending ? (
                  <div className="space-y-2">
                    <div className="h-12 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-12 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                ) : isLoggedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <FiUser className="h-4 w-4 shrink-0" />
                      {user.name || user.email}
                    </Link>
                    {userRole === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors"
                      >
                        <FiShield className="h-4 w-4 shrink-0" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { handleSignOut(); setMobileOpen(false); }}
                      disabled={isSigningOut}
                      className="flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <FiLogOut className="h-4 w-4 shrink-0" />
                      {isSigningOut ? 'Signing out...' : 'Sign Out'}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <FiLogIn className="h-4 w-4 shrink-0" />
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 justify-center rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition-all"
                    >
                      <FiUserPlus className="h-4 w-4 shrink-0" />
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
