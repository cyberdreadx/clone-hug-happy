import { ReactNode } from "react";
import { useRequireAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  actions?: ReactNode;
}

const AdminLayout = ({ children, title, actions }: AdminLayoutProps) => {
  useRequireAuth("admin");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full dark bg-sidebar-background text-sidebar-foreground">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-14 flex items-center justify-between border-b border-sidebar-border px-6 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-sidebar-foreground/60 hover:text-sidebar-foreground" />
              <h1 className="font-serif text-lg text-sidebar-foreground">{title}</h1>
            </div>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
