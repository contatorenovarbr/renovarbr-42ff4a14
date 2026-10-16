import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, PaintRoller, Layers, Brush, Building2, Wrench, Store, MapPin, ImagePlus, Check } from "lucide-react";
import hero from "@/assets/hero.jpg";
import detail from "@/assets/detail.jpg";

const WA = "https://wa.me/5547997953323?text=Ol%C3%A1%2C%20quero%20solicitar%20um%20or%C3%A7amento";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pinturas Belas Artes | Pintura e Acabamento em SC" },
      { name: "description", content: "Pintura interna e externa, fachadas, texturas e manutenção predial em Porto Belo, Itapema, Balneário Camboriú e Camboriú. Solicite seu orçamento." },
      { property: "og:title", content: "Pinturas Belas Artes | Pintura e Acabamento em SC" },
      { property: "og:description", content: "Pintura, reforma e acabamento para construtoras, condomínios, residências e comércios no litoral de SC." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const services = [
  { icon: PaintRoller, t: "Pintura interna e externa", d: "Ambientes residenciais e comerciais com acabamento uniforme e limpo." },
  { icon: Layers, t: "Preparação de superfícies e massa corrida", d: "Correção, lixamento e nivelamento para um resultado duradouro." },
  { icon: Brush, t: "Texturas", d: "Aplicação de texturas decorativas e funcionais em paredes e fachadas." },
  { icon: Building2, t: "Pintura e revitalização de fachadas", d: "Renovação da imagem do edifício com proteção contra o clima litorâneo." },
  { icon: Wrench, t: "Manutenção e revitalização predial", d: "Planos de manutenção para condomínios e administradoras." },
  { icon: Store, t: "Acabamento comercial e residencial", d: "Entrega final caprichada para obras, lojas, escritórios e casas." },
];

const steps = [
  { t: "Avaliação do local", d: "Visitamos a obra para entender o escopo, as superfícies e as condições." },
  { t: "Orçamento claro", d: "Proposta detalhada, com etapas, materiais e prazos definidos." },
  { t: "Preparação", d: "Proteção do ambiente e tratamento correto das superfícies." },
  { t: "Execução", d: "Aplicação técnica, com organização e limpeza durante o serviço." },
  { t: "Revisão final", d: "Conferência ponto a ponto antes da entrega." },
];

const areas = ["Porto Belo", "Itapema", "Balneário Camboriú", "Camboriú"];
const audiences = ["Construtoras", "Engenheiros", "Arquitetos", "Administradoras de condomínios", "Residências", "Comércios"];

function WhatsButton({ className = "" }: { className?: string }) {
  return (
    <a href={WA} target="_blank" rel="noopener noreferrer" aria-label="Falar no WhatsApp (abre em nova aba)"
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-border px-6 py-4 font-semibold text-foreground transition hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className}`}>
      <MessageCircle className="h-5 w-5" aria-hidden /> WhatsApp
    </a>
  );
}
function QuoteButton({ className = "" }: { className?: string }) {
  return (
    <a href={WA} target="_blank" rel="noopener noreferrer" aria-label="Solicitar orçamento pelo WhatsApp (abre em nova aba)"
      className={`group inline-flex items-center justify-center gap-2 rounded-md bg-primary px-7 py-4 font-bold text-primary-foreground transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className}`}>
      Solicitar orçamento <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" aria-hidden />
    </a>
  );
}

function PhotoSlot({ label, tall = false }: { label: string; tall?: boolean }) {
  return (
    <figure className={`placeholder-stripes relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-primary/40 bg-surface p-6 text-center ${tall ? "min-h-[420px] md:row-span-2" : "min-h-[200px]"}`}>
      <ImagePlus className="h-8 w-8 text-primary" aria-hidden />
      <figcaption>
        <span className="block font-display text-lg font-bold">{label}</span>
        <span className="mt-1 block text-xs uppercase tracking-widest text-muted-foreground">Substituir por foto real da obra</span>
      </figcaption>
    </figure>
  );
}

function Index() {
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Pular para o conteúdo</a>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#topo" className="flex items-center gap-2 font-display text-lg font-black uppercase tracking-tight">
            <span className="h-6 w-2 rounded-sm bg-primary" aria-hidden />
            Pinturas <span className="text-primary">Belas Artes</span>
          </a>
          <nav aria-label="Principal" className="hidden gap-8 text-sm text-muted-foreground md:flex">
            <a className="hover:text-foreground" href="#servicos">Serviços</a>
            <a className="hover:text-foreground" href="#portfolio">Portfólio</a>
            <a className="hover:text-foreground" href="#processo">Como trabalhamos</a>
            <a className="hover:text-foreground" href="#areas">Áreas</a>
          </nav>
          <a href={WA} target="_blank" rel="noopener noreferrer" className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:brightness-110">Orçamento</a>
        </div>
      </header>

      <main id="conteudo">
        {/* HERO */}
        <section id="topo" className="relative isolate overflow-hidden pt-28 pb-20 md:pt-40 md:pb-32">
          <img src={hero} alt="Imagem ilustrativa: fachada de edifício em pintura com andaimes" width={1600} height={1008}
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-background via-background/85 to-background/30" aria-hidden />
          <div className="mx-auto max-w-7xl px-5">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/40 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden /> Litoral de Santa Catarina
            </p>
            <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.95] sm:text-6xl md:text-8xl">
              Pintura e acabamento <span className="text-primary">de alto padrão</span> para sua obra.
            </h1>
            <p className="mt-8 max-w-xl text-lg text-muted-foreground">
              Pintura, reforma e acabamento para construtoras, condomínios, residências e comércios em Porto Belo, Itapema, Balneário Camboriú e Camboriú.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <QuoteButton /><WhatsButton />
            </div>
            <p className="mt-12 text-xs uppercase tracking-widest text-muted-foreground/70">Imagem ilustrativa temporária — substituir por foto real</p>
          </div>
        </section>

        {/* AUDIENCE */}
        <section aria-label="Para quem atendemos" className="border-y border-border bg-surface">
          <ul className="mx-auto flex max-w-7xl flex-wrap justify-center gap-x-10 gap-y-3 px-5 py-6 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {audiences.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </section>

        {/* SERVICES */}
        <section id="servicos" className="mx-auto max-w-7xl px-5 py-24 md:py-32">
          <div className="grid gap-6 md:grid-cols-2 md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Serviços</p>
              <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">O que fazemos</h2>
            </div>
            <p className="text-muted-foreground md:text-right">Soluções completas de pintura e acabamento, do preparo da superfície à entrega final.</p>
          </div>
          <ul className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ icon: Icon, t, d }, i) => (
              <li key={t} className="group bg-background p-8 transition hover:bg-surface">
                <div className="flex items-center justify-between">
                  <Icon className="h-8 w-8 text-primary" aria-hidden />
                  <span className="font-display text-sm text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="mt-8 text-xl font-bold">{t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* PORTFOLIO */}
        <section id="portfolio" className="bg-surface py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-5">
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Portfólio</p>
            <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">Nossas obras</h2>
            <p className="mt-4 max-w-xl text-muted-foreground">Espaços reservados para as fotos reais dos projetos executados.</p>
            <div className="mt-14 grid auto-rows-[200px] gap-4 md:grid-cols-3">
              <PhotoSlot tall label="Obra 1 — Fachada" />
              <PhotoSlot label="Obra 2 — Interno residencial" />
              <PhotoSlot label="Obra 3 — Textura" />
              <PhotoSlot label="Obra 4 — Comercial" />
              <PhotoSlot label="Obra 5 — Condomínio" />
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section id="processo" className="mx-auto max-w-7xl px-5 py-24 md:py-32">
          <div className="grid gap-16 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-primary">Processo</p>
              <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">Como trabalhamos</h2>
              <figure className="mt-10">
                <img src={detail} alt="Imagem ilustrativa: rolo aplicando tinta branca em parede" loading="lazy" width={1200} height={912} className="rounded-lg" />
                <figcaption className="mt-2 text-xs uppercase tracking-widest text-muted-foreground/70">Imagem ilustrativa temporária</figcaption>
              </figure>
            </div>
            <ol className="space-y-2">
              {steps.map((s, i) => (
                <li key={s.t} className="flex gap-6 border-b border-border py-7">
                  <span className="font-display text-4xl font-black text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-xl font-bold">{s.t}</h3>
                    <p className="mt-2 text-muted-foreground">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* AREAS */}
        <section id="areas" className="bg-paper py-24 text-paper-foreground md:py-32">
          <div className="mx-auto max-w-7xl px-5">
            <p className="text-sm font-bold uppercase tracking-widest text-accent">Áreas atendidas</p>
            <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">Onde atendemos</h2>
            <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {areas.map((a) => (
                <li key={a} className="flex items-center gap-3 rounded-lg border border-paper-foreground/15 p-6">
                  <MapPin className="h-6 w-6 text-accent" aria-hidden />
                  <span className="font-display text-xl font-bold">{a}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm opacity-70">Santa Catarina — consulte disponibilidade para outras cidades.</p>
          </div>
        </section>

        {/* CTA */}
        <section aria-labelledby="cta" className="mx-auto max-w-7xl px-5 py-24 md:py-32">
          <div className="relative overflow-hidden rounded-2xl bg-primary p-10 text-primary-foreground md:p-16">
            <h2 id="cta" className="max-w-3xl text-4xl font-black uppercase leading-none md:text-6xl">Tem uma obra para pintar ou revitalizar?</h2>
            <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-2 font-semibold">
              {["Visita técnica", "Proposta detalhada", "Atendimento pelo WhatsApp"].map((x) => (
                <li key={x} className="flex items-center gap-2"><Check className="h-5 w-5" aria-hidden />{x}</li>
              ))}
            </ul>
            <a href={WA} target="_blank" rel="noopener noreferrer" aria-label="Solicitar orçamento pelo WhatsApp (abre em nova aba)"
              className="mt-10 inline-flex items-center gap-2 rounded-md bg-background px-7 py-4 font-bold text-foreground transition hover:bg-surface">
              Solicitar orçamento <ArrowRight className="h-5 w-5" aria-hidden />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-lg font-black uppercase">Pinturas <span className="text-primary">Belas Artes</span></p>
            <p className="mt-1 text-sm text-muted-foreground">Pintura, reforma e acabamento · Porto Belo · Itapema · Balneário Camboriú · Camboriú — SC</p>
          </div>
          <a href={WA} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-accent hover:underline">
            <MessageCircle className="h-5 w-5" aria-hidden /> (47) 99795-3323
          </a>
        </div>
        <p className="pb-8 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Pinturas Belas Artes</p>
      </footer>

      <a href={WA} target="_blank" rel="noopener noreferrer" aria-label="Conversar no WhatsApp (abre em nova aba)"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-primary-foreground shadow-lg transition hover:scale-105">
        <MessageCircle className="h-7 w-7" aria-hidden />
      </a>
    </>
  );
}
