import { useEffect, useState } from "react";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { dias: Math.floor(s / 86400), horas: Math.floor((s % 86400) / 3600), min: Math.floor((s % 3600) / 60), seg: s % 60 };
}

export function Countdown({ target, doneText = "Prazo atingido" }: { target: string; doneText?: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = now === null ? null : new Date(target).getTime() - now;
  if (diff !== null && diff <= 0) return <p className="font-display text-xl font-bold text-accent">{doneText}</p>;
  const p = diff === null ? null : parts(diff);
  const items: [string, number | undefined][] = [
    ["Dias", p?.dias], ["Horas", p?.horas], ["Min", p?.min], ["Seg", p?.seg],
  ];
  return (
    <div className="grid grid-cols-4 gap-2" role="timer" aria-live="off">
      {items.map(([l, v]) => (
        <div key={l} className="rounded-md border border-border bg-background/60 px-2 py-3 text-center">
          <span key={v} className="block animate-tick font-display text-3xl font-black tabular-nums md:text-4xl">
            {v === undefined ? "--" : String(v).padStart(2, "0")}
          </span>
          <span className="mt-1 block text-[0.65rem] uppercase tracking-widest text-muted-foreground">{l}</span>
        </div>
      ))}
    </div>
  );
}
