import { describe, expect, it } from "vitest";
import { cidadesAtendidas } from "@/data/cidades";
import { filtrarObras, prazoEntrega, type ObraPublica } from "./obras-publicas";

const obra: ObraPublica = { id: "cadastro-real", titulo: "Edifício Dona Yolanda", cidade: "Itapema", endereco: "Rua 267, nº 106", status: "Acabamento e finalização", etapa: "Acabamento", prazo: "2026-10-20", fotos: [] };

describe("Publicação das obras", () => {
  it("mantém as quatro cidades e adiciona Itajaí", () => {
    expect([...cidadesAtendidas]).toEqual(["Porto Belo", "Itapema", "Balneário Camboriú", "Camboriú", "Itajaí"]);
  });
  it("filtra pelo nome sem distinguir acentos ou maiúsculas", () => {
    expect(filtrarObras([obra], "EDIFICIO DONA")).toEqual([obra]);
    expect(filtrarObras([obra], "Outra obra")).toEqual([]);
  });
  it("filtra pela cidade", () => {
    expect(filtrarObras([obra], "itapema")).toEqual([obra]);
    expect(filtrarObras([obra], "Itajaí")).toEqual([]);
  });
  it("filtra pelo endereço", () => {
    expect(filtrarObras([obra], "Rua 267")).toEqual([obra]);
    expect(filtrarObras([obra], "Rua 999")).toEqual([]);
  });
  it("limpar a pesquisa restaura só os registros recebidos", () => {
    expect(filtrarObras([obra], "  ")).toEqual([obra]);
    expect(filtrarObras([], "")).toEqual([]);
  });
  it("exibe uma obra uma única vez por cadastro", () => {
    expect(filtrarObras([obra, obra], "")).toEqual([obra]);
  });
  it("mantém a obra em andamento antes de propostas e obras concluídas", () => {
    const proposta = { ...obra, id: "proposta", status: "Orçamento" };
    expect(filtrarObras([proposta, obra], "").map((o) => o.id)).toEqual(["cadastro-real", "proposta"]);
  });
  it("usa mudanças do cadastro em vez de manter dados fixos", () => {
    const editada = { ...obra, titulo: "Nome atualizado", cidade: "Itajaí", fotos: ["nova-foto.jpg"] };
    expect(filtrarObras([editada], "Yolanda")).toEqual([]);
    expect(filtrarObras([editada], "Itajai")).toEqual([editada]);
  });
  it("preserva o prazo local de entrega às 18h ao ler a data do painel", () => {
    expect(prazoEntrega("2026-10-20")).toBe("2026-10-20T18:00:00-03:00");
  });
});