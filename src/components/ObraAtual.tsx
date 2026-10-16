import { CalendarDays, ImagePlus, MapPin, Palmtree } from "lucide-react";
import { obraAtual, ferias } from "@/data/obra";
import { Countdown } from "./Countdown";
import { Reveal } from "./Reveal";

function PhotoPending({ n }: { n: number }) {
  return (
    <figure className="placeholder-stripes flex min-h-[260px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-primary/40 bg-surface p-6 text-center">
      <ImagePlus className="h-8 w-8 text-primary" aria-hidden />
      <figcaption>
        <span className="block font-display text-lg font-bold">Foto {n} da obra atual</span>
        <span className="mt-1 block text-xs uppercase tracking-widest text-muted-foreground">Aguardando foto real</span>
      </figcaption>
    </figure>
  );
}

export function ObraAtual() {
  const o = obraAtual;
  const photos = o.photos.length ? o.photos : null;
  return (
    <section id="obra" className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5">
        <Reveal>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Obra em andamento</p>
          <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">{o.titulo}</h2>
        </Reveal>

        <Reveal delay={100}>
          <article className="mt-12 overflow-hidden rounded-xl border border-primary/30 bg-card shadow-2xl transition duration-500 hover:border-primary/60">
            <div className="grid gap-3 p-3 md:grid-cols-3">
              {photos
                ? photos.map((p, i) => (
                    <figure key={i} className="group overflow-hidden rounded-lg">
                      <img src={p.src} alt={p.alt} loading="lazy" className="h-72 w-full object-cover transition duration-700 group-hover:scale-105 md:h-96" />
                    </figure>
                  ))
                : [1, 2].map((n) => <PhotoPending key={n} n={n} />)}
            </div>

            <div className="grid gap-10 p-6 md:grid-cols-2 md:p-10">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent">
                  <span className="relative flex h-2.5 w-2.5" aria-hidden>
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 [animation-duration:2s] motion-reduce:hidden" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                  </span>
                  Em atividade
                </span>
                <dl className="mt-6 space-y-4">
                  <div>
                    <dt className="text-xs uppercase tracking-widest text-muted-foreground">Status</dt>
                    <dd className="font-display text-2xl font-bold">{o.status}</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"><MapPin className="h-4 w-4" aria-hidden /> Endereço</dt>
                    <dd className={o.endereco ? "font-semibold" : "mt-1 inline-block rounded border border-dashed border-primary/50 px-3 py-1 text-sm text-muted-foreground"}>
                      {o.endereco || "Localização será adicionada em breve"}
                    </dd>
                  </div>
                </dl>
                <div className="mt-6">
                  <p className="text-sm font-semibold">{o.etapa}</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-label={o.etapa}>
                    <div className="h-full w-1/3 animate-indeterminate rounded-full bg-primary motion-reduce:animate-none" />
                  </div>
                </div>
              </div>

              <div>
                <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                  <CalendarDays className="h-4 w-4" aria-hidden /> Prazo de entrega · {o.prazoLabel}
                </p>
                <div className="mt-3"><Countdown target={o.prazo} doneText="Prazo de entrega atingido" /></div>
              </div>
            </div>
          </article>
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-8 flex flex-col gap-6 rounded-xl border border-border bg-card p-6 transition hover:-translate-y-1 hover:border-primary/40 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary"><Palmtree className="h-4 w-4" aria-hidden /> Férias Renovar BR</p>
              <p className="mt-1 text-muted-foreground">Contagem até {ferias.label}. Garanta sua agenda antes.</p>
            </div>
            <div className="md:min-w-[360px]"><Countdown target={ferias.data} doneText="Boas férias!" /></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
