import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, FileText, ImagePlus, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { cidadesAtendidas } from "@/data/cidades";
import { supabase } from "@/integrations/supabase/client";
import {
  brl, calcular, clienteVazio, custosVazios, dadosVazios, uid,
  type Cliente, type Custos, type Dados,
} from "@/lib/orcamento";

export const Route = createFileRoute("/_authenticated/admin/$id")({ head: () => ({ meta: [
  { title: "Ficha técnica — Renovar BR" },
  { name: "description", content: "Ficha técnica e custos do empreendimento na Renovar BR." },
  { property: "og:title", content: "Ficha técnica — Renovar BR" },
  { property: "og:description", content: "Dados técnicos do empreendimento na Renovar BR." },
  { property: "og:type", content: "website" },
  { name: "twitter:card", content: "summary" },
  { name: "robots", content: "noindex, nofollow" },
] }), component: Ficha });

type Geral = { titulo: string; cidade: string; endereco: string; status: string; etapa: string; prazo: string; publicado: boolean; fotos: string[] };

const CIDADES = [...cidadesAtendidas, "Outra"];
const STATUS = ["Orçamento", "Aguardando aprovação", "Aprovado", "Em andamento", "Acabamento e finalização", "Concluída"];
const UNIDADES = ["m²", "m", "un", "vb", "h"];

const inp = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

