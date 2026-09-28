# Technical Test — Full Stack Developer

**Company:** PT Hillir Tumbuh Bersama (hillir.id)
**Source:** `Pressure Technical Test - Fullstack Developer.pdf`
**Converted:** via MarkItDown

---

## 1. Main Mission

> Bangun 1 aplikasi web kalkulator ROI iklan dengan fitur **Authentication** yang berfungsi penuh berdasarkan desain UI terlampir. Aplikasi harus berfungsi layaknya SaaS sederhana dimana data perhitungan setiap user tersimpan secara privat.

Build one ad-ROI calculator web app with fully working authentication, following the attached UI design. It should behave like a simple SaaS where each user's calculation data is stored privately.

**Note:** They do **not** provide the ROI/Margin formula — independent business-logic research is expected and must be justifiable.

---

## 2. Scope of Work → Requirement Checklist

### 2.1 Authentication Module
| # | Requirement | Detail |
|---|-------------|--------|
| A1 | Login & Register UI | Pages to sign up and sign in |
| A2 | Password hashing | Passwords MUST be hashed in the DB. Never store plaintext |
| A3 | Session management | JWT **or** session-based auth so the user stays logged in after page refresh |

### 2.2 Frontend — Calculator Dashboard
| # | Requirement | Detail |
|---|-------------|--------|
| F1 | Protected route | Calculator & History only accessible when logged in; otherwise redirect to Login |
| F2 | Real-time logic | ROI, Margin, Revenue calculated instantly |
| F3 | Input sync | Slider ↔ Number input synchronization |
| F4 | UI/UX | Login + Dashboard + Calculator pages matching the design reference; free to customize creatively |
| F5 | History log | Only shows the logged-in user's own data |

### 2.3 Backend — API & Database
| # | Requirement | Detail |
|---|-------------|--------|
| B1 | User-centric data | "Save Calculation" stores data tied to the currently logged-in User ID |
| B2 | Isolation | History Log only shows that user's data — User A must not see User B's history |
| B3 | `POST /auth/register` | Register endpoint |
| B4 | `POST /auth/login` | Login endpoint |
| B5 | `POST /calculations` | Protected — requires token |
| B6 | `GET /calculations` | Protected — requires token **and** filters by User ID |

### 2.4 Tech Stack Constraints
- **Frontend:** React / Next.js / Vue
- **Backend:** Node.js / Laravel / Go
- **Database:** Relational (MySQL / PostgreSQL) preferred for the User–Calculation relation; MongoDB allowed
- AI copilot usage is permitted, provided the reasoning is clear and defensible

### 2.5 Deliverables (before deadline)
1. **Source Code** — repository link (GitHub/GitLab)
2. **Live Demo** — deployed URL (Vercel/Netlify/etc.)
3. **Presentation Deck (PDF)** — systematic presentation: workflow, tech stack, architecture diagram, logic explanation

**Submit via email** to `qonita@sksglobal.id` and `ziyad@sksglobal.id`
**Subject:** `Technical Test Fullstack Dev- [nama]`

---

## 3. Business Logic (researched — not provided by the test)

Ad ROI model used by the app:

```
resultCount      = round(adSpend / costPerResult)
revenue          = resultCount * averageOrderValue
profit           = revenue - adSpend
roi              = adSpend > 0 ? (profit / adSpend) * 100 : 0
revenuePerResult = averageOrderValue
marginPerResult  = averageOrderValue - costPerResult
```

Meaning: ad spend `adSpend` buys `adSpend / costPerResult` results at `costPerResult`
(CPR). Each result earns `averageOrderValue`, so revenue = results × AOV.
ROI = profit / spend × 100. Identifiers are English; UI copy stays Indonesian.

---

## 4. Current Implementation Audit

Legend: ✅ done · 🟡 partial · ❌ missing

### Auth
- 🟡 `app/(auth)/login/page.tsx` — UI complete (form, error, loading); calls `/api/auth/login`
- 🟡 `app/(auth)/register/page.tsx` — UI complete; calls `/api/auth/register`
- ❌ Password hashing — none present
- ❌ JWT / session — none issued or verified
- ❌ `app/api/auth/register/route.ts` — stub, only `console.log`
- ❌ `app/api/auth/login/route.ts` — stub, only `console.log`

