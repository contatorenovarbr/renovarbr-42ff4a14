import { useState, type FormEvent } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { acessarObra, acessarUnidade, type PortalErro, type PortalObra as Obra, type PortalUnidade } from "@/lib/portal.functions";

const MSG: Record<PortalErro, string> = {
  senha: "Senha incorreta.",
  bloqueado: "Muitas tentativas. Aguarde 15 minutos e tente de novo.",
  sem_senha: "O acesso desta área ainda não foi liberado. Fale com a Renovar BR.",
};
const fmt = (s: string | null) => (s ? new Date(s + "T12:00:00").toLocaleDateString("pt-BR") : "");

function SenhaForm({ label, onSubmit }: { label: string; onSubmit: (senha: string) => Promise<string | null> }) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState(false);
  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!senha) return;
    setBusy(true); setErro("");
    try { const m = await onSubmit(senha); if (m) setErro(m); else setSenha(""); }
    catch { setErro("Não foi possível verificar agora. Tente novamente."); }
    finally { setBusy(false); }
  }
  return (
    <form onSubmit={enviar} className="space-y-3 py-2">
      <label htmlFor="portal-senha" className="flex items-center gap-2 text-sm font-semibold"><Lock className="h-4 w-4 text-primary" aria-hidden />{label}</label>
      <Input id="portal-senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} autoFocus />
      {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
      <Button type="submit" disabled={busy || !senha} className="w-full font-bold">{busy ? "Verificando…" : "Entrar"}</Button>
    </form>
  );
}

function Fotos({ urls, titulo }: { urls: string[]; titulo: string }) {
  if (!urls.length) return <p className="text-sm text-muted-foreground">Nenhuma foto adicionada ainda.</p>;
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{urls.map((u, i) => <a key={u} href={u} target="_blank" rel="noopener noreferrer"><img src={u} alt={`Foto ${i + 1} — ${titulo}`} loading="lazy" className="h-32 w-full rounded-md object-cover sm:h-40" /></a>)}</div>;
}
function Texto({ t, titulo }: { t: string; titulo: string }) {
  if (!t) return null;
  return <div><h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{titulo}</h4><p className="mt-1 whitespace-pre-line text-sm">{t}</p></div>;
}

export function PortalObra({ id, titulo, open, onOpenChange }: { id: string; titulo: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [obra, setObra] = useState<Obra | null>(null);
  const [unSel, setUnSel] = useState<{ id: string; identificador: string } | null>(null);
  const [unidade, setUnidade] = useState<PortalUnidade | null>(null);
  const fechar = (o: boolean) => { if (!o) { setObra(null); setUnSel(null); setUnidade(null); } onOpenChange(o); };

  return (
    <Dialog open={open} onOpenChange={fechar}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-8 font-display text-xl font-black uppercase">{titulo}</DialogTitle>
          <DialogDescription>Área do cliente Renovar BR</DialogDescription>
        </DialogHeader>
        {!obra ? (
          <SenhaForm label="Senha do empreendimento" onSubmit={async (senha) => {
            const r = await acessarObra({ data: { id, senha } });
            if ("erro" in r) return MSG[r.erro];
            setObra(r.obra); return null;
          }} />
        ) : (
          <Tabs defaultValue="ficha">
            <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="ficha">Ficha do empreendimento</TabsTrigger><TabsTrigger value="unidades">Fotos e unidades</TabsTrigger></TabsList>
            <TabsContent value="ficha" className="space-y-4 pt-3">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {[["Status", obra.status], ["Etapa", obra.etapa], ["Endereço", [obra.endereco, obra.cidade && `${obra.cidade}/SC`].filter(Boolean).join(" — ")], ["Prazo de entrega", fmt(obra.prazo)]].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}><dt className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{k}</dt><dd className="mt-1">{v}</dd></div>
                ))}
              </dl>
              <Texto t={obra.ficha} titulo="Informações gerais" />
              <Texto t={obra.atualizacoes} titulo="Atualizações" />
            </TabsContent>
            <TabsContent value="unidades" className="space-y-5 pt-3">
              {unSel ? (
                <div className="space-y-4">
                  <Button variant="ghost" size="sm" onClick={() => { setUnSel(null); setUnidade(null); }}><ArrowLeft aria-hidden />Voltar às unidades</Button>
                  <h3 className="font-display text-lg font-bold">{unSel.identificador}</h3>
                  {!unidade ? (
                    <SenhaForm label={`Senha da unidade ${unSel.identificador}`} onSubmit={async (senha) => {
                      const r = await acessarUnidade({ data: { obra: id, unidade: unSel.id, senha } });
                      if ("erro" in r) return MSG[r.erro];
                      setUnidade(r.unidade); return null;
                    }} />
                  ) : (
                    <div className="space-y-4">
                      {(unidade.inicio || unidade.conclusao) && <p className="text-sm">{unidade.inicio && `Início: ${fmt(unidade.inicio)}`}{unidade.inicio && unidade.conclusao && " · "}{unidade.conclusao && `Conclusão: ${fmt(unidade.conclusao)}`}</p>}
                      <Texto t={unidade.servicos} titulo="Serviços executados" />
                      <Texto t={unidade.atualizacoes} titulo="Atualizações" />
                      <Fotos urls={unidade.fotos} titulo={unidade.identificador} />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div><h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Fotos gerais</h3><Fotos urls={obra.fotos} titulo={obra.titulo} /></div>
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Unidades</h3>
                    {obra.unidades.length ? <ul className="grid gap-2 sm:grid-cols-2">{obra.unidades.map((u) => <li key={u.id}><Button variant="outline" className="w-full justify-between" onClick={() => setUnSel(u)}>{u.identificador}<Lock className="h-4 w-4" aria-hidden /></Button></li>)}</ul> : <p className="text-sm text-muted-foreground">Nenhuma unidade cadastrada.</p>}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
