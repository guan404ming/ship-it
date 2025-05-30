"use client";

import { LoginForm } from "@/components/login-form";
import { useSession } from "next-auth/react";

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
    <div className="flex flex-col items-center justify-center h-screen">
      {children}
    </div>
  );
}
