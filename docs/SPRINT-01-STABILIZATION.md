# Sprint 01 — Personal learning stabilization

Public site: static GitHub Pages, free, no account, no payment, no VPS. QA Hub and C/C++ runner stay on localhost. Retain old server/admin account code in git; do not delete any runtime DB or account data.

- UI: fix full-width fixed navigation conflicting with sidebar; extend UI Studio to philosophy and ethics. Screenshot and geometry validation on staged site, desktop/mobile.
- Public account and billing entry points disabled in main learning page, old login route, swipe game and clinic leaderboard. Local progress remains; practice lab's fake patient login is deliberately retained.
- Control Center: actual content counts and per-request page availability, no fabricated user metrics; CI links, local backup only.
- Build stage excludes server dirs, secrets patterns, local databases and backups. Validation must pass before Pages artifact is uploaded.
- Local runner: loopback, same-origin JSON guard, single execution, optional hardened Docker configuration. Docker execution still needs separate sandbox tests before claiming isolation; never expose local mode publicly.
- Backup: validated allowlist, no token export, no silent reset, best-effort rollback; old keys outside supported set are explicitly reported and untouched.
- Do not deploy from feature branch. Staging means isolated branch content, not a public production preview. Cross-domain test uses intercepted HTTPS origins; real production sync and visual approval remain release gates.
