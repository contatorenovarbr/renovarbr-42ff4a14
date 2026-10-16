import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/renovar-logo.png.asset.json";
import { brl, calcular, clienteVazio, custosVazios, dadosVazios, type Cliente, type Custos, type Dados } from "@/lib/orcamento";

export const Route = createFileRoute("/_authenticated/admin/$id_/orcamento")({ component: Orcamento });

const WA_NUM = "+55 (47) 99795-3323";
const fmtDate = (s: string) => (s ? new Date(s + "T12:00:00").toLocaleDateString("pt-BR") : "");

function Orcamento() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["empreendimento", id],
    queryFn: async () => (await supabase.from("empreendimentos").select("*").eq("id", id).maybeSingle()).data,
  });
  if (isLoading) return <p className="p-10 text-center text-muted-foreground">Carregando…</p>;
  if (!data) return <p className="p-10 text-center text-muted-foreground">Não encontrado.</p>;

  const c: Cliente = { ...clienteVazio, ...(data.cliente as Partial<Cliente>) };
  const d: Dados = { ...dadosVazios, ...(data.dados as Partial<Dados>) };
  const kk = data.custos as Partial<Custos>;
  const k: Custos = { ...custosVazios, ...kk, outros: { ...custosVazios.outros, ...(kk.outros ?? {}) } };
  const t = calcular(k);
  const f = t.fator;
  const numero = `RBR-${new Date(data.created_at).getFullYear()}-${data.id.slice(0, 6).toUpperCase()}`;
  const hoje = new Date().toLocaleDateString("pt-BR");

  // Lucro e impostos ficam embutidos proporcionalmente em cada linha.
  const linhas = [
    ...k.itens.filter((i) => i.descricao || i.quantidade).map((i) => ({ desc: i.descricao, un: i.unidade, qtd: i.quantidade, valor: i.quantidade * i.maoObraUnit * f })),
    ...(t.materiais > 0 ? [{ desc: "Materiais (conforme especificação)", un: "vb", qtd: 1, valor: t.materiais * f }] : []),
    ...(t.equipamentos > 0 ? [{ desc: "Equipamentos e andaimes", un: "vb", qtd: 1, valor: t.equipamentos * f }] : []),
    ...(t.outros > 0 ? [{ desc: "Logística, descarte e despesas operacionais", un: "vb", qtd: 1, valor: t.outros * f }] : []),
  ];

  return (
    <div className="bg-background pb-10 print:bg-white print:p-0">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5 print:hidden">
        <Link to="/admin/$id" params={{ id }} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" aria-hidden />Voltar à ficha</Link>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-bold text-primary-foreground hover:brightness-110">
          <Download className="h-5 w-5" aria-hidden />Exportar PDF
        </button>
      </div>
      <p className="mx-auto max-w-4xl px-5 pb-4 text-xs text-muted-foreground print:hidden">Na janela que abrir, escolha "Salvar como PDF" como destino.</p>

      <article className="quote-sheet mx-auto max-w-4xl bg-white p-10 text-neutral-900 shadow-2xl print:max-w-none print:p-0 print:shadow-none">
        <header className="flex items-start justify-between gap-6 border-b-4 border-neutral-900 pb-6">
          <div className="rounded-md bg-neutral-900 p-3"><img src={logo.url} alt="Renovar BR" className="h-16 w-auto" /></div>
          <div className="text-right text-sm">
            <p className="text-2xl font-black uppercase tracking-tight">Orçamento</p>
            <p className="font-semibold">Nº {numero}</p>
            <p>Emitido em {hoje}</p>
            {k.validadeDias > 0 && <p>Válido por {k.validadeDias} dias</p>}
          </div>
        </header>

        <section className="mt-6 grid gap-6 text-sm sm:grid-cols-2">
          <div>
            <h2 className="mb-2 border-b border-neutral-300 pb-1 text-xs font-bold uppercase tracking-widest text-neutral-500">Cliente</h2>
            <p className="font-bold">{c.nome || "—"}</p>
            {c.documento && <p>CPF/CNPJ: {c.documento}</p>}
            {c.contato && <p>Contato: {c.contato}</p>}
            {c.telefone && <p>Telefone: {c.telefone}</p>}
            {c.email && <p>E-mail: {c.email}</p>}
            {c.endereco && <p>{c.endereco}</p>}
          </div>
          <div>
            <h2 className="mb-2 border-b border-neutral-300 pb-1 text-xs font-bold uppercase tracking-widest text-neutral-500">Empreendimento</h2>
            <p className="font-bold">{data.titulo}</p>
            <p>{d.tipo}</p>
            {(data.endereco || data.cidade) && <p>{[data.endereco, d.bairro, data.cidade && `${data.cidade}/SC`].filter(Boolean).join(" — ")}</p>}
            {d.areaTotal > 0 && <p>Área: {d.areaTotal.toLocaleString("pt-BR")} m²</p>}
            {(d.pavimentos > 0 || d.unidades > 0) && <p>{[d.pavimentos > 0 && `${d.pavimentos} pavimento(s)`, d.unidades > 0 && `${d.unidades} unidade(s)`].filter(Boolean).join(" · ")}</p>}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-500">Serviços</h2>
          <table className="w-full text-sm">
            <thead><tr className="bg-neutral-900 text-left text-white"><th className="p-2">Descrição</th><th className="p-2 text-center">Un.</th><th className="p-2 text-right">Qtd.</th><th className="p-2 text-right">Valor</th></tr></thead>
            <tbody>
              {linhas.length === 0 && <tr><td colSpan={4} className="p-3 text-center text-neutral-500">Nenhum item lançado na ficha.</td></tr>}
              {linhas.map((l, i) => (
                <tr key={i} className="border-b border-neutral-200 even:bg-neutral-50">
                  <td className="p-2">{l.desc}</td><td className="p-2 text-center">{l.un}</td>
                  <td className="p-2 text-right">{l.qtd.toLocaleString("pt-BR")}</td><td className="p-2 text-right">{brl(l.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="ml-auto mt-4 w-full max-w-xs space-y-1 text-sm">
            {k.descontoValor > 0 && <>
              <div className="flex justify-between"><span>Subtotal</span><span>{brl(t.precoBruto)}</span></div>
              <div className="flex justify-between"><span>Desconto</span><span>− {brl(k.descontoValor)}</span></div>
            </>}
            <div className="flex justify-between border-t-2 border-neutral-900 pt-2 text-lg font-black"><span>Total</span><span>{brl(t.precoFinal)}</span></div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
          {(k.prazoDias > 0 || data.prazo || d.inicioPrevisto) && (
            <div><h3 className="font-bold">Prazo</h3>
              {d.inicioPrevisto && <p>Início previsto: {fmtDate(d.inicioPrevisto)}</p>}
              {k.prazoDias > 0 && <p>Execução: {k.prazoDias} dias</p>}
              {data.prazo && <p>Entrega: {fmtDate(data.prazo)}</p>}
            </div>
          )}
          {k.pagamento && <div><h3 className="font-bold">Condições de pagamento</h3><p className="whitespace-pre-line">{k.pagamento}</p></div>}
          {k.garantia && <div><h3 className="font-bold">Garantia</h3><p>{k.garantia}</p></div>}
          {k.observacoes && <div className="sm:col-span-2"><h3 className="font-bold">Observações</h3><p className="whitespace-pre-line">{k.observacoes}</p></div>}
        </section>

        <section className="mt-14 grid gap-10 text-center text-xs sm:grid-cols-2">
          <div className="border-t border-neutral-400 pt-2">Renovar BR</div>
          <div className="border-t border-neutral-400 pt-2">{c.nome || "Cliente"} — de acordo</div>
        </section>

        <footer className="mt-10 border-t-4 border-amber-400 pt-3 text-center text-xs text-neutral-600">
          Renovar BR · Pintura • Reforma • Acabamento · WhatsApp {WA_NUM} · Porto Belo · Itapema · Balneário Camboriú · Camboriú — SC
        </footer>
      </article>
    </div>
  );
}
