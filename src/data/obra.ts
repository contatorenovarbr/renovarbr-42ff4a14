import f1 from "@/assets/obra-1.jpg.asset.json";
import f2 from "@/assets/obra-2.jpg.asset.json";
import f3 from "@/assets/obra-3.jpg.asset.json";
// Dados da obra em andamento — edite aqui.
// Fotos: importe os arquivos e coloque em `photos` (ex.: import foto1 from "@/assets/obra-1.jpg").
export const obraAtual = {
  titulo: "Obra atual",
  status: "Acabamento e finalização",
  etapa: "Etapa atual: acabamento e finalização",
  // Endereço informado pelo cliente.
  endereco: "Rua 267, nº 106 — Edifício Dona Yolanda, Meia Praia, Itapema/SC",
  // Prazo informado pelo cliente (horário de Santa Catarina).
  prazo: "2026-10-20T18:00:00-03:00",
  prazoLabel: "20/10/2026",
  photos: [
    { src: f1.url, alt: "Foto real da obra atual da Renovar BR — 1" },
    { src: f2.url, alt: "Foto real da obra atual da Renovar BR — 2" },
    { src: f3.url, alt: "Foto real da obra atual da Renovar BR — 3" },
  ] as { src: string; alt: string }[],
};

export const ferias = {
  data: "2026-12-24T00:00:00-03:00",
  label: "24/12/2026",
};
