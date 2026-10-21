import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/orcamento";

export const Route = createFileRoute("/_authenticated/admin/produtos")({ head: () => ({ meta: [
  { title: "Produtos e preços — Renovar BR" },
  { name: "description", content: "Catálogo interno de materiais e preços da Renovar BR." },
  { property: "og:title", content: "Produtos e preços — Renovar BR" },
  { property: "og:description", content: "Catálogo de materiais para orçamentos da Renovar BR." },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary" },
  { name: "robots", content: "noindex, nofollow" },
] }), component: Produtos });

type Produto = { id: string; nome: string; unidade: string; preco: number; quantidade: number };

const inp = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";
const num = (v: string) => (v === "" ? 0 : Number(v.replace(",", ".")) || 0);
const UNIDADES = ["un", "m²", "m", "lata", "galão", "kg", "saco", "vb"];

function Produtos() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("produtos").select("*").order("nome");
      if (error) throw error;
      return data as Produto[];
    },
  });
  // Local edits per product id; only sent to the database on "Salvar".
  const [edits, setEdits] = useState<Record<string, Partial<Produto>>>({});
  const [salvando, setSalvando] = useState<string | null>(null);

  const valor = (p: Produto, campo: keyof Produto) => (edits[p.id]?.[campo] ?? p[campo]) as string & number;
  const editar = (id: string, campo: keyof Produto, v: string | number) =>
    setEdits((e) => ({ ...e, [id]: { ...e[id], [campo]: v } }));
  const sujo = (id: string) => !!edits[id] && Object.keys(edits[id]!).length > 0;

  async function novo() {
    const { data, error } = await supabase.from("produtos").insert({ nome: "Novo produto" } as never).select("id").single();
    if (error) { toast.error(`Não foi possível criar o produto: ${error.message}`); return; }
    qc.invalidateQueries({ queryKey: ["produtos"] });
    setEdits((e) => ({ ...e, [data.id]: {} }));
  }

  async function salvar(p: Produto) {
    const mud = edits[p.id];
    if (!mud) return;
    setSalvando(p.id);
    const { error } = await supabase.from("produtos").update({
      nome: String(mud.nome ?? p.nome).trim() || p.nome,
      unidade: String(mud.unidade ?? p.unidade),
      preco: Number(mud.preco ?? p.preco) || 0,
      quantidade: Number(mud.quantidade ?? p.quantidade) || 1,
      updated_at: new Date().toISOString(),
    } as never).eq("id", p.id);
    setSalvando(null);
    if (error) { toast.error(`Erro ao salvar ${p.nome}: ${error.message}`); return; }
    setEdits((e) => { const n = { ...e }; delete n[p.id]; return n; });
    toast.success("Produto salvo.");
    qc.invalidateQueries({ queryKey: ["produtos"] });
  }

  async function excluir(p: Produto) {
    if (!confirm(`Excluir "${p.nome}" do catálogo? Orçamentos que já usam este produto não são alterados.`)) return;
    const { error } = await supabase.from("produtos").delete().eq("id", p.id);
    if (error) { toast.error(`Não foi possível excluir: ${error.message}`); return; }
    toast.success("Produto excluído.");
    qc.invalidateQueries({ queryKey: ["produtos"] });
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" aria-hidden /> Voltar</Link>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Catálogo interno</p>
          <h1 className="mt-2 text-3xl font-black uppercase md:text-4xl">Produtos e preços</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">Cadastre aqui os materiais que você mais usa. Na ficha do empreendimento, na seção Materiais, você escolhe o produto na lista e ele já entra no orçamento com unidade, quantidade e preço.</p>
        </div>
        <button onClick={novo} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground hover:brightness-110"><Plus className="h-5 w-5" aria-hidden /> Novo produto</button>
      </div>

      {isLoading ? <p className="mt-10 text-muted-foreground">Carregando…</p> : data.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">Nenhum produto ainda. Clique em "Novo produto" para cadastrar o primeiro.</p>
      ) : (
        <div className="mt-8 space-y-3">
          <div className="hidden gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid md:grid-cols-[1fr_90px_110px_130px_96px_36px]">
            <span>Produto</span><span>Unidade</span><span>Qtd. padrão</span><span>Preço / un. (R$)</span><span /><span />
          </div>
          {data.map((p) => (
            <div key={p.id} className="grid grid-cols-2 gap-2 rounded-md border border-border p-3 md:grid-cols-[1fr_90px_110px_130px_96px_36px] md:items-center md:border-0 md:p-0 [&>*:first-child]:col-span-2 md:[&>*:first-child]:col-span-1">
              <label className="block"><span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground md:sr-only">Produto</span>
                <input className={inp} value={valor(p, "nome")} onChange={(e) => editar(p.id, "nome", e.target.value)} /></label>
              <label className="block"><span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground md:sr-only">Unidade</span>
                <select className={inp} value={valor(p, "unidade")} onChange={(e) => editar(p.id, "unidade", e.target.value)}>{UNIDADES.map((u) => <option key={u}>{u}</option>)}</select></label>
              <label className="block"><span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground md:sr-only">Quantidade padrão</span>
                <input className={inp} inputMode="decimal" value={valor(p, "quantidade") || ""} onChange={(e) => editar(p.id, "quantidade", num(e.target.value))} /></label>
              <label className="block"><span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground md:sr-only">Preço por unidade (R$)</span>
                <input className={inp} inputMode="decimal" value={valor(p, "preco") || ""} onChange={(e) => editar(p.id, "preco", num(e.target.value))} /></label>
              <button onClick={() => salvar(p)} disabled={!sujo(p.id) || salvando === p.id} className="inline-flex items-center justify-center gap-1 rounded-md bg-secondary px-3 py-2 text-sm font-bold hover:brightness-125 disabled:opacity-40">
                <Save className="h-4 w-4" aria-hidden />{salvando === p.id ? "…" : "Salvar"}
              </button>
              <button onClick={() => excluir(p)} aria-label={`Excluir ${p.nome}`} className="flex items-center justify-center rounded-md border border-border hover:border-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <p className="pt-2 text-xs text-muted-foreground">Preço de referência: ao usar o produto na ficha, a quantidade e o preço entram preenchidos, mas podem ser ajustados em cada orçamento sem alterar o catálogo.</p>
        </div>
      )}
    </main>
  );
}

export { brl as _brlProdutos };
