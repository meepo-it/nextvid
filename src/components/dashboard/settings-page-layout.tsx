import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import type { DashboardBreadcrumbItem } from '@/components/dashboard/dashboard-header';

interface SettingsPageLayoutProps {
  breadcrumbs: DashboardBreadcrumbItem[];
  title: string;
  description: string;
  children: React.ReactNode;
}

/**
 * Shared layout for settings pages
 * header with breadcrumbs + title/description + content
 */
export function SettingsPageLayout({
  breadcrumbs,
  title,
  description,
  children,
}: SettingsPageLayoutProps) {
  return (
    <>
      <DashboardHeader breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6 space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground mt-2">{description}</p>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
