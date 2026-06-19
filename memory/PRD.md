# PlusEconomy — PRD

## Original Problem
Build PlusEconomy: a personal finance control web app (PT-BR/EN bilingual). Freemium + Premium SaaS model. Targets young adults 16–40. Requested features in 3 phases:

1. **Phase 1 (MVP)**: auth, manual transactions, simulated cards, spending limits w/ alerts, dashboard, premium with AI recommendations & advanced reports.
2. **Phase 2**: Investment Simulator (simple + compound interest, monthly contributions), full bug audit, PWA mobile-ready.
3. **Phase 3**: New brand icon, final audit & QA.

## Architecture
- Frontend: React 19 + React Router 7 + Tailwind + Shadcn UI + Recharts + Framer Motion + Sonner (toasts)
- Backend: FastAPI + Motor (MongoDB async) + Pydantic v2 + bcrypt + PyJWT + emergentintegrations (GPT-5.2)
- PWA: manifest.json + service worker (cache-first for assets, network-first for navigation), custom install prompt
- Auth: hybrid — JWT email/password + Emergent-managed Google OAuth (both supported simultaneously)
- AI: GPT-5.2 via Emergent LLM key (only for `is_premium=true` users)

## Personas
- **Maria (24, university student)**: tracks her side-hustle income and monthly subscriptions, wants gamified goals to save for travel.
- **João (32, freelancer)**: irregular income, wants categorical spending breakdowns and AI suggestions to cut waste.
- **Lara (28, beginner investor)**: wants to project a Tesouro/CDB scenario before locking money in.

## What's Implemented (Iteration 1 — Feb 19, 2026)
- ✅ Hybrid auth (JWT + Emergent Google)
- ✅ Transactions CRUD with filters
- ✅ Cards (simulated)
- ✅ Spending limits with monthly aggregation + alert flag
- ✅ Goals (with contribute/$inc)
- ✅ Dashboard summary + categories pie + recent + heuristic insights
- ✅ Reports (timeseries + by-category) — Premium gated
- ✅ PlusCoach AI chat (GPT-5.2) — Premium gated
- ✅ Mocked billing upgrade/downgrade
- ✅ Bilingual UI (PT/EN), Light/Dark theme — persisted to localStorage
- ✅ Cabinet Grotesk + Satoshi fonts, moss-green + terracotta palette

## What's Implemented (Iteration 2 — Feb 19, 2026)
- ✅ **Investment Simulator** (`/investments`): backend `POST /api/investments/simulate`, `/save`, `/saved`, `DELETE /saved/{id}`; supports simple/compound interest, monthly/annual rate, months/years duration, optional monthly contributions; returns 4 KPIs + 24 chart points + projection table rows. Math validated.
- ✅ 3 preset scenarios: Poupança, CDB 100%, Tesouro
- ✅ **PWA-ready**: manifest.json with shortcuts, service worker (pe-shell-v2), install prompt banner (`beforeinstallprompt`), apple-touch-icon, theme-color
- ✅ Mobile bottom navigation (5 tabs), responsive 390x844 verified
- ✅ Visual bug fix: Investment "Valor final" KPI text now visible (was hidden by pe-card bg override)

## What's Implemented (Iteration 3 — Feb 19, 2026)
- ✅ **New brand icon**: green credit-card-with-citrus art replaces "P+" placeholder across landing, login, register, sidebar, mobile bar, manifest, favicon, OG image, apple-touch-icon
- ✅ Generated icon-192.png (maskable), icon-512.png (maskable), apple-touch-icon.png (180px), favicon.ico (32+64), logo-icon.png (in-app), og-image.png (1200x630)
- ✅ Final API audit: all 9 main endpoints + 4 auth endpoints + AI chat + investment simulator = 200/expected status codes

## Test Credentials
- Free: `demo@plus.com / demo12345` (seeded transactions)
- Premium: `premium@plus.com / premium12345` (AI + Reports unlocked)

## Roadmap / Backlog
- **P1**: Real Stripe integration to replace mocked billing
- **P1**: Open Finance/Pluggy/Belvo integration for real bank syncing
- **P2**: Recurring transactions ("repeat monthly") for subscriptions and salary
- **P2**: PDF/Excel export of reports (was listed as Premium feature)
- **P2**: Push notifications (Web Push API) for limit alerts
- **P2**: Capacitor wrapper for native Android/iOS distribution (current PWA is installable on both, but stores require native shell)
- **P3**: Multi-currency support, household/shared accounts, investment portfolio tracking from quote feed
- **P3**: Achievements/badges system layered on goals
