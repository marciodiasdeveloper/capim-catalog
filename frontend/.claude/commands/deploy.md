---
description: Checklist de pré-deploy + deploy do Capim Catalog (Vercel).
disable-model-invocation: true
argument-hint: "[prod|preview]"
allowed-tools: Bash(npm run build:*) Bash(npm run lint:*) Bash(npx tsc:*) Bash(npx vercel:*) Bash(vercel:*) Bash(git status:*) Bash(git push:*) Read
---

# Deploy ($ARGUMENTS)

Deploy é na **Vercel** (ver `frontend/README.md`; `.vercel` indica projeto já linkado). Rode tudo a partir de `frontend/`. Alvo: `$ARGUMENTS` (use `prod` para produção; padrão = preview).

## Pré-deploy (obrigatório)

1. `npx tsc --noEmit` — sem erros de tipo.
2. `npm run lint` — sem erros.
3. `npm run build` — build de produção passa (pega erros que o dev não pega).
4. Confirme que as variáveis de ambiente estão setadas **no projeto da Vercel** (não só no `.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`. Sem elas, a loja roda em modo mock e o `/admin`/pedidos quebram em produção.

## Deploy

- Se o repositório está conectado à Vercel (deploy por git): `git status` para revisar, então faça push do branch (produção normalmente = `main`).
- Caso contrário, via CLI: `npx vercel` (preview) ou `npx vercel --prod` (produção).

## Pós-deploy

Abra a URL e confirme `/`, `/confirmacao` e `/admin/login`. Se algo depender do banco e falhar, revise as env vars na Vercel.

> Se o método de deploy do projeto for diferente do acima, **pergunte ao usuário** antes de prosseguir — não force um push.
