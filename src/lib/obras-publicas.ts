export type ObraPublica = {
  id: string;
  titulo: string;
  cidade: string;
  endereco: string;
  status: string;
  etapa: string;
  prazo: string | null;
  fotos: string[];
};

function normalizar(texto: string) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

export function filtrarObras(obras: ObraPublica[], pesquisa: string) {
  const termo = normalizar(pesquisa);
  const unicas = Array.from(new Map(obras.map((obra) => [obra.id, obra])).values());
  if (!termo) return unicas;
  return unicas.filter((obra) => [obra.titulo, obra.cidade, obra.endereco].some((campo) => normalizar(campo).includes(termo)));
}

// The admin stores a calendar date; preserve the original 18:00 SC delivery cutoff.
export function prazoEntrega(prazo: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(prazo) ? `${prazo}T18:00:00-03:00` : prazo;
}