function F({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`block text-xs font-semibold uppercase tracking-wider text-muted-foreground ${className}`}>{label}<div className="mt-1 normal-case tracking-normal">{children}</div></label>;
}
function Sec({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 md:p-7">
      <h2 className="flex items-center gap-3 font-display text-xl font-bold"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">{n}</span>{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
const num = (v: string) => (v === "" ? 0 : Number(v.replace(",", ".")) || 0);
const MAX_FOTO = 10 * 1024 * 1024;
// Visible label on mobile, screen-reader-only on desktop where the column headers show.
function C({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block min-w-0"><span className="mb-1 block text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground md:sr-only">{label}</span>{children}</label>;
}

function Ficha() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["empreendimento", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("empreendimentos").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [g, setG] = useState<Geral | null>(null);
  const [c, setC] = useState<Cliente>(clienteVazio);
  const [d, setD] = useState<Dados>(dadosVazios);
  const [k, setK] = useState<Custos>(custosVazios);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [enviando, setEnviando] = useState(false);
  // Photos removed in the form are only deleted from storage after a successful save.
  const [pendRemove, setPendRemove] = useState<string[]>([]);
  // Photos uploaded but not yet saved; cleaned up if the admin leaves without saving.
  const novasRef = useRef<string[]>([]);
  useEffect(() => {
    const aviso = (e: BeforeUnloadEvent) => { if (novasRef.current.length) e.preventDefault(); };
    window.addEventListener("beforeunload", aviso);
    return () => {
      window.removeEventListener("beforeunload", aviso);
      if (novasRef.current.length) { void supabase.storage.from("obras").remove(novasRef.current); novasRef.current = []; }
    };
  }, []);

  useEffect(() => {
    if (!data) return;
    setG({ titulo: data.titulo, cidade: data.cidade, endereco: data.endereco, status: data.status, etapa: data.etapa, prazo: data.prazo ?? "", publicado: data.publicado, fotos: data.fotos });
    setC({ ...clienteVazio, ...(data.cliente as Partial<Cliente>) });
    setD({ ...dadosVazios, ...(data.dados as Partial<Dados>) });
    const kk = data.custos as Partial<Custos>;
    setK({ ...custosVazios, ...kk, outros: { ...custosVazios.outros, ...(kk.outros ?? {}) } });
  }, [data]);

  useEffect(() => {
    if (!g?.fotos.length) return;
    supabase.storage.from("obras").createSignedUrls(g.fotos, 3600).then(({ data }) => {
      const m: Record<string, string> = {};
      data?.forEach((x) => { if (x.path && x.signedUrl) m[x.path] = x.signedUrl; });
      setUrls(m);
    });
  }, [g?.fotos]);

  if (isLoading || (data && !g)) return <p className="p-10 text-center text-muted-foreground">Carregando…</p>;
  if (!data || !g) return <p className="p-10 text-center text-muted-foreground">Empreendimento não encontrado.</p>;

  const t = calcular(k);
  const setGe = (p: Partial<Geral>) => setG({ ...g, ...p });

  async function salvar() {
    setSaving(true);
    try {
      const { error } = await supabase.from("empreendimentos").update({
        ...g!, prazo: g!.prazo || null, cliente: c, dados: d, custos: k, updated_at: new Date().toISOString(),
      } as never).eq("id", id);
      if (error) { toast.error(`Erro ao salvar a ficha: ${error.message}`); return false; }
      novasRef.current = [];
      if (pendRemove.length) {
        const { error: e2 } = await supabase.storage.from("obras").remove(pendRemove);
        if (e2) toast.warning("Ficha salva, mas algumas fotos removidas não puderam ser apagadas do armazenamento.");
        setPendRemove([]);
      }
      toast.success("Ficha salva.");
      qc.invalidateQueries({ queryKey: ["empreendimentos"] });
      qc.invalidateQueries({ queryKey: ["empreendimento", id] });
      qc.invalidateQueries({ queryKey: ["obras-publicas"] });
      return true;
    } catch (e) {
      toast.error(`Erro ao salvar a ficha: ${e instanceof Error ? e.message : "falha de conexão"}`);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function excluir() {
    if (!confirm("Excluir este empreendimento e todas as fotos dele? Essa ação não pode ser desfeita.")) return;
    try {
      // Delete the record first so a failure never leaves it pointing at missing photos.
      const { error } = await supabase.from("empreendimentos").delete().eq("id", id);
      if (error) { toast.error(`Não foi possível excluir: ${error.message}`); return; }
      const arquivos = Array.from(new Set([...g!.fotos, ...pendRemove, ...novasRef.current]));
      novasRef.current = [];
      if (arquivos.length) {
        const { error: e2 } = await supabase.storage.from("obras").remove(arquivos);
        if (e2) toast.warning("Empreendimento excluído, mas algumas fotos não puderam ser apagadas do armazenamento.");
      }
      toast.success("Empreendimento excluído.");
      qc.invalidateQueries({ queryKey: ["empreendimentos"] });
      qc.invalidateQueries({ queryKey: ["obras-publicas"] });
      navigate({ to: "/admin" });
    } catch (e) {
      toast.error(`Não foi possível excluir: ${e instanceof Error ? e.message : "falha de conexão"}`);
    }
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setEnviando(true);
    const novas: string[] = [];
    try {
      for (const f of Array.from(files)) {
        if (!f.type.startsWith("image/")) { toast.error(`${f.name}: envie apenas imagens (JPG, PNG, WEBP…).`); continue; }
        if (f.size > MAX_FOTO) { toast.error(`${f.name}: a foto passa de 10 MB. Reduza o tamanho e tente de novo.`); continue; }
        const path = `${id}/${Date.now()}-${f.name.replace(/[^\w.-]/g, "_")}`;
        const { error } = await supabase.storage.from("obras").upload(path, f);
        if (error) toast.error(`Falha ao enviar ${f.name}: ${error.message}`); else novas.push(path);
      }
    } catch (e) {
      toast.error(`Falha ao enviar fotos: ${e instanceof Error ? e.message : "falha de conexão"}`);
    } finally {
      setEnviando(false);
    }
    if (novas.length) {
      novasRef.current = [...novasRef.current, ...novas];
      setG((prev) => (prev ? { ...prev, fotos: [...prev.fotos, ...novas] } : prev));
      toast.success("Foto enviada. Clique em Salvar para manter.");
    }
  }

  async function removerFoto(p: string) {
    if (novasRef.current.includes(p)) {
      // Never saved: safe to delete immediately.
      const { error } = await supabase.storage.from("obras").remove([p]);
      if (error) { toast.error(`Não foi possível remover a foto: ${error.message}`); return; }
      novasRef.current = novasRef.current.filter((x) => x !== p);
    } else {
      setPendRemove((r) => [...r, p]);
      toast.info("A foto será apagada ao salvar a ficha.");
    }
    setG((prev) => (prev ? { ...prev, fotos: prev.fotos.filter((x) => x !== p) } : prev));
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" aria-hidden /> Voltar</Link>
        <div className="flex flex-wrap gap-2">
          <button onClick={excluir} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-destructive hover:border-destructive"><Trash2 className="h-4 w-4" aria-hidden />Excluir</button>
          <button onClick={salvar} disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-bold hover:brightness-125"><Save className="h-4 w-4" aria-hidden />{saving ? "Salvando…" : "Salvar"}</button>
          <button onClick={async () => { if (await salvar()) navigate({ to: "/admin/$id/orcamento", params: { id } }); }} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110"><FileText className="h-4 w-4" aria-hidden />Gerar Orçamento</button>
        </div>
      </div>

      <h1 className="mt-6 text-3xl font-black uppercase md:text-4xl">Ficha técnica</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Sec n={1} title="Dados do cliente">
            <div className="grid gap-4 md:grid-cols-2">
              <F label="Nome / razão social"><input className={inp} value={c.nome} onChange={(e) => setC({ ...c, nome: e.target.value })} /></F>
              <F label="Tipo de cliente">
                <select className={inp} value={c.tipo} onChange={(e) => setC({ ...c, tipo: e.target.value })}>
                  {["Residencial", "Comercial", "Construtora", "Engenheiro", "Arquiteto", "Administradora de condomínio", "Condomínio"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </F>
              <F label="CPF / CNPJ"><input className={inp} value={c.documento} onChange={(e) => setC({ ...c, documento: e.target.value })} /></F>
              <F label="Pessoa de contato"><input className={inp} value={c.contato} onChange={(e) => setC({ ...c, contato: e.target.value })} /></F>
              <F label="Telefone / WhatsApp"><input className={inp} inputMode="tel" value={c.telefone} onChange={(e) => setC({ ...c, telefone: e.target.value })} /></F>
              <F label="E-mail"><input className={inp} type="email" value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} /></F>
              <F label="Endereço do cliente" className="md:col-span-2"><input className={inp} value={c.endereco} onChange={(e) => setC({ ...c, endereco: e.target.value })} /></F>
            </div>
          </Sec>

          <Sec n={2} title="Dados do empreendimento">
            <div className="grid gap-4 md:grid-cols-2">
              <F label="Nome do empreendimento / obra" className="md:col-span-2"><input className={inp} value={g.titulo} onChange={(e) => setGe({ titulo: e.target.value })} /></F>
              <F label="Tipo de obra">
                <select className={inp} value={d.tipo} onChange={(e) => setD({ ...d, tipo: e.target.value })}>
                  {["Residencial", "Comercial", "Predial / condomínio", "Industrial", "Fachada"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </F>
              <F label="Cidade">
                <select className={inp} value={g.cidade} onChange={(e) => setGe({ cidade: e.target.value })}>
                  <option value="">Selecione</option>{CIDADES.map((x) => <option key={x}>{x}</option>)}
                </select>
              </F>
              <F label="Endereço da obra"><input className={inp} value={g.endereco} onChange={(e) => setGe({ endereco: e.target.value })} /></F>
              <F label="Bairro"><input className={inp} value={d.bairro} onChange={(e) => setD({ ...d, bairro: e.target.value })} /></F>
              <F label="Área total (m²)"><input className={inp} inputMode="decimal" value={d.areaTotal || ""} onChange={(e) => setD({ ...d, areaTotal: num(e.target.value) })} /></F>
              <div className="grid grid-cols-2 gap-4">
                <F label="Pavimentos"><input className={inp} inputMode="numeric" value={d.pavimentos || ""} onChange={(e) => setD({ ...d, pavimentos: num(e.target.value) })} /></F>
                <F label="Unidades"><input className={inp} inputMode="numeric" value={d.unidades || ""} onChange={(e) => setD({ ...d, unidades: num(e.target.value) })} /></F>
              </div>
              <F label="Condição atual das superfícies"><input className={inp} placeholder="Ex.: fissuras, umidade, pintura descascando" value={d.condicao} onChange={(e) => setD({ ...d, condicao: e.target.value })} /></F>
              <F label="Acesso / altura"><input className={inp} placeholder="Ex.: balancim, andaime, escada" value={d.acesso} onChange={(e) => setD({ ...d, acesso: e.target.value })} /></F>
              <F label="Data da visita técnica"><input type="date" className={inp} value={d.dataVisita} onChange={(e) => setD({ ...d, dataVisita: e.target.value })} /></F>
              <F label="Início previsto"><input type="date" className={inp} value={d.inicioPrevisto} onChange={(e) => setD({ ...d, inicioPrevisto: e.target.value })} /></F>
              <F label="Observações técnicas" className="md:col-span-2"><textarea rows={3} className={inp} value={d.observacoes} onChange={(e) => setD({ ...d, observacoes: e.target.value })} /></F>
            </div>
          </Sec>

          <Sec n={3} title="Levantamento de serviços (mão de obra)">
            <Linhas
              cols={["Serviço", "Un.", "Qtd.", "M.O. / un. (R$)"]}
              rows={k.itens}
              onAdd={() => setK({ ...k, itens: [...k.itens, { id: uid(), descricao: "", unidade: "m²", quantidade: 0, maoObraUnit: 0 }] })}
              onRemove={(rid) => setK({ ...k, itens: k.itens.filter((x) => x.id !== rid) })}
              render={(r) => (<>
                <C label="Serviço"><input className={inp} placeholder="Ex.: Pintura interna 2 demãos" value={r.descricao} onChange={(e) => setK({ ...k, itens: k.itens.map((x) => x.id === r.id ? { ...x, descricao: e.target.value } : x) })} /></C>
                <C label="Unidade"><select className={inp} value={r.unidade} onChange={(e) => setK({ ...k, itens: k.itens.map((x) => x.id === r.id ? { ...x, unidade: e.target.value } : x) })}>{UNIDADES.map((u) => <option key={u}>{u}</option>)}</select></C>
                <C label="Quantidade"><input className={inp} inputMode="decimal" value={r.quantidade || ""} onChange={(e) => setK({ ...k, itens: k.itens.map((x) => x.id === r.id ? { ...x, quantidade: num(e.target.value) } : x) })} /></C>
                <C label="Mão de obra por unidade (R$)"><input className={inp} inputMode="decimal" value={r.maoObraUnit || ""} onChange={(e) => setK({ ...k, itens: k.itens.map((x) => x.id === r.id ? { ...x, maoObraUnit: num(e.target.value) } : x) })} /></C>
              </>)}
              total={brl(t.maoObra)}
            />
          </Sec>

          <Sec n={4} title="Materiais">
            <Linhas
              cols={["Material", "Un.", "Qtd.", "Preço / un. (R$)"]}
              rows={k.materiais}
              onAdd={() => setK({ ...k, materiais: [...k.materiais, { id: uid(), descricao: "", unidade: "un", quantidade: 0, precoUnit: 0 }] })}
              onRemove={(rid) => setK({ ...k, materiais: k.materiais.filter((x) => x.id !== rid) })}
              render={(r) => (<>
                <C label="Material"><input className={inp} placeholder="Ex.: Tinta acrílica 18L" value={r.descricao} onChange={(e) => setK({ ...k, materiais: k.materiais.map((x) => x.id === r.id ? { ...x, descricao: e.target.value } : x) })} /></C>
                <C label="Unidade"><input className={inp} placeholder="un, lata, galão" value={r.unidade} onChange={(e) => setK({ ...k, materiais: k.materiais.map((x) => x.id === r.id ? { ...x, unidade: e.target.value } : x) })} /></C>
                <C label="Quantidade"><input className={inp} inputMode="decimal" value={r.quantidade || ""} onChange={(e) => setK({ ...k, materiais: k.materiais.map((x) => x.id === r.id ? { ...x, quantidade: num(e.target.value) } : x) })} /></C>
                <C label="Preço por unidade (R$)"><input className={inp} inputMode="decimal" value={r.precoUnit || ""} onChange={(e) => setK({ ...k, materiais: k.materiais.map((x) => x.id === r.id ? { ...x, precoUnit: num(e.target.value) } : x) })} /></C>
              </>)}
              total={brl(t.materiais)}
            />
          </Sec>

          <Sec n={5} title="Equipamentos">
            <Linhas
              cols={["Equipamento", "Dias", "Valor / dia (R$)"]}
              rows={k.equipamentos}
              onAdd={() => setK({ ...k, equipamentos: [...k.equipamentos, { id: uid(), descricao: "", dias: 0, valorDia: 0 }] })}
              onRemove={(rid) => setK({ ...k, equipamentos: k.equipamentos.filter((x) => x.id !== rid) })}
              render={(r) => (<>
                <C label="Equipamento"><input className={inp} placeholder="Ex.: Andaime, balancim" value={r.descricao} onChange={(e) => setK({ ...k, equipamentos: k.equipamentos.map((x) => x.id === r.id ? { ...x, descricao: e.target.value } : x) })} /></C>
                <C label="Dias"><input className={inp} inputMode="decimal" value={r.dias || ""} onChange={(e) => setK({ ...k, equipamentos: k.equipamentos.map((x) => x.id === r.id ? { ...x, dias: num(e.target.value) } : x) })} /></C>
                <C label="Valor por dia (R$)"><input className={inp} inputMode="decimal" value={r.valorDia || ""} onChange={(e) => setK({ ...k, equipamentos: k.equipamentos.map((x) => x.id === r.id ? { ...x, valorDia: num(e.target.value) } : x) })} /></C>
              </>)}
              total={brl(t.equipamentos)}
            />
          </Sec>

          <Sec n={6} title="Outros custos">
            <div className="grid gap-4 md:grid-cols-3">
              {([["transporte", "Transporte"], ["alimentacao", "Alimentação"], ["descarte", "Descarte / caçamba"], ["art", "ART / taxas"], ["diversos", "Diversos"]] as const).map(([key, label]) => (
                <F key={key} label={`${label} (R$)`}><input className={inp} inputMode="decimal" value={k.outros[key] || ""} onChange={(e) => setK({ ...k, outros: { ...k.outros, [key]: num(e.target.value) } })} /></F>
              ))}
            </div>
          </Sec>

          <Sec n={7} title="Prazos e condições">
            <div className="grid gap-4 md:grid-cols-3">
              <F label="Prazo de execução (dias)"><input className={inp} inputMode="numeric" value={k.prazoDias || ""} onChange={(e) => setK({ ...k, prazoDias: num(e.target.value) })} /></F>
              <F label="Data de entrega"><input type="date" className={inp} value={g.prazo} onChange={(e) => setGe({ prazo: e.target.value })} /></F>
              <F label="Validade da proposta (dias)"><input className={inp} inputMode="numeric" value={k.validadeDias || ""} onChange={(e) => setK({ ...k, validadeDias: num(e.target.value) })} /></F>
              <F label="Condições de pagamento" className="md:col-span-3"><textarea rows={2} className={inp} placeholder="Ex.: 30% na assinatura, saldo por etapa concluída" value={k.pagamento} onChange={(e) => setK({ ...k, pagamento: e.target.value })} /></F>
              <F label="Garantia" className="md:col-span-3"><input className={inp} value={k.garantia} onChange={(e) => setK({ ...k, garantia: e.target.value })} /></F>
              <F label="Observações do orçamento (aparecem no PDF)" className="md:col-span-3"><textarea rows={3} className={inp} value={k.observacoes} onChange={(e) => setK({ ...k, observacoes: e.target.value })} /></F>
            </div>
          </Sec>

          <Sec n={8} title="Card no site público">
            <div className="grid gap-4 md:grid-cols-2">
              <F label="Status"><select className={inp} value={g.status} onChange={(e) => setGe({ status: e.target.value })}>{STATUS.map((x) => <option key={x}>{x}</option>)}</select></F>
              <F label="Etapa atual (texto do card)"><input className={inp} placeholder="Ex.: Etapa atual: preparação" value={g.etapa} onChange={(e) => setGe({ etapa: e.target.value })} /></F>
            </div>
            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-md border border-border p-4">
              <input type="checkbox" className="h-5 w-5 accent-[var(--primary)]" checked={g.publicado} onChange={(e) => setGe({ publicado: e.target.checked })} />
              <span><span className="font-bold">Mostrar este empreendimento no site</span><span className="block text-sm text-muted-foreground">No site aparecem só nome, cidade, endereço, status, etapa, prazo e fotos. Dados do cliente e valores nunca aparecem.</span></span>
            </label>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fotos da obra</p>
              <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
                {g.fotos.map((p) => (
                  <div key={p} className="relative overflow-hidden rounded-md border border-border">
                    {urls[p] ? <img src={urls[p]} alt="Foto da obra" className="h-28 w-full object-cover" /> : <div className="h-28 bg-secondary" />}
                    <button onClick={() => removerFoto(p)} aria-label="Remover foto" className="absolute right-1 top-1 rounded-full bg-background/80 p-1 hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                ))}
                <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-primary/40 text-sm text-muted-foreground hover:border-primary">
                  <ImagePlus className="h-6 w-6 text-primary" aria-hidden />Adicionar fotos
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => upload(e.target.files)} />
                </label>
              </div>
            </div>
          </Sec>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-xl border border-primary/40 bg-card p-5">
            <h2 className="font-display text-lg font-bold">Cálculo de custos</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <Row k="Mão de obra" v={brl(t.maoObra)} />
              <Row k="Materiais" v={brl(t.materiais)} />
              <Row k="Equipamentos" v={brl(t.equipamentos)} />
              <Row k="Outros custos" v={brl(t.outros)} />
              <div className="border-t border-border pt-2"><Row k="Custo total" v={brl(t.custoTotal)} bold /></div>
            </dl>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <F label="Lucro % (oculto)"><input className={inp} inputMode="decimal" value={k.lucroPct || ""} onChange={(e) => setK({ ...k, lucroPct: num(e.target.value) })} /></F>
              <F label="Impostos %"><input className={inp} inputMode="decimal" value={k.impostoPct || ""} onChange={(e) => setK({ ...k, impostoPct: num(e.target.value) })} /></F>
              <F label="Desconto (R$)" className="col-span-2"><input className={inp} inputMode="decimal" value={k.descontoValor || ""} onChange={(e) => setK({ ...k, descontoValor: num(e.target.value) })} /></F>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">O desconto é abatido do preço final, depois dos impostos. Os impostos abaixo são calculados antes do desconto.</p>
            <dl className="mt-4 space-y-2 text-sm">
              <Row k="Lucro (só você vê)" v={brl(t.lucro)} />
              <Row k="Impostos" v={brl(t.impostos)} />
            </dl>
            <div className="mt-4 rounded-md bg-primary/10 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Preço para o cliente</p>
              <p className="text-3xl font-black text-primary">{brl(t.precoFinal)}</p>
              {d.areaTotal > 0 && <p className="text-xs text-muted-foreground">{brl(t.precoFinal / d.areaTotal)} por m²</p>}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return <div className={`flex justify-between gap-3 ${bold ? "font-bold" : ""}`}><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>;
}

function Linhas<T extends { id: string }>({ cols, rows, onAdd, onRemove, render, total }: {
  cols: string[]; rows: T[]; onAdd: () => void; onRemove: (id: string) => void; render: (r: T) => ReactNode; total: string;
}) {
  const grid = cols.length === 4 ? "md:grid-cols-[1fr_80px_90px_130px_36px]" : "md:grid-cols-[1fr_90px_130px_36px]";
  return (
    <div>
      <div className={`hidden gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid ${grid}`}>{cols.map((c) => <span key={c}>{c}</span>)}<span /></div>
      <div className="mt-2 space-y-3">
        {rows.map((r) => (
          <div key={r.id} className={`grid grid-cols-2 gap-2 rounded-md border border-border p-2 md:border-0 md:p-0 [&>*:first-child]:col-span-2 md:[&>*:first-child]:col-span-1 ${grid}`}>
            {render(r)}
            <button onClick={() => onRemove(r.id)} aria-label="Remover linha" className="flex items-center justify-center rounded-md border border-border hover:border-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <button onClick={onAdd} className="inline-flex items-center gap-1 rounded-md border border-dashed border-primary/50 px-3 py-2 text-sm text-primary hover:border-primary"><Plus className="h-4 w-4" aria-hidden />Adicionar</button>
        <span className="text-sm font-bold">Subtotal: {total}</span>
      </div>
    </div>
  );
}
