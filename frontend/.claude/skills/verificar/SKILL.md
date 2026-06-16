---
description: Verifica o projeto Capim Catalog — roda typecheck (tsc --noEmit), lint (eslint) e checa o app em http://localhost:3002. Use após mudanças de código ou quando pedirem para "verificar"/"validar".
allowed-tools: Bash(npx tsc:*) Bash(npm run lint:*) Bash(npx eslint:*) Bash(curl:*) Read
---

# Verificar

Rode a partir de `frontend/` (o app vive lá; porta 3002, **não** 3000). Não há test runner — esta é a verificação padrão.

## Passos

1. **Typecheck:** `npx tsc --noEmit`
2. **Lint:** `npm run lint` (ou `npx eslint <arquivos alterados>` para ser mais rápido)
3. **App no ar (se o dev server estiver rodando):**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" --max-time 25 http://localhost:3002/
   curl -s -o /dev/null -w "%{http_code}" --max-time 25 http://localhost:3002/confirmacao
   ```
   200 = compilou sem erro de build. Se não responder, o dev server pode estar parado (`npm run dev`); não inicie um novo sem necessidade.

## Reporte

Diga claramente o resultado de cada etapa. Se houver erros de tsc/lint, liste-os com arquivo:linha e proponha a correção. Não declare "verificado" se algo falhou.
