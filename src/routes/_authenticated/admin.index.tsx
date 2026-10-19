import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, FileText, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brl, calcular, custosVazios, type Custos } from "@/lib/orcamento";

export const Route = createFileRoute("/_authenticated/admin/")({ head: () => ({ meta: [
  { title: "Empreendimentos — Renovar BR" },
  { name: "description", content: "Catálogo interno de empreendimentos da Renovar BR." },
  { property: "og:title", content: "Empreendimentos — Renovar BR" },
  { property: "og:description", content: "Gestão de empreendimentos e propostas da Renovar BR." },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary" },
  { name: "robots", content: "noindex, nofollow" },
] }), component: AdminHome });

function AdminHome() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data = [], isLoading } = useQuery({
    queryKey: ["empreendimentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("empreendimentos").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function novo() {
    const { data, error } = await supabase.from("empreendimentos").insert({}).select("id").single();
    if (error) { toast.error("Não foi possível criar."); return; }
    navigate({ to: "/admin/$id", params: { id: data.id } });
  }

  async function togglePublicado(id: string, publicado: boolean) {
    const { error } = await supabase.from("empreendimentos").update({ publicado: !publicado }).eq("id", id);
    if (error) { toast.error("Erro ao atualizar."); return; }
    toast.success(!publicado ? "Agora aparece no site." : "Removido do site.");
    qc.invalidateQueries({ queryKey: ["empreendimentos"] });
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Catálogo de orçamentos</p>
          <h1 className="mt-2 text-3xl font-black uppercase md:text-5xl">Empreendimentos</h1>
        </div>
        <button onClick={novo} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground hover:brightness-110">
          <Plus className="h-5 w-5" aria-hidden /> Novo empreendimento
        </button>
      </div>

      {isLoading ? <p className="mt-10 text-muted-foreground">Carregando…</p> : data.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">Nenhum empreendimento ainda. Clique em "Novo empreendimento" para preencher a primeira ficha técnica.</p>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.map((e) => {
            const total = calcular({ ...custosVazios, ...(e.custos as Partial<Custos>) }).precoFinal;
            const cliente = (e.cliente as { nome?: string })?.nome;
            return (
              <article key={e.id} className="flex flex-col rounded-xl border border-border bg-card p-5 transition hover:border-primary/50">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent">{e.status}</span>
                  {e.publicado && <span className="text-xs font-bold uppercase text-primary">No site</span>}
                </div>
                <h2 className="mt-4 font-display text-xl font-bold">{e.titulo}</h2>
                {cliente && <p className="text-sm text-muted-foreground">Cliente: {cliente}</p>}
                {(e.endereco || e.cidade) && <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" aria-hidden />{[e.endereco, e.cidade].filter(Boolean).join(" — ")}</p>}
                <p className="mt-4 text-2xl font-black text-primary">{brl(total)}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-5">
                  <Link to="/admin/$id" params={{ id: e.id }} className="rounded-md bg-secondary px-3 py-2 text-sm font-semibold hover:brightness-125">Abrir ficha</Link>
                  <Link to="/admin/$id/orcamento" params={{ id: e.id }} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:border-primary"><FileText className="h-4 w-4" aria-hidden />Orçamento</Link>
                  <button onClick={() => togglePublicado(e.id, e.publicado)} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm hover:border-primary">
                    {e.publicado ? <><EyeOff className="h-4 w-4" aria-hidden />Tirar do site</> : <><Eye className="h-4 w-4" aria-hidden />Mostrar no site</>}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
