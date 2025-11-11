// /apps/web/app/(admin)/admin/layout.tsx
import { getServerSession } from 'next-auth'; 
import { redirect } from 'next/navigation';
import { AdminSidebar } from './_components/AdminSidebar';
import { UserRole } from '@prisma/client';
import { authOptions } from '../../lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Session check at the layout level (defense-in-depth)
  const session = await getServerSession(authOptions);
  console.log('AdminLayout session:', session);
    
  // 2. Redirect if not authenticated or not an admin
  if (!session || !session.user || session.user.role !== UserRole.ADMIN) {
    // We can redirect to /dashboard since middleware should have caught
    // unauthenticated users already.
    redirect('/dashboard');
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}