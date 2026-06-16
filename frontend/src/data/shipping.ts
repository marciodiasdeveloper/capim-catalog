/**
 * Opções de entrega (mock) calculadas por UF. As opções só aparecem após o
 * cliente informar o estado — daí o placeholder "Preencha a UF...".
 */

export interface DeliveryOption {
  id: string;
  label: string;
  price: number;
  eta: string;
}

type Region = "sudeste" | "sul" | "centro-oeste" | "nordeste" | "norte";

const REGION_BY_UF: Record<string, Region> = {
  MG: "sudeste", SP: "sudeste", RJ: "sudeste", ES: "sudeste",
  PR: "sul", SC: "sul", RS: "sul",
  DF: "centro-oeste", GO: "centro-oeste", MT: "centro-oeste", MS: "centro-oeste",
  BA: "nordeste", SE: "nordeste", AL: "nordeste", PE: "nordeste", PB: "nordeste",
  RN: "nordeste", CE: "nordeste", PI: "nordeste", MA: "nordeste",
  TO: "norte", PA: "norte", AP: "norte", AM: "norte", RR: "norte",
  AC: "norte", RO: "norte",
};

/** Acréscimo de frete por região (em R$). */
const REGION_SURCHARGE: Record<Region, number> = {
  sudeste: 0,
  sul: 8,
  "centro-oeste": 14,
  nordeste: 20,
  norte: 28,
};

/** Opções de entrega disponíveis para a UF informada. */
export function getDeliveryOptions(uf: string): DeliveryOption[] {
  if (!uf) return [];
  const region = REGION_BY_UF[uf] ?? "sudeste";
  const surcharge = REGION_SURCHARGE[region];

  return [
    { id: "retirada", label: "Retirada no balcão", price: 0, eta: "Disponível hoje" },
    {
      id: "sedex",
      label: "Sedex",
      price: 28 + surcharge,
      eta: "2 a 4 dias úteis",
    },
    {
      id: "transportadora",
      label: "Transportadora",
      price: 42 + surcharge,
      eta: "4 a 8 dias úteis",
    },
  ];
}

export function findDeliveryOption(
  uf: string,
  id: string
): DeliveryOption | undefined {
  return getDeliveryOptions(uf).find((option) => option.id === id);
}
