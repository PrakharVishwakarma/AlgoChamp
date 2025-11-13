// /apps/web/app/(admin)/admin/_components/AdminSidebar.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme } from '@/context/ThemeContext';
import { Logo } from '@/components/Logo';
import {
  LayoutDashboard,
  ClipboardList,
  Trophy,
  Users,
  LineChart,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  Monitor,
} from 'lucide-react';

const navItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Contests',
    href: '/admin/contests',
    icon: Trophy,
  },
  {
    name: 'Problems',
    href: '/admin/problems',
    icon: ClipboardList,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: LineChart,
  },
];

/**
 * Enhanced AdminSidebar with:
 * - Collapse/expand functionality (desktop)
 * - Mobile menu with overlay
 * - Theme toggle (light/dark/system)
 * - Logout button
 * - Active link highlighting
 * - Smooth animations
 * - Accessibility features
 */
export function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile Menu Button - Fixed at top left */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border bg-background p-2 shadow-md md:hidden"
        aria-label="Open navigation menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileMenu}
          aria-label="Close navigation menu"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen flex-col border-r bg-background
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-64'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        aria-label="Admin navigation sidebar"
      >
        {/* Header with Logo and Collapse Button */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          {!isCollapsed && (
            <Link
              href="/admin"
              className="flex items-center gap-2 font-semibold transition-opacity hover:opacity-80"
              onClick={closeMobileMenu}
            >
              <Logo />
              <span className="text-lg">AlgoChamp</span>
            </Link>
          )}

          {isCollapsed && (
            <Link
              href="/admin"
              className="mx-auto transition-opacity hover:opacity-80"
              onClick={closeMobileMenu}
              title="AlgoChamp Admin"
            >
              <Logo />
            </Link>
          )}

          {/* Collapse/Expand Button (Desktop) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden rounded-lg p-2 hover:bg-muted md:block"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>

          {/* Close Button (Mobile) */}
          <button
            onClick={closeMobileMenu}
            className="rounded-lg p-2 hover:bg-muted md:hidden"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 overflow-y-auto p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobileMenu}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2 transition-all
                  ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? item.name : undefined}
                aria-label={item.name}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer with Theme Toggle and Logout */}
        <div className="border-t p-4">
          <div className="space-y-2">
            {/* Theme Toggle */}
            <ThemeToggle
              isCollapsed={isCollapsed}
              theme={theme}
              setTheme={setTheme}
            />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`
                flex w-full items-center gap-3 rounded-lg px-3 py-2
                text-muted-foreground transition-all
                hover:bg-destructive hover:text-destructive-foreground
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? 'Logout' : undefined}
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer to prevent content from going under sidebar (Desktop) */}
      <div
        className={`
          hidden md:block
          transition-all duration-300
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      />
    </>
  );
}

/**
 * Theme Toggle Component with Light/Dark/System options
 */
function ThemeToggle({
  isCollapsed,
  theme,
  setTheme,
}: {
  isCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}) {
  const [showOptions, setShowOptions] = useState(false);

  const toggleTheme = () => {
    if (isCollapsed) {
      // Cycle through themes when collapsed
      if (theme === 'light') setTheme('dark');
      else if (theme === 'dark') setTheme('system');
      else setTheme('light');
    } else {
      setShowOptions(!showOptions);
    }
  };

  const themeOptions: Array<{
    value: 'light' | 'dark' | 'system';
    label: string;
    icon: typeof Sun;
  }> = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currentThemeIcon =
    theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const CurrentIcon = currentThemeIcon;

  return (
    <div className="relative">
      <button
        onClick={toggleTheme}
        className={`
          flex w-full items-center gap-3 rounded-lg px-3 py-2
          text-muted-foreground transition-all
          hover:bg-muted hover:text-foreground
          ${isCollapsed ? 'justify-center' : ''}
        `}
        title={isCollapsed ? `Theme: ${theme}` : 'Toggle theme'}
        aria-label="Toggle theme"
      >
        <CurrentIcon className="h-5 w-5 flex-shrink-0" />
        {!isCollapsed && <span className="font-medium">Theme</span>}
      </button>

      {/* Theme Options Dropdown (Expanded Mode) */}
      {showOptions && !isCollapsed && (
        <div className="absolute bottom-full left-0 mb-2 w-full rounded-lg border bg-popover p-2 shadow-lg">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setShowOptions(false);
                }}
                className={`
                  flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm
                  transition-colors
                  ${
                    theme === option.value
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/50'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}