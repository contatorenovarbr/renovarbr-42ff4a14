import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, KeyRound, Plus, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Unidade = Database["public"]["Tables"]["unidades"]["Row"];
const inp = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary";
const MAX = 10 * 1024 * 1024;
const lbl = "block text-xs font-semibold uppercase tracking-wider text-muted-foreground";

export function SenhaAdmin({ rpc, id, temSenha, label }: { rpc: "definir_senha_obra" | "definir_senha_unidade"; id: string; temSenha: boolean; label: string }) {
  const [s, setS] = useState("");
  const [busy, setBusy] = useState(false);
  const [definida, setDefinida] = useState(temSenha);
  async function salvar() {
    if (s.length < 6) { toast.error("A senha precisa ter pelo menos 6 caracteres."); return; }
    setBusy(true);
    const { error } = await supabase.rpc(rpc, { _id: id, _senha: s });
    setBusy(false);
    if (error) { toast.error(`Não foi possível definir a senha: ${error.message}`); return; }
    setS(""); setDefinida(true); toast.success("Senha definida.");
  }
  return (
    <div>
      <span className={lbl}>{label} <span className="normal-case tracking-normal">({definida ? "definida — digite para trocar" : "ainda não definida"})</span></span>
      <div className="mt-1 flex gap-2">
        <input type="password" autoComplete="new-password" className={inp} placeholder="Nova senha (mín. 6)" value={s} onChange={(e) => setS(e.target.value)} />
        <button type="button" onClick={salvar} disabled={busy || !s} className="inline-flex shrink-0 items-center gap-1 rounded-md bg-secondary px-3 text-sm font-bold disabled:opacity-50"><KeyRound className="h-4 w-4" aria-hidden />{busy ? "…" : "Definir"}</button>
      </div>
    </div>
  );
}

