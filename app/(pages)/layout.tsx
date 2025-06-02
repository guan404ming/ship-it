"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LoginForm } from "@/components/login-form";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { Toaster } from "sonner";

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();

  if (status === "unauthenticated") {
    return <LoginForm />;
  }

  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-col items-center justify-center h-full w-full">
          {children}
          <Toaster />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
