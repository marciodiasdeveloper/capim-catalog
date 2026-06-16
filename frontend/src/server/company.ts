import "server-only";

import { cache } from "react";

import type { Company } from "@/data/company";
import { COMPANY as MOCK_COMPANY } from "@/data/company";
import { createReadClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { mapCompany } from "./row-mappers";

/**
 * Dados da empresa. Lê do Supabase quando configurado; caso contrário (ou se a
 * linha ainda não existe) cai no mock (`src/data/company.ts`), mantendo o app
 * funcional sem banco. `cache()` deduplica a consulta dentro da mesma requisição.
 */
export const getCompany = cache(async (): Promise<Company> => {
  if (!isSupabaseConfigured()) return MOCK_COMPANY;

  const supabase = createReadClient();
  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error) throw new Error(`Erro ao carregar empresa: ${error.message}`);
  return data ? mapCompany(data) : MOCK_COMPANY;
});