function UnidadeCard({ u, obraId }: { u: Unidade; obraId: string }) {
  const qc = useQueryClient();
  const [f, setF] = useState(u);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  useEffect(() => setF(u), [u]);
  useEffect(() => {
    if (!u.fotos.length) return;
    supabase.storage.from("obras").createSignedUrls(u.fotos, 3600).then(({ data }) => {
      const m: Record<string, string> = {};
      data?.forEach((x) => { if (x.path && x.signedUrl) m[x.path] = x.signedUrl; });
      setUrls(m);
    });
  }, [u.fotos]);
  const refresh = () => qc.invalidateQueries({ queryKey: ["unidades", obraId] });

  async function salvar() {
    setBusy(true);
    const { error } = await supabase.from("unidades").update({
      identificador: f.identificador || "Unidade", servicos: f.servicos, atualizacoes: f.atualizacoes,
      inicio: f.inicio || null, conclusao: f.conclusao || null, updated_at: new Date().toISOString(),
    }).eq("id", u.id);
    setBusy(false);
    if (error) { toast.error(`Erro ao salvar unidade: ${error.message}`); return; }
    toast.success("Unidade salva."); refresh();
  }
  async function excluir() {
    if (!confirm(`Excluir a unidade "${u.identificador}" e as fotos dela?`)) return;
    const { error } = await supabase.from("unidades").delete().eq("id", u.id);
    if (error) { toast.error(`Não foi possível excluir: ${error.message}`); return; }
    if (u.fotos.length) { const { error: e2 } = await supabase.storage.from("obras").remove(u.fotos); if (e2) toast.warning("Unidade excluída, mas algumas fotos não foram apagadas."); }
    toast.success("Unidade excluída."); refresh();
  }
  // Unit photos are persisted right after upload; removal updates the record before deleting the file.
  async function upload(files: File[]) {
    const novas: string[] = [];
    setBusy(true);
    for (const file of files) {
      if (!file.type.startsWith("image/")) { toast.error(`${file.name}: envie apenas imagens.`); continue; }
      if (file.size > MAX) { toast.error(`${file.name}: a foto passa de 10 MB.`); continue; }
      const path = `${obraId}/unidades/${u.id}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await supabase.storage.from("obras").upload(path, file);
      if (error) toast.error(`Falha ao enviar ${file.name}: ${error.message}`); else novas.push(path);
    }
    if (novas.length) {
      const { error } = await supabase.from("unidades").update({ fotos: [...u.fotos, ...novas] }).eq("id", u.id);
      if (error) { await supabase.storage.from("obras").remove(novas); toast.error(`Fotos não registradas: ${error.message}`); }
      else { toast.success("Fotos adicionadas à unidade."); refresh(); }
    }
    setBusy(false);
  }
  async function removerFoto(p: string) {
    const { error } = await supabase.from("unidades").update({ fotos: u.fotos.filter((x) => x !== p) }).eq("id", u.id);
    if (error) { toast.error(`Não foi possível remover: ${error.message}`); return; }
    const { error: e2 } = await supabase.storage.from("obras").remove([p]);
    if (e2) toast.warning("Foto retirada da unidade, mas o arquivo não foi apagado.");
    refresh();
  }

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className={`${lbl} md:col-span-1`}>Identificação (apto, sala, casa)<input className={`${inp} mt-1 normal-case tracking-normal`} value={f.identificador} onChange={(e) => setF({ ...f, identificador: e.target.value })} /></label>
        <label className={lbl}>Início<input type="date" className={`${inp} mt-1`} value={f.inicio ?? ""} onChange={(e) => setF({ ...f, inicio: e.target.value })} /></label>
        <label className={lbl}>Conclusão<input type="date" className={`${inp} mt-1`} value={f.conclusao ?? ""} onChange={(e) => setF({ ...f, conclusao: e.target.value })} /></label>
        <label className={`${lbl} md:col-span-3`}>Serviços executados<textarea rows={2} className={`${inp} mt-1 normal-case tracking-normal`} value={f.servicos} onChange={(e) => setF({ ...f, servicos: e.target.value })} /></label>
        <label className={`${lbl} md:col-span-3`}>Atualizações / observações<textarea rows={2} className={`${inp} mt-1 normal-case tracking-normal`} value={f.atualizacoes} onChange={(e) => setF({ ...f, atualizacoes: e.target.value })} /></label>
      </div>
      <SenhaAdmin rpc="definir_senha_unidade" id={u.id} temSenha={!!u.senha_hash} label="Senha da unidade" />
      <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
        {u.fotos.map((p) => (
          <div key={p} className="relative overflow-hidden rounded-md border border-border">
            {urls[p] ? <img src={urls[p]} alt={`Foto da unidade ${u.identificador}`} className="h-20 w-full object-cover" /> : <div className="h-20 bg-secondary" />}
            <button type="button" onClick={() => removerFoto(p)} aria-label="Remover foto da unidade" className="absolute right-1 top-1 rounded-full bg-background/80 p-1 hover:text-destructive"><X className="h-3 w-3" /></button>
          </div>
        ))}
        <label className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-primary/40 text-center text-xs text-muted-foreground">
          <ImagePlus className="h-5 w-5 text-primary" aria-hidden />Fotos (até 10 MB)
          <input type="file" accept="image/*" multiple disabled={busy} className="sr-only" onChange={(e) => { const fs = Array.from(e.target.files ?? []); e.target.value = ""; void upload(fs); }} />
        </label>
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={excluir} className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm text-destructive"><Trash2 className="h-4 w-4" aria-hidden />Excluir unidade</button>
        <button type="button" onClick={salvar} disabled={busy} className="inline-flex items-center gap-1 rounded-md bg-secondary px-3 py-2 text-sm font-bold"><Save className="h-4 w-4" aria-hidden />Salvar unidade</button>
      </div>
    </div>
  );
}

export function Unidades({ obraId }: { obraId: string }) {
  const qc = useQueryClient();
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ["unidades", obraId],
    queryFn: async () => {
      const { data, error } = await supabase.from("unidades").select("*").eq("empreendimento_id", obraId).order("identificador");
      if (error) throw error;
      return data;
    },
  });
  async function nova() {
    const { error } = await supabase.from("unidades").insert({ empreendimento_id: obraId });
    if (error) { toast.error(`Não foi possível criar a unidade: ${error.message}`); return; }
    qc.invalidateQueries({ queryKey: ["unidades", obraId] });
  }
  return (
    <div className="space-y-4">
      {isLoading ? <p className="text-sm text-muted-foreground">Carregando unidades…</p> : isError ? <p role="alert" className="text-sm text-destructive">Erro ao carregar unidades.</p> : data.map((u) => <UnidadeCard key={u.id} u={u} obraId={obraId} />)}
      <button type="button" onClick={nova} className="inline-flex items-center gap-1 rounded-md border border-dashed border-primary/50 px-3 py-2 text-sm text-primary"><Plus className="h-4 w-4" aria-hidden />Adicionar unidade</button>
    </div>
  );
}
