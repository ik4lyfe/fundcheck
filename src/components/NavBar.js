'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch (e) {}
  }

  const links = [
    { href: '/', label: 'Analysis' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 flex items-center h-14 gap-6">
        <Link href="/" className="font-semibold text-sm tracking-tight text-gray-900 dark:text-gray-100 shrink-0">
          Fundamental
        </Link>

        <div className="flex gap-1 flex-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === l.href
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <button
          onClick={toggleTheme}
          className="px-2.5 py-1.5 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? '☀️' : '🌙'}
        </button>

        {/* User avatar + dropdown */}
        {session?.user && (
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="block overflow-hidden rounded-full ring-2 ring-transparent hover:ring-gray-300 dark:hover:ring-gray-600 transition-all"
            >
              <img
                src={session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || '?')}&background=6B7280&color=fff&size=32`}
                alt={session.user.name || 'User'}
                className="w-7 h-7 rounded-full object-cover"
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 z-50 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {session.user.email}
                  </p>
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full text-left px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
