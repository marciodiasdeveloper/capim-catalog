/**
 * Dados da empresa/marca (mock). Único ponto a editar para PIX, WhatsApp e identidade.
 */

export interface Company {
  name: string;
  tagline: string;
  /** DDI + DDD + número, só dígitos (ex.: 55 + 11 + 9XXXXXXXX). */
  whatsapp: string;
  /** Nome de exibição do atendente que recebe os pedidos. */
  atendente: string;
  pix: {
    titular: string;
    chaveTipo: string;
    chave: string;
    banco: string;
  };
}

export const COMPANY: Company = {
  name: "Capim Catalog",
  tagline: "Sua farmácia de bairro, agora online",
  whatsapp: "553799447506",
  atendente: "Equipe Capim",
  pix: {
    titular: "Capim Distribuidora de Medicamentos LTDA",
    chaveTipo: "CNPJ",
    chave: "12.345.678/0001-90",
    banco: "Nubank",
  },
};
