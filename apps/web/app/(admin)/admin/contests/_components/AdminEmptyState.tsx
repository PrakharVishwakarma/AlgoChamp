// /apps/web/app/(admin)/admin/contests/_components/AdminEmptyState.tsx

import { Inbox } from 'lucide-react'; // Or any other icon you prefer

interface AdminEmptyStateProps {
  title: string;
  description: string;
}

export function AdminEmptyState({
  title,
  description,
}: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}