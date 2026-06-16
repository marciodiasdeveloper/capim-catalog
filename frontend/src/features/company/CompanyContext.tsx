"use client";

import { createContext, useContext } from "react";

import type { Company } from "@/data/company";

const CompanyContext = createContext<Company | null>(null);

/**
 * Disponibiliza os dados da empresa (carregados no servidor via `getCompany()`)
 * para os Client Components do storefront (header, PIX, confirmação).
 */
export function CompanyProvider({
  company,
  children,
}: {
  company: Company;
  children: React.ReactNode;
}) {
  return (
    <CompanyContext.Provider value={company}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany(): Company {
  const company = useContext(CompanyContext);
  if (!company) {
    throw new Error("useCompany deve ser usado dentro de <CompanyProvider>.");
  }
  return company;
}
