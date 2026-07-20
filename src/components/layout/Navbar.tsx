'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCompass, FiLogIn, FiUserPlus, FiMenu, FiX, FiLogOut, FiUser, FiMap, FiStar, FiMessageCircle, FiTrendingUp, FiHeart } from 'react-icons/fi';
import { useState } from 'react';
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

  if (pathname?.startsWith('/login') || pathname?.startsWith('/register')) return null;

  const user = session?.user;
  const isLoggedIn = !!user;

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

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 w-full border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
            <FiCompass className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Trip<span className="text-blue-400">Mind</span> AI
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <link.icon className="h-4 w-4" />
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
                className={`relative flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  pathname === '/favorites'
                    ? 'text-rose-400'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <FiHeart className="h-4 w-4" />
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
                    className={`relative flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-blue-400'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
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

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          {isPending ? (
            <div className="h-9 w-32 animate-pulse rounded-lg bg-zinc-800" />
          ) : isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
              >
                <FiUser className="h-4 w-4" />
                {user.name || user.email}
              </Link>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <FiLogOut className="h-4 w-4" />
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
              >
                <FiLogIn className="h-4 w-4" />
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:from-blue-500 hover:to-violet-500 active:scale-[0.98] transition-all"
              >
                <FiUserPlus className="h-4 w-4" />
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex items-center justify-center rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
          >
            {mobileOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-zinc-800/60 bg-zinc-950/95 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-1 p-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-400 bg-blue-500/10'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            {isLoggedIn && (
              <>
                <Link
                  href="/favorites"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    pathname === '/favorites'
                      ? 'text-rose-400 bg-rose-500/10'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <FiHeart className="h-4 w-4" />
                  Favorites
                </Link>
                {aiLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? 'text-blue-400 bg-blue-500/10'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      }`}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
              </>
            )}
            <div className="mt-2 border-t border-zinc-800 pt-3 flex flex-col gap-2">
              {isPending ? (
                <div className="space-y-2">
                  <div className="h-12 animate-pulse rounded-lg bg-zinc-800" />
                  <div className="h-12 animate-pulse rounded-lg bg-zinc-800" />
                </div>
              ) : isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-colors"
                  >
                    <FiUser className="h-4 w-4" />
                    {user.name || user.email}
                  </Link>
                  <button
                    onClick={() => { handleSignOut(); setMobileOpen(false); }}
                    disabled={isSigningOut}
                    className="flex items-center gap-2 rounded-lg border border-zinc-800 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <FiLogOut className="h-4 w-4" />
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
                  >
                    <FiLogIn className="h-4 w-4" />
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 justify-center rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition-all"
                  >
                    <FiUserPlus className="h-4 w-4" />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