### Frontend
- ❌ Protected route — no `middleware.ts`, no guard
- 🟡 `app/components/Calculator.tsx` — real-time calc works, but not routed/used
- ❌ Slider ↔ number sync — params are either slider OR number, never both
- ❌ History page — not present
- ❌ `/` dashboard — `app/page.tsx` currently renders the Login page
- 🟡 Design — auth pages are light/blue, Calculator is dark/teal (inconsistent with reference)

### Backend
- ❌ `POST /api/calculations` — stub, only `console.log`
- ❌ `GET /api/calculations` — computes ROI from query params instead of returning saved history
- ❌ Prisma contract — still default `User`/`Post` sample (no `Calculation` model, no FK)
- ❌ `.env` — empty, no `DATABASE_URL`

### Known bugs
1. `Calculator.tsx`: "Harga Produk" and "Nilai Pesanan Rata-rata" both bind to the same `harga` state — editing one changes the other.
2. `login/route.ts` destructures `username`, but the login form never sends it.
3. `app/page.tsx` imports the Login page as the home route.

### Stack risk
`package.json` pins bleeding-edge versions — Next `16.3.6`, React `19.2.8`, TypeScript `7.0.2`,
and **Prisma 8 RC** using the new `@prisma/orm-postgres` API (not the standard `@prisma/client`).
`AGENTS.md` warns this Next version differs from training data — read `node_modules/next/dist/docs/` before coding.

---

## 5. Gap Summary

The UI shell and route files exist, but the **substance is not implemented**: hashing, sessions,
DB models, persistence, route protection, and history are all missing. Effectively "UI + stubs".

Baseline complete? **No.**

---

## 6. Suggested Roadmap

1. Set `DATABASE_URL` in `.env`; replace default Prisma contract with `User` + `Calculation` (userId FK, inputs, results, timestamps); emit contract + init DB
2. Add password hashing (bcrypt/argon2) + JWT in an httpOnly cookie in both auth routes
3. Add `middleware.ts` protecting the dashboard (`/`) and `/history`, redirecting to `/login`
4. Rework `Calculator.tsx`: single source of truth, dual slider+number per param, fix duplicate-`harga` bug, wire "Save Calculation" → `POST /calculations`
5. Add `/history` page → `GET /calculations` filtered by the token's user
6. Unify the design to the light/blue reference
7. Deliverables: push repo, deploy live demo, build the presentation deck

---

## 7. Implementation Status

Implemented and verified against the checklist in §2.

| Requirement | Status |
| --- | --- |
| A1 Login & Register UI | ✅ light theme, shared auth layout |
| A2 Password hashing | ✅ `bcryptjs`, 12 salt rounds |
| A3 Session management | ✅ signed JWT in an httpOnly cookie |
| F1 Protected routes | ✅ `proxy.ts` + server-side `requireSession()` |
| F2 Real-time calculation | ✅ `useMemo` over the shared `calculateRoi` |
| F3 Slider ↔ number sync | ✅ both bound to one state value per parameter |
| F4 UI matches reference | ✅ light theme, indigo/blue accents |
| F5 User-scoped history | ✅ filtered by the token's `userId` |
| F11 Loss-case UI | ✅ hero card gradient sky-cyan + verdict "Perlu Optimasi" + 3 insight actionable (`generateInsights`) |
| B1 Save tied to User ID | ✅ |
| B2 Data isolation | ✅ verified — a second user sees 0 rows |
| B3–B6 Endpoints | ✅ register, login, save, list all implemented |

**Verification**

- `npm run build` — passes (TypeScript clean)
- API end-to-end — 18/18 checks (auth, protection, save, isolation, validation, seeded account)
- Page rendering — 9/9 checks
- `npm run db:seed` — seeds two demo accounts with sample calculations

**Known issue:** `npm run lint` is blocked because `typescript-eslint` does not
support TypeScript 7.0 (the version this project pins). Pre-existing and unrelated
to this work — `npm run build` performs the TypeScript check and passes.

**Remaining deliverables (not code):** deploy the live demo and produce the
presentation deck (workflow, tech stack, architecture diagram, logic explanation).
