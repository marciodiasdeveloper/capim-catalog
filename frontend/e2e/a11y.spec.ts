import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Acessibilidade automatizada (axe-core, WCAG 2 A/AA) nas páginas públicas.
 *
 * `color-contrast` é desabilitado no gate automático: os contrastes restantes
 * são de tokens de marca (--primary usado como fundo E como texto; accents de
 * categoria), cujo ajuste fino é uma decisão de design (ver "Limitações
 * conhecidas" no README). Todas as demais regras (nomes, ARIA, estrutura,
 * landmarks, etc.) são exigidas com zero violações sérias/críticas.
 */
const paths = ["/", "/ranking", "/confirmacao"];

for (const path of paths) {
  test(`sem violações sérias de acessibilidade em ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast"])
      .analyze();

    const serious = results.violations.filter((v) =>
      ["serious", "critical"].includes(v.impact ?? "")
    );
    expect(
      serious,
      serious.map((v) => `${v.id} (${v.nodes.length})`).join(", ")
    ).toEqual([]);
  });
}
