import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Catálogo de orçamentos — Renovar BR" },
      { name: "description", content: "Área interna de orçamentos e empreendimentos da Renovar BR." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Catálogo de orçamentos — Renovar BR" },
      { property: "og:description", content: "Área interna de orçamentos da Renovar BR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => (await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" })).data === true,
  });

  async function sair() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <Link to="/admin" aria-label="Catálogo de orçamentos"><Logo /></Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Ver site</Link>
            <button onClick={sair} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:border-primary">
              <LogOut className="h-4 w-4" aria-hidden /> Sair
            </button>
          </div>
        </div>
      </header>
      {isLoading ? (
        <p className="p-10 text-center text-muted-foreground">Carregando…</p>
      ) : isAdmin ? (
        <Outlet />
      ) : (
        <p className="p-10 text-center text-muted-foreground">Esta conta não tem acesso administrativo.</p>
      )}
    </div>
  );
}
