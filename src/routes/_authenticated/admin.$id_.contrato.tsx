import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/renovar-logo.png.asset.json";
import { brl, calcular, clienteVazio, custosVazios, dadosVazios, type Cliente, type Custos, type Dados } from "@/lib/orcamento";

export const Route = createFileRoute("/_authenticated/admin/$id_/contrato")({
  validateSearch: (s: Record<string, unknown>): { orc?: string } => (typeof s["orc"] === "string" ? { orc: s["orc"] } : {}),
  head: () => ({
    meta: [
      { title: "Minuta de contrato — Renovar BR" },
      { name: "description", content: "Minuta de contrato de prestação de serviços da Renovar BR." },
      { property: "og:title", content: "Minuta de contrato — Renovar BR" },
      { property: "og:description", content: "Minuta para revisão e assinatura." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Contrato,
});

// Campo editável que imprime como texto (sem borda) no PDF.
function Campo({ ph, w = "w-64" }: { ph: string; w?: string }) {
  return <input placeholder={ph} className={`${w} max-w-full border-b border-dashed border-muted-foreground bg-transparent px-1 outline-none print:border-solid`} />;
}

function Contrato() {
  const { id } = Route.useParams();
  const { orc } = Route.useSearch();
  const [modo, setModo] = useState<"mo" | "momat">("momat");

  const { data, isLoading, error } = useQuery({
    queryKey: ["contrato", id, orc ?? null],
    queryFn: async () => {
      const { data: e, error: ee } = await supabase.from("empreendimentos").select("*").eq("id", id).maybeSingle();
      if (ee) throw ee;
      if (!e || !orc) return e ? { ...e, orcTitulo: "" } : null;
      const { data: o, error: oe } = await supabase.from("orcamentos").select("titulo, custos").eq("id", orc).eq("empreendimento_id", id).maybeSingle();
      if (oe) throw oe;
      if (!o) throw new Error("O orçamento selecionado não foi encontrado.");
      return { ...e, custos: o.custos, orcTitulo: o.titulo };
    },
  });

  if (isLoading) return <p className="p-10 text-center text-muted-foreground">Carregando minuta…</p>;
  if (error || !data)
    return (
      <div className="p-10 text-center">
        <p className="text-destructive">{error ? error.message : "Empreendimento não encontrado."}</p>
        <Link to="/admin/$id" params={{ id }} className="mt-4 inline-block underline">Voltar à ficha</Link>
      </div>
    );

  const c: Cliente = { ...clienteVazio, ...(data.cliente as Partial<Cliente>) };
  const d: Dados = { ...dadosVazios, ...(data.dados as Partial<Dados>) };
  const kk = data.custos as Partial<Custos>;
  const base: Custos = { ...custosVazios, ...kk, outros: { ...custosVazios.outros, ...(kk.outros ?? {}) } };
  // "Somente mão de obra": remove os materiais ANTES de aplicar lucro e impostos.
  const k: Custos = modo === "mo" ? { ...base, materiais: [] } : base;
  const t = calcular(k);
  const endereco = [data.endereco, d.bairro, data.cidade].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-muted/40 print:bg-background">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 p-4 print:hidden">
        <Link to="/admin/$id" params={{ id }} className="inline-flex items-center gap-2 text-sm"><ArrowLeft className="h-4 w-4" />Voltar à ficha</Link>
        <select value={modo} onChange={(e) => setModo(e.target.value as "mo" | "momat")} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="mo">Somente mão de obra</option>
          <option value="momat">Mão de obra + materiais</option>
        </select>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"><Download className="h-4 w-4" />Salvar como PDF</button>
      </div>

      <article className="mx-auto max-w-3xl space-y-4 bg-background p-6 text-sm leading-relaxed sm:p-10 print:p-0">
        <header className="flex items-center justify-between gap-4 border-b pb-4">
          <img src={logo.url} alt="Renovar BR" className="h-14 w-auto" />
          <p className="rounded border border-destructive px-2 py-1 text-xs font-bold uppercase text-destructive">Minuta para revisão e assinatura</p>
        </header>
        <h1 className="text-center text-lg font-bold uppercase">Contrato de prestação de serviços</h1>
        {data.orcTitulo && <p className="text-center text-muted-foreground">Referente ao orçamento: {data.orcTitulo}</p>}

        <h2 className="font-bold">1. Partes</h2>
        <p><b>CONTRATADA:</b> Renovar BR, razão social <Campo ph="razão social" />, CNPJ/CPF <Campo ph="CNPJ/CPF" w="w-44" />, endereço <Campo ph="endereço" w="w-72" />, representante <Campo ph="nome do representante" />.</p>
        <p><b>CONTRATANTE:</b> {c.nome || <Campo ph="nome" />}, {c.documento ? `documento ${c.documento}` : <>documento <Campo ph="CPF/CNPJ" w="w-44" /></>}, endereço {c.endereco || <Campo ph="endereço" w="w-72" />}{c.telefone && `, telefone ${c.telefone}`}{c.email && `, e-mail ${c.email}`}.</p>

        <h2 className="font-bold">2. Objeto e local</h2>
        <p>Execução de serviços de {modo === "mo" ? "mão de obra (materiais fornecidos pela CONTRATANTE)" : "mão de obra com fornecimento de materiais"} no empreendimento <b>{data.titulo}</b>, situado em {endereco || <Campo ph="endereço da obra" w="w-72" />}.</p>

        <h2 className="font-bold">3. Escopo</h2>
        <ol className="list-decimal space-y-1 pl-6">{k.itens.map((i) => <li key={i.id}>{i.descricao}{i.quantidade ? ` — ${i.quantidade} ${i.unidade}` : ""}</li>)}</ol>
        {modo === "momat" && k.materiais.length > 0 && <p>Materiais incluídos: {k.materiais.map((m) => m.descricao).filter(Boolean).join("; ")}.</p>}

        <h2 className="font-bold">4. Preço</h2>
        <p>Valor total: <b>{brl(t.precoFinal)}</b>{k.descontoValor ? ` (já com desconto de ${brl(k.descontoValor)})` : ""}.</p>

        <h2 className="font-bold">5. Pagamento</h2>
        <p>{k.pagamento || <Campo ph="forma e condições de pagamento" w="w-full" />}</p>

        <h2 className="font-bold">6. Prazo</h2>
        <p>Prazo de execução: {k.prazoDias ? `${k.prazoDias} dias` : <Campo ph="prazo" w="w-32" />}, com início em {d.inicioPrevisto ? new Date(d.inicioPrevisto + "T12:00:00").toLocaleDateString("pt-BR") : <Campo ph="data de início" w="w-36" />}, podendo ser prorrogado por chuvas, falta de acesso ou alterações de escopo solicitadas.</p>

        <h2 className="font-bold">7. Responsabilidades</h2>
        <p>A CONTRATADA executará os serviços com técnica adequada, mantendo o local organizado e sua equipe com equipamentos de segurança. A CONTRATANTE garantirá acesso ao local, pontos de água e energia{modo === "mo" ? ", e fornecerá os materiais em tempo hábil" : ""}. Serviços fora do escopo serão orçados à parte.</p>

        <h2 className="font-bold">8. Garantia</h2>
        <p>{k.garantia || <Campo ph="garantia dos serviços" w="w-full" />}</p>

        <h2 className="font-bold">9. Rescisão</h2>
        <p>O contrato poderá ser rescindido por qualquer parte mediante aviso por escrito com <Campo ph="nº" w="w-12" /> dias de antecedência, pagando-se os serviços já executados. O descumprimento de cláusula permite rescisão imediata. Multa: <Campo ph="condição de multa" w="w-56" />.</p>

        <h2 className="font-bold">10. Foro</h2>
        <p>Fica eleito o foro da comarca de <Campo ph="comarca" w="w-40" />/SC.</p>

        <p className="pt-4">Local e data: <Campo ph="local" w="w-40" />, ____/____/________</p>
        <div className="grid gap-10 pt-12 sm:grid-cols-2 print:grid-cols-2">
          {["CONTRATADA — Renovar BR", "CONTRATANTE", "Testemunha 1", "Testemunha 2"].map((s) => (
            <div key={s} className="border-t border-foreground pt-1 text-center text-xs">{s}<br />Nome/CPF:</div>
          ))}
        </div>
      </article>
    </div>
  );
}
