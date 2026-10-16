import { describe, it, expect } from "vitest";
import { calcular, custosVazios, whatsappToEmail } from "./orcamento";

const base = { ...custosVazios, itens: [{ id: "1", descricao: "Pintura", unidade: "m²", quantidade: 100, maoObraUnit: 10 }] };

describe("orçamento", () => {
  it("aplica lucro sobre o custo", () => {
    expect(calcular({ ...base, lucroPct: 30 }).precoFinal).toBe(1300);
  });
  it("impostos incidem sobre o preço final", () => {
    expect(calcular({ ...base, lucroPct: 30, impostoPct: 10 }).precoFinal).toBe(1444.44);
  });
  it("desconto é abatido do total", () => {
    expect(calcular({ ...base, lucroPct: 0, descontoValor: 100 }).precoFinal).toBe(900);
  });
  it("login pelo WhatsApp usa só os números", () => {
    expect(whatsappToEmail("(47) 99795-3323")).toBe("4799795332 3@admin.renovarbr.app".replace(" ", ""));
  });
});
