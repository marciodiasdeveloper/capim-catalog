import { defineConfig } from "vitest/config";

/**
 * Vitest — testes unitários da lógica pura (lib, server pricing, reducer do carrinho).
 * Ambiente node; o alias `@/` é resolvido nativamente pelo Vite a partir do tsconfig.
 */
export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
    globals: false,
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Cobertura focada na lógica pura testada (sem UI/componentes nem
      // código server-only do Supabase, que não roda em testes unitários).
      include: [
        "src/lib/pricing.ts",
        "src/lib/format.ts",
        "src/lib/validation.ts",
        "src/lib/cep.ts",
        "src/lib/whatsapp.ts",
        "src/lib/supabase/config.ts",
        "src/data/shipping.ts",
        "src/features/cart/cart-reducer.ts",
      ],
    },
  },
});
