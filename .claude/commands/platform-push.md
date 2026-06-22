---
description: Publica o Capim Catalog — gates (tsc/lint/test/build), commit correto e push na main (deploy automático na Vercel).
disable-model-invocation: true
argument-hint: "[mensagem de commit opcional]"
allowed-tools: Bash(cd frontend:*) Bash(pnpm build:*) Bash(pnpm lint:*) Bash(pnpm exec tsc:*) Bash(pnpm exec vitest:*) Bash(pnpm test:*) Bash(git add:*) Bash(git commit:*) Bash(git push:*) Bash(git status:*) Bash(git diff:*) Bash(git log:*) Read
---

# Publicar (`/platform-push`)

Publica a aplicação: roda os **gates de qualidade**, faz **um commit correto** e **push na `main`** — o que dispara o **deploy automático na Vercel**. Mensagem de commit sugerida pelo usuário (opcional): `$ARGUMENTS`.

> Repositório git: raiz do projeto (`capim-catalog`). O app fica em `frontend/` — **rode os comandos de build/test a partir de `frontend/`** (`cd frontend`). **pnpm only** (nunca npm/npx). Branch de produção = `main` (tracking `origin/main`).

## 1. Revisar o que vai ser publicado

1. `git status` e `git diff --stat` — veja os arquivos alterados. Se não houver nada para commitar e o branch já estiver à frente do remoto, vá direto ao push (passo 4).
2. Se houver mudança de **schema** (`frontend/supabase/migrations/*.sql`) ainda **não aplicada** no Supabase de produção: **avise o usuário** que a migration precisa ser rodada no banco antes/junto do deploy (a Vercel não roda migrations). Não tente aplicar você mesmo sem autorização explícita.

## 2. Gates de qualidade (obrigatório — pare no primeiro que falhar)

Rode a partir de `frontend/`:

1. `cd frontend && pnpm exec tsc --noEmit` — sem erros de tipo.
2. `cd frontend && pnpm lint` — sem erros.
3. `cd frontend && pnpm exec vitest run` — todos os testes passam.
4. `cd frontend && pnpm build` — build de produção passa (pega erros que o `dev` não pega; este é um Next 16 **modificado**).

**Se qualquer gate falhar: PARE.** Mostre o erro ao usuário e não faça commit/push.

## 3. Commit correto

1. `git add -A` (ou só os arquivos relevantes, se houver lixo no working tree).
2. Crie **um** commit no padrão **Conventional Commits** em pt-BR, derivando o tipo e o escopo do diff real:
   - `feat: …` (nova funcionalidade), `fix: …` (correção), `refactor:`, `test:`, `chore:`, `docs:`…
   - Assunto curto no imperativo; se útil, um corpo com bullets do que mudou.
   - Se o usuário passou `$ARGUMENTS`, use como base da mensagem (ajuste para o padrão).
   - **NUNCA** inclua o Claude (nem qualquer IA/ferramenta) como **co-author** ou **contributor** — sem trailer `Co-authored-by:`, sem `Co-Authored-By: Claude`, sem `Generated with…`/menções a ferramentas. A mensagem fala **só** da mudança. Regra fixa, sem exceção (mesmo que o usuário peça).

## 4. Push na main (deploy)

1. Confirme o branch: deve ser `main`. Se não for, **pergunte ao usuário** antes de prosseguir (não publique de outro branch sem confirmação).
2. `git push origin main`.
3. Isso dispara o **deploy na Vercel** (projeto conectado por git). Não é preciso `vercel --prod`.

## 5. Pós-publicação

1. Informe o commit (hash + mensagem) e que o push foi feito.
2. Lembre o usuário de conferir o deploy em <https://capim-catalog.vercel.app> (`/`, `/confirmacao`, `/admin/login`).
3. Se algo que depende do banco falhar em produção, verifique as **env vars na Vercel** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAILS`) e se as **migrations** pendentes foram aplicadas no Supabase.

> Regra de ouro: **nunca** faça push se um gate falhou; e **nunca** adicione Claude/IA como co-author ou contributor no commit. Em dúvida sobre o método de publicação ou o branch, pergunte antes.
