type Props = { className?: string; showTagline?: boolean };

export function Logo({ className = "", showTagline = true }: Props) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 64 64" className="h-11 w-11 shrink-0" role="img" aria-label="Renovar BR">
        {/* Roof / house */}
        <path d="M6 30 L32 8 L58 30" fill="none" className="stroke-brand-orange" strokeWidth="5" strokeLinejoin="miter" strokeLinecap="square" />
        {/* Buildings */}
        <g className="fill-foreground">
          <rect x="14" y="30" width="10" height="26" />
          <rect x="27" y="22" width="11" height="34" />
          <rect x="41" y="34" width="9" height="22" />
        </g>
        {/* Windows */}
        <g className="fill-background">
          <rect x="17" y="35" width="4" height="4" /><rect x="17" y="43" width="4" height="4" />
          <rect x="30" y="27" width="5" height="4" /><rect x="30" y="35" width="5" height="4" /><rect x="30" y="43" width="5" height="4" />
          <rect x="43.5" y="39" width="4" height="4" />
        </g>
        <rect x="8" y="57" width="48" height="2.5" className="fill-brand-orange" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="font-display text-2xl font-black italic tracking-tight text-foreground">
          Renovar <span className="text-brand-orange">BR</span>
        </span>
        {showTagline && (
          <>
            <span className="mt-1 block h-px w-full bg-brand-orange" aria-hidden />
            <span className="mt-1 text-[0.58rem] font-semibold tracking-[0.18em] text-muted-foreground">
              PINTURA <span className="text-brand-orange">•</span> REFORMA <span className="text-brand-orange">•</span> ACABAMENTO
            </span>
          </>
        )}
      </span>
    </span>
  );
}
