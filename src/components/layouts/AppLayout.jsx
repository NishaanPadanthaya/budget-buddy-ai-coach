
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layouts/AppSidebar";

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
