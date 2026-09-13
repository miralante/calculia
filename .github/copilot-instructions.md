# copilot-instructions.md — compatibility pointer

> **This file is a compatibility pointer for GitHub Copilot Chat, not a
> source of truth.** The authoritative AI agent workflow for this
> repository is [`CLAUDE.md`](../CLAUDE.md). Read that file first.

If you are an AI agent working on this repository (Claude Code, GitHub
Copilot Chat, Cursor, …):

1. Read [`CLAUDE.md`](../CLAUDE.md) — it carries the canonical-source
   table, language policy, accessibility rules and agent workflow.
2. Use the canonical-document table in `CLAUDE.md` to pick the source of
   truth for the task (product, technical architecture, i18n, catalog,
   therapeutic guidance, roadmap).
3. Do not duplicate `CLAUDE.md` content here. Keep
   `.github/copilot-instructions.md` as a one-line pointer.

For codebase questions about architecture, structure, components or
relationships, prefer `graphify query "<question>"` (uses
`graphify-out/graph.json`) over raw source browsing — this is already
documented in `CLAUDE.md` §"graphify".
