// /apps/web/app/(admin)/admin/_components/AdminSidebar.tsx

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/Logo'; // Assuming you have this
import {
  LayoutDashboard,
  ClipboardList,
  Trophy,
  Users,
  LineChart,
} from 'lucide-react'; // Using lucide-react for icons

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

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden h-full w-64 flex-col border-r bg-muted/40 md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Logo />
          <span className="">AlgoChamp Admin</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/admin'
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}