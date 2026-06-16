---
description: Sobe ou inspeciona o servidor de desenvolvimento do Capim Catalog em http://localhost:3002. Use para rodar/abrir o app, tirar print de uma mudança ou conferir uma página no navegador.
allowed-tools: Bash(npm run dev:*) Bash(curl:*) Read
---

# Rodar o app (dev)

O app fica em `frontend/` e roda na porta **3002** (não 3000). Em geral o dev server **já está rodando** em outro terminal — confira antes de iniciar outro.

## Passos

1. **Já está no ar?**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" --max-time 25 http://localhost:3002/
   ```
   `200` = rodando, pode usar direto.
2. **Se não responder**, inicie em background (de `frontend/`):
   ```bash
   npm run dev
   ```
   Aguarde o "Ready" e revalide com o `curl` acima.
3. **Conferir páginas-chave:** `/` (catálogo), `/ranking`, `/confirmacao`, `/admin/login`.

## Notas

- Não inicie um segundo dev server se a porta 3002 já responde.
- O catálogo funciona **sem Supabase** (dados mock). Pedido real, ranking e `/admin` precisam de `.env.local` (ver skill `configurar-supabase`).
