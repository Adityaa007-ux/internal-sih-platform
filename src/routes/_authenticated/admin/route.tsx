import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useSession } from "@/hooks/useSession";
import { ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { role, isLoading } = useSession();
  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Checking permissions…</p>;
  if (role !== "admin") {
    return (
      <div className="surface-card mx-auto mt-10 max-w-md p-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-danger-soft text-danger">
          <ShieldAlert className="size-6" />
        </span>
        <h1 className="mt-4 font-display text-lg font-bold">Admin access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account does not hold the administrator role. Every admin action is also verified in the database, so
          this area cannot be unlocked from the browser.
        </p>
      </div>
    );
  }
  return <Outlet />;
}
