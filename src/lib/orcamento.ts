// Tipos e cálculo do orçamento (ficha técnica Renovar BR).

export type ItemServico = { id: string; descricao: string; unidade: string; quantidade: number; maoObraUnit: number };
export type ItemMaterial = { id: string; descricao: string; unidade: string; quantidade: number; precoUnit: number };
export type ItemEquip = { id: string; descricao: string; dias: number; valorDia: number };

export type Cliente = {
  nome: string; tipo: string; documento: string; contato: string; telefone: string; email: string; endereco: string;
};

export type Dados = {
  tipo: string; bairro: string; areaTotal: number; pavimentos: number; unidades: number;
  condicao: string; acesso: string; dataVisita: string; inicioPrevisto: string; observacoes: string;
};

export type Custos = {
  itens: ItemServico[];
  materiais: ItemMaterial[];
  equipamentos: ItemEquip[];
  outros: { transporte: number; alimentacao: number; descarte: number; art: number; diversos: number };
  lucroPct: number;
  impostoPct: number;
  descontoValor: number;
  prazoDias: number;
  validadeDias: number;
  pagamento: string;
  garantia: string;
  observacoes: string;
};

export const clienteVazio: Cliente = { nome: "", tipo: "Residencial", documento: "", contato: "", telefone: "", email: "", endereco: "" };
export const dadosVazios: Dados = {
  tipo: "Residencial", bairro: "", areaTotal: 0, pavimentos: 0, unidades: 0,
  condicao: "", acesso: "", dataVisita: "", inicioPrevisto: "", observacoes: "",
};
export const custosVazios: Custos = {
  itens: [], materiais: [], equipamentos: [],
  outros: { transporte: 0, alimentacao: 0, descarte: 0, art: 0, diversos: 0 },
  lucroPct: 30, impostoPct: 0, descontoValor: 0, prazoDias: 0, validadeDias: 15,
  pagamento: "", garantia: "", observacoes: "",
};

const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const r2 = (v: number) => Math.round(v * 100) / 100;

export function calcular(c: Custos) {
  const maoObra = c.itens.reduce((s, i) => s + n(i.quantidade) * n(i.maoObraUnit), 0);
  const materiais = c.materiais.reduce((s, i) => s + n(i.quantidade) * n(i.precoUnit), 0);
  const equipamentos = c.equipamentos.reduce((s, i) => s + n(i.dias) * n(i.valorDia), 0);
  const o = c.outros;
  const outros = n(o.transporte) + n(o.alimentacao) + n(o.descarte) + n(o.art) + n(o.diversos);
  const custoTotal = maoObra + materiais + equipamentos + outros;
  const comLucro = custoTotal * (1 + n(c.lucroPct) / 100);
  const imp = Math.min(Math.max(n(c.impostoPct), 0), 99) / 100;
  const precoBruto = comLucro / (1 - imp);
  const impostos = precoBruto - comLucro;
  const lucro = comLucro - custoTotal;
  const precoFinal = Math.max(0, precoBruto - n(c.descontoValor));
  const fator = custoTotal > 0 ? precoBruto / custoTotal : 0;
  return {
    maoObra: r2(maoObra), materiais: r2(materiais), equipamentos: r2(equipamentos), outros: r2(outros),
    custoTotal: r2(custoTotal), lucro: r2(lucro), impostos: r2(impostos),
    precoBruto: r2(precoBruto), precoFinal: r2(precoFinal), fator,
  };
}

export const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const uid = () => Math.random().toString(36).slice(2, 10);

export function whatsappToEmail(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `${digits}@admin.renovarbr.app` : "";
}

// Round each PDF line to cents and put any rounding remainder on the last line,
// so the lines always add up exactly to the gross price shown as subtotal/total.
export function arredondarLinhas(valores: number[], total: number) {
  if (!valores.length) return [];
  const linhas = valores.map(r2);
  const soma = linhas.slice(0, -1).reduce((s, v) => s + v, 0);
  linhas[linhas.length - 1] = r2(total - soma);
  return linhas;
}
