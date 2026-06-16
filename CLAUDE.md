# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This folder is just a wrapper. **The actual app — a Next.js 16 storefront — lives in `frontend/`**, which is the git repository.

- Work and run commands from `frontend/` (`cd frontend`). Dev server runs on **http://localhost:3002** (`pnpm dev`).
- **Package manager: pnpm only — never npm/npx** (the repo uses `pnpm-lock.yaml`). Use `pnpm install`, `pnpm dev/build/lint/seed`, and `pnpm dlx` instead of `npx`.
- The full project guide is **`frontend/CLAUDE.md`** (architecture, commands, conventions) and **`frontend/AGENTS.md`** (this is a *modified* Next.js — read `node_modules/next/dist/docs/` before using Next APIs).
- Project Claude Code config (subagents, skills, permissions) lives in **`frontend/.claude/`**. The `.claude/settings.json` here just mirrors the permission allowlist so it also applies when you launch Claude from this root.

Prefer launching Claude Code from `frontend/` so all of `frontend/CLAUDE.md` and `frontend/.claude/` load with full fidelity.
