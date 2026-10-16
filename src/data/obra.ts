// Dados da obra em andamento — edite aqui.
// Fotos: importe os arquivos e coloque em `photos` (ex.: import foto1 from "@/assets/obra-1.jpg").
export const obraAtual = {
  titulo: "Obra atual",
  status: "Acabamento e finalização",
  etapa: "Etapa atual: acabamento e finalização",
  // Endereço ainda não informado pelo cliente. Preencha quando receber (ex.: "Rua X, 123 — Itapema/SC").
  endereco: "" as string,
  // Prazo informado pelo cliente (horário de Santa Catarina).
  prazo: "2026-10-20T18:00:00-03:00",
  prazoLabel: "20/10/2026",
  photos: [] as { src: string; alt: string }[],
};

export const ferias = {
  data: "2026-12-24T00:00:00-03:00",
  label: "24/12/2026",
};
