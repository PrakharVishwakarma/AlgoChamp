// /apps/web/app/(admin)/admin/layout.tsx

import { AdminSidebar } from './_components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex h-screen w-full bg-background">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}