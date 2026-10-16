import logo from "@/assets/renovar-logo.png.asset.json";

type Props = { className?: string; showTagline?: boolean };

export function Logo({ className = "" }: Props) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <img src={logo.url} alt="Renovar BR — Pintura, Reforma, Acabamento" width={1375} height={1004} className="h-14 w-auto md:h-16" />
    </span>
  );
}
