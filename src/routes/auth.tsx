import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { whatsappToEmail } from "@/lib/orcamento";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Área administrativa — Renovar BR" },
      { name: "description", content: "Acesso restrito da equipe Renovar BR." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Área administrativa — Renovar BR" },
      { property: "og:description", content: "Acesso restrito da equipe Renovar BR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [primeiro, setPrimeiro] = useState<boolean | null>(null);
  const [phone, setPhone] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) navigate({ to: "/admin", replace: true }); });
    supabase.rpc("admin_exists").then(({ data }) => setPrimeiro(data === false));
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const email = whatsappToEmail(phone);
    if (email.length < 20) { toast.error("Informe o número de WhatsApp completo, com DDD."); return; }
    if (pass.length < 8) { toast.error("A senha precisa ter pelo menos 8 caracteres."); return; }
    setBusy(true);
    try {
      if (primeiro) {
        if (pass !== pass2) { toast.error("As senhas não conferem."); return; }
        const { error } = await supabase.auth.signUp({ email, password: pass, options: { emailRedirectTo: window.location.origin } });
        if (error) { toast.error(error.message.includes("weak") || error.message.includes("pwned") ? "Senha fraca ou já vazada na internet. Escolha outra." : "Não foi possível criar o acesso."); return; }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) { toast.error("WhatsApp ou senha incorretos."); return; }
      }
      navigate({ to: "/admin", replace: true });
    } finally { setBusy(false); }
  }

  const input = "w-full rounded-md border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary";
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-2xl">
        <Link to="/" aria-label="Voltar ao site"><Logo /></Link>
        <h1 className="mt-6 flex items-center gap-2 text-2xl font-black uppercase"><Lock className="h-5 w-5 text-primary" aria-hidden /> Área administrativa</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {primeiro ? "Primeiro acesso: crie a senha do administrador. Depois disso, ninguém mais consegue criar um acesso administrativo." : "Entre com o WhatsApp e a sua senha."}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold">WhatsApp (com DDI e DDD)
            <input className={`${input} mt-1`} inputMode="tel" autoComplete="username" placeholder="55 47 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </label>
          <label className="block text-sm font-semibold">Senha
            <input className={`${input} mt-1`} type="password" autoComplete={primeiro ? "new-password" : "current-password"} value={pass} onChange={(e) => setPass(e.target.value)} required />
          </label>
          {primeiro && (
            <label className="block text-sm font-semibold">Repita a senha
              <input className={`${input} mt-1`} type="password" autoComplete="new-password" value={pass2} onChange={(e) => setPass2(e.target.value)} required />
            </label>
          )}
          <button disabled={busy || primeiro === null} className="w-full rounded-md bg-primary px-4 py-3 font-bold text-primary-foreground hover:brightness-110 disabled:opacity-60">
            {busy ? "Aguarde…" : primeiro ? "Criar acesso" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
