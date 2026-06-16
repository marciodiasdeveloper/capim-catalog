import { test, expect } from "@playwright/test";

/**
 * Fluxo completo: monta o pedido, preenche os dados e finaliza, chegando na
 * confirmação. Roda em modo mock-first (sem Supabase) — o pedido é criado
 * localmente, exercitando o caminho do cliente de ponta a ponta.
 */
test("checkout completo chega na confirmação", async ({ page }) => {
  await page.goto("/");

  // 1) adiciona um produto
  await page
    .getByRole("button", { name: "Aumentar quantidade" })
    .first()
    .click();

  // 2) seleciona Estado (base-ui Select)
  await page.getByLabel("Estado").click();
  await page.getByRole("option", { name: /Minas Gerais/ }).click();

  // 3) seleciona a entrega
  await page.getByLabel("Entrega").click();
  await page.getByRole("option").first().click();

  // 4) preenche os dados do cliente
  await page.getByLabel("Nome completo").fill("Maria Teste");
  await page.getByLabel("CPF").fill("39053344705");
  await page.getByLabel("Telefone").fill("37999998888");
  await page.getByLabel("CEP").fill("35500000");
  await page.getByLabel("Rua").fill("Rua A");
  await page.getByLabel("Número").fill("10");
  await page.getByLabel("Bairro").fill("Centro");
  await page.getByLabel("Cidade").fill("Divinópolis");

  // 5) consentimento + finalizar
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /finalizar pedido/i }).click();

  // 6) confirmação
  await expect(page).toHaveURL(/\/confirmacao/);
  await expect(
    page.getByRole("heading", { name: /pedido #\d+ recebido/i })
  ).toBeVisible();
});
