import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { filtrarObras, type ObraPublica } from "@/lib/obras-publicas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { ObraAtual, FeriasCountdown } from "./ObraAtual";

export function ObrasPublicadas() {
  const [mounted, setMounted] = useState(false);
  const [pesquisa, setPesquisa] = useState("");
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [prev, setPrev] = useState(false);
  const [next, setNext] = useState(false);
  useEffect(() => setMounted(true), []);
  const { data: obras = [], isPending, isError, refetch } = useQuery({
    queryKey: ["obras-publicas"],
    enabled: mounted,
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: 60000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("obras_publicas");
      if (error) throw error;
      return (data ?? []) as ObraPublica[];
    },
  });
  const paths = Array.from(new Set(obras.flatMap((o) => o.fotos)));
  const { data: urls = {} } = useQuery({
    queryKey: ["fotos-publicas", paths],
    enabled: mounted && paths.length > 0,
    staleTime: 1800000,
    refetchInterval: 1800000,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("obras").createSignedUrls(paths, 3600);
      if (error) throw error;
      const result: Record<string, string> = {};
      data?.forEach((foto) => { if (foto.path && foto.signedUrl) result[foto.path] = foto.signedUrl; });
      return result;
    },
  });
  const filtradas = filtrarObras(obras, pesquisa);
  useEffect(() => {
    if (!api) return;
    const sync = () => { setSelected(api.selectedScrollSnap()); setPrev(api.canScrollPrev()); setNext(api.canScrollNext()); };
    sync();
    api.on("select", sync);
    api.on("reInit", sync);
    return () => { api.off("select", sync); api.off("reInit", sync); };
  }, [api]);
  useEffect(() => { api?.scrollTo(0, true); }, [api, pesquisa]);

  return (
    <section id="obra" aria-labelledby="obras-titulo" className="scroll-mt-24 bg-surface py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Acompanhe sua obra</p>
        <h2 id="obras-titulo" className="mt-3 text-4xl font-black uppercase md:text-6xl">Nossas obras</h2>
        <div role="search" className="relative mt-8 mb-6">
          <label htmlFor="pesquisa-obras" className="sr-only">Pesquisar empreendimentos por nome, cidade ou endereço</label>
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input id="pesquisa-obras" value={pesquisa} onChange={(e) => setPesquisa(e.target.value)} placeholder="Nome, cidade ou endereço" className="h-12 bg-background pl-12 pr-14" aria-controls="resultados-obras" />
          {pesquisa && <Button variant="ghost" size="icon" onClick={() => { setPesquisa(""); document.getElementById("pesquisa-obras")?.focus(); }} aria-label="Limpar pesquisa" title="Limpar pesquisa" className="absolute right-2 top-1/2 -translate-y-1/2"><X aria-hidden /></Button>}
        </div>
        <div id="resultados-obras">
          {isPending ? <p role="status" className="py-12 text-center text-muted-foreground">Carregando obras…</p> : isError ? <div role="alert" className="py-12 text-center"><p className="text-muted-foreground">Não foi possível carregar as obras.</p><Button variant="outline" onClick={() => refetch()} className="mt-4">Tentar novamente</Button></div> : filtradas.length === 0 ? <div role="status" className="py-12 text-center"><p className="text-lg font-semibold">{obras.length ? "Nenhuma obra encontrada" : "Nenhuma obra publicada no momento"}</p>{obras.length > 0 && <p className="mt-2 text-sm text-muted-foreground">Tente outro nome, cidade ou endereço.</p>}</div> : (
            <Carousel setApi={setApi} opts={{ align: "start", duration: 25 }} aria-label="Obras publicadas" tabIndex={0}>
              <CarouselContent className="items-stretch">
                {filtradas.map((obra, i) => <CarouselItem key={obra.id} aria-label={`${i + 1} de ${filtradas.length}: ${obra.titulo}`} aria-hidden={i !== selected} inert={i !== selected}><ObraAtual obra={obra} urls={urls} /></CarouselItem>)}
              </CarouselContent>
              <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <Button variant="outline" size="icon" disabled={!prev} onClick={() => api?.scrollPrev()} aria-label="Obra anterior" title="Obra anterior"><ArrowLeft aria-hidden /></Button>
                <div className="min-w-0 text-center"><p role="status" aria-live="polite" className="text-xs text-muted-foreground">{Math.min(selected + 1, filtradas.length)} de {filtradas.length} {filtradas.length === 1 ? "obra" : "obras"}</p><div className="mt-1 flex flex-wrap justify-center gap-1">{filtradas.map((obra, i) => <Button key={obra.id} variant="ghost" size="icon" className="h-7 w-7" aria-label={`Ver obra ${i + 1}: ${obra.titulo}`} aria-current={i === selected ? "true" : undefined} title={obra.titulo} onClick={() => api?.scrollTo(i)}><span className={`h-2 w-2 rounded-full ${i === selected ? "bg-primary" : "bg-muted-foreground/40"}`} /></Button>)}</div></div>
                <Button variant="outline" size="icon" disabled={!next} onClick={() => api?.scrollNext()} aria-label="Próxima obra" title="Próxima obra"><ArrowRight aria-hidden /></Button>
              </div>
            </Carousel>
          )}
        </div>
        <FeriasCountdown />
      </div>
    </section>
  );
}
