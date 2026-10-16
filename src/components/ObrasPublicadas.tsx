import { useEffect, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "./Reveal";

type Obra = { id: string; titulo: string; cidade: string; endereco: string; status: string; etapa: string; prazo: string | null; fotos: string[] };

export function ObrasPublicadas() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.rpc("obras_publicas").then(async ({ data }) => {
      const list = (data ?? []) as Obra[];
      setObras(list);
      const paths = list.flatMap((o) => o.fotos.slice(0, 3));
      if (!paths.length) return;
      const { data: s } = await supabase.storage.from("obras").createSignedUrls(paths, 3600);
      const m: Record<string, string> = {};
      s?.forEach((x) => { if (x.path && x.signedUrl) m[x.path] = x.signedUrl; });
      setUrls(m);
    });
  }, []);

  if (!obras.length) return null;
  return (
    <section className="bg-surface pb-24">
      <div className="mx-auto max-w-7xl space-y-8 px-5">
        {obras.map((o, idx) => (
          <Reveal key={o.id} delay={idx * 80}>
            <article className="overflow-hidden rounded-xl border border-primary/30 bg-card shadow-2xl transition hover:border-primary/60">
              {o.fotos.length > 0 && (
                <div className="grid gap-3 p-3 md:grid-cols-3">
                  {o.fotos.slice(0, 3).map((p) => (
                    <figure key={p} className="group overflow-hidden rounded-lg">
                      {urls[p] ? <img src={urls[p]} alt={`Foto da obra ${o.titulo}`} loading="lazy" className="h-64 w-full object-cover transition duration-700 group-hover:scale-105" /> : <div className="h-64 bg-secondary" />}
                    </figure>
                  ))}
                </div>
              )}
              <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent">
                    <span className="relative flex h-2.5 w-2.5" aria-hidden>
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 [animation-duration:2s] motion-reduce:hidden" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
                    </span>
                    {o.status}
                  </span>
                  <h3 className="mt-4 font-display text-3xl font-black uppercase">{o.titulo}</h3>
                  {(o.endereco || o.cidade) && <p className="mt-3 flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 text-primary" aria-hidden />{[o.endereco, o.cidade && `${o.cidade}/SC`].filter(Boolean).join(" — ")}</p>}
                </div>
                <div className="space-y-3">
                  {o.etapa && <p className="text-sm font-semibold">{o.etapa}</p>}
                  {o.prazo && <p className="flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="h-4 w-4" aria-hidden />Entrega prevista: {new Date(o.prazo + "T12:00:00").toLocaleDateString("pt-BR")}</p>}
                </div>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
