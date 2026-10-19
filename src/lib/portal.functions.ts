import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

// Client portal: passwords are checked in the database (bcrypt hashes) with attempt limits.
// Private photos are only signed after a successful check, with short-lived URLs.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const URL_TTL = 600;

function senhaValida(s: unknown) {
  return typeof s === "string" && s.length >= 1 && s.length <= 200;
}
function ip() {
  return (getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for")?.split(",")[0] ?? "").trim().slice(0, 64);
}
async function assinar(admin: Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"], paths: string[]) {
  if (!paths.length) return [];
  const { data } = await admin.storage.from("obras").createSignedUrls(paths, URL_TTL);
  return (data ?? []).filter((x) => x.signedUrl).map((x) => x.signedUrl as string);
}

export type PortalErro = "senha" | "bloqueado" | "sem_senha";
export type PortalObra = {
  titulo: string; cidade: string; endereco: string; status: string; etapa: string; prazo: string | null;
  ficha: string; atualizacoes: string; fotos: string[]; unidades: { id: string; identificador: string }[];
};
export type PortalUnidade = { identificador: string; fotos: string[]; servicos: string; inicio: string | null; conclusao: string | null; atualizacoes: string };

export const acessarObra = createServerFn({ method: "POST" })
  .inputValidator((d: { id: string; senha: string }) => {
    if (!UUID.test(d?.id ?? "") || !senhaValida(d?.senha)) throw new Error("Dados inválidos");
    return d;
  })
  .handler(async ({ data }): Promise<{ erro: PortalErro } | { obra: PortalObra }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: r, error } = await supabaseAdmin.rpc("portal_obra", { _id: data.id, _senha: data.senha, _ip: ip() });
    if (error) { console.error("portal_obra", error.message); throw new Error("Não foi possível verificar agora."); }
    const res = r as Record<string, unknown>;
    if (res.erro) return { erro: res.erro as PortalErro };
    const obra = res as unknown as PortalObra;
    return { obra: { ...obra, fotos: await assinar(supabaseAdmin, obra.fotos ?? []) } };
  });

export const acessarUnidade = createServerFn({ method: "POST" })
  .inputValidator((d: { obra: string; unidade: string; senha: string }) => {
    if (!UUID.test(d?.obra ?? "") || !UUID.test(d?.unidade ?? "") || !senhaValida(d?.senha)) throw new Error("Dados inválidos");
    return d;
  })
  .handler(async ({ data }): Promise<{ erro: PortalErro } | { unidade: PortalUnidade }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: r, error } = await supabaseAdmin.rpc("portal_unidade", { _obra: data.obra, _unidade: data.unidade, _senha: data.senha, _ip: ip() });
    if (error) { console.error("portal_unidade", error.message); throw new Error("Não foi possível verificar agora."); }
    const res = r as Record<string, unknown>;
    if (res.erro) return { erro: res.erro as PortalErro };
    const u = res as unknown as PortalUnidade;
    return { unidade: { ...u, fotos: await assinar(supabaseAdmin, u.fotos ?? []) } };
  });
