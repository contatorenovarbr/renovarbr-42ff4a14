import { CalendarDays, MapPin, Palmtree } from "lucide-react";
import { ferias } from "@/data/obra";
import { prazoEntrega, type ObraPublica } from "@/lib/obras-publicas";
import { Countdown } from "./Countdown";

export function ObraAtual({ obra, urls }: { obra: ObraPublica; urls: Record<string, string> }) {
  return (
    <article className="h-full overflow-hidden rounded-lg border border-primary/30 bg-card">
      {obra.fotos.length > 0 && (
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto p-3" aria-label={`Fotos de ${obra.titulo}`} tabIndex={0}>
          {obra.fotos.map((path, i) => (
            <figure key={path} className={`min-w-0 shrink-0 snap-start overflow-hidden rounded-md ${obra.fotos.length === 1 ? "basis-full" : obra.fotos.length === 2 ? "basis-[88%] sm:basis-[calc((100%-0.75rem)/2)]" : "basis-[88%] sm:basis-[48%] lg:basis-[calc((100%-1.5rem)/3)]"}`}>
              {urls[path] ? <img src={urls[path]} alt={`Foto ${i + 1} da obra ${obra.titulo}`} loading="lazy" className="h-64 w-full object-cover md:h-80" /> : <div className="h-64 animate-pulse bg-secondary md:h-80" aria-label="Carregando foto" />}
            </figure>
          ))}
        </div>
      )}
      <div className="grid min-w-0 gap-8 p-5 md:grid-cols-2 md:p-8">
        <div className="min-w-0">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-bold uppercase text-accent">
            <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 [animation-duration:2s] motion-reduce:hidden" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            {obra.status}
          </span>
          <h3 className="mt-4 break-words font-display text-2xl font-black uppercase md:text-3xl">{obra.titulo}</h3>
          {(obra.endereco || obra.cidade) && <p className="mt-4 flex items-start gap-2 text-sm font-semibold leading-relaxed"><MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden /><span className="min-w-0 break-words">{[obra.endereco, obra.cidade && `${obra.cidade}/SC`].filter(Boolean).join(" — ")}</span></p>}
          {obra.etapa && <div className="mt-6"><p className="text-sm font-semibold">{obra.etapa}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary" aria-hidden><div className="h-full w-1/3 animate-indeterminate rounded-full bg-primary motion-reduce:animate-none" /></div></div>}
        </div>
        <div className="min-w-0 self-end">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><CalendarDays className="h-4 w-4 shrink-0" aria-hidden />Prazo de entrega{obra.prazo && ` · ${new Date(prazoEntrega(obra.prazo)).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}`}</p>
          <div className="mt-3" aria-label={`Contagem para entrega de ${obra.titulo}`}>
            {obra.prazo ? <Countdown target={prazoEntrega(obra.prazo)} doneText="Prazo de entrega atingido" /> : <p className="text-sm text-muted-foreground">Prazo a definir</p>}
          </div>
        </div>
      </div>
    </article>
  );
}

export function FeriasCountdown() {
  return (
    <div className="mt-8 grid min-w-0 gap-6 border-t border-border pt-8 md:grid-cols-[minmax(0,1fr)_minmax(0,360px)] md:items-center">
      <div className="min-w-0"><p className="flex items-center gap-2 text-sm font-bold uppercase text-primary"><Palmtree className="h-4 w-4 shrink-0" aria-hidden />Férias Renovar BR</p><p className="mt-2 text-sm text-muted-foreground">Contagem até {ferias.label}. Garanta sua agenda antes.</p></div>
      <div aria-label="Contagem para férias"><Countdown target={ferias.data} doneText="Boas férias!" /></div>
    </div>
  );
}
