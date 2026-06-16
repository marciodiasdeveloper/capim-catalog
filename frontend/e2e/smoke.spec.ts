import { test, expect } from "@playwright/test";

test("páginas principais carregam com seus títulos", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /monte seu pedido/i })
  ).toBeVisible();

  await page.goto("/ranking");
  await expect(
    page.getByRole("heading", { level: 1, name: /ranking do mês/i })
  ).toBeVisible();

  await page.goto("/confirmacao");
  await expect(page.getByText(/nenhum pedido para confirmar/i)).toBeVisible();
});

test("adicionar um produto atualiza o resumo do pedido", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Aumentar quantidade" })
    .first()
    .click();
  // O link do carrinho passa a anunciar a contagem de itens no aria-label.
  await expect(page.getByLabel(/Ver resumo do pedido \(\d+ ite/)).toBeVisible();
});
