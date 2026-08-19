# Architecture Decision Records

Drawberry keeps a **single ADR log**, and it lives in the backend repo:
`drawberry-backend/docs/adr/`. New ADRs are numbered sequentially there regardless of
which repo they mostly affect.

Decisions that are implemented **in this frontend** but recorded in that log:

- **0004 — Compile emails by measuring the rendered canvas, not by mapping styles to
  tables.** The frontend measures the real canvas layout and emits tables from the
  observed geometry.
- **0005 — The frontend is the sole producer of compiled email HTML; the backend stores
  and serves it.** Compilation (measure → emit → chrome) runs here; the backend keeps only
  storage + serving.
- **0006 — Force light mode in exported emails; emit no dark-mode variant.**

See `drawberry-backend/docs/adr/` for the full text and the rest of the log.
