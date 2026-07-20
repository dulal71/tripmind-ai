import Link from 'next/link';
import { FiCompass, FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

const footerLinks = {
  Product: [
    { href: '/explore', label: 'Explore Destinations' },
    { href: '/planner', label: 'AI Planner' },
    { href: '/recommendations', label: 'Recommendations' },
    { href: '/chat', label: 'AI Chat' },
  ],
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact' },
  ],
  Support: [
    { href: '/contact', label: 'Help Center' },
    { href: '/about', label: 'Privacy Policy' },
    { href: '/about', label: 'Terms of Service' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/60 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
                <FiCompass className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Trip<span className="text-blue-400">Mind</span> AI
              </span>
            </Link>
            <p className="mt-4 text-sm text-zinc-500 leading-relaxed max-w-xs">
              AI-powered travel planning platform that creates personalized itineraries and intelligent recommendations.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-500 hover:text-white hover:border-zinc-700 hover:bg-zinc-800/60 transition-colors">
                <FiGithub className="h-4 w-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-500 hover:text-white hover:border-zinc-700 hover:bg-zinc-800/60 transition-colors">
                <FiTwitter className="h-4 w-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-500 hover:text-white hover:border-zinc-700 hover:bg-zinc-800/60 transition-colors">
                <FiLinkedin className="h-4 w-4" />
              </a>
              <a href="mailto:hello@tripmind.ai" className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-500 hover:text-white hover:border-zinc-700 hover:bg-zinc-800/60 transition-colors">
                <FiMail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-zinc-800/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} TripMind AI. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">
            Built with AI for smarter travel
          </p>
        </div>
      </div>
    </footer>
  );
}
