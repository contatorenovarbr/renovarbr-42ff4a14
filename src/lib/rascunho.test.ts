import { describe, it, expect } from "vitest";
import { chaveRascunho, rascunhoMaisNovo } from "./rascunho";

describe("rascunho da ficha", () => {
  it("chave separa usuário e ficha", () => {
    expect(chaveRascunho("u1", "f1")).toBe("renovar:ficha:u1:f1");
  });
  it("rascunho posterior ao último salvamento é restaurado", () => {
    expect(rascunhoMaisNovo({ v: 1, ts: Date.parse("2026-10-19T10:00:05Z"), estado: {} }, "2026-10-19T10:00:00Z")).toBe(true);
  });
  it("rascunho antigo não sobrescreve o banco", () => {
    expect(rascunhoMaisNovo({ v: 1, ts: Date.parse("2026-10-19T09:00:00Z"), estado: {} }, "2026-10-19T10:00:00Z")).toBe(false);
  });
  it("sem rascunho, mantém o banco", () => {
    expect(rascunhoMaisNovo(null, "2026-10-19T10:00:00Z")).toBe(false);
  });
});
