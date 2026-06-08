# Authentication

Auth is powered by **Auth.js (NextAuth v5 beta)** with optional Google OAuth and email/password credentials.

## Files

| File | Role |
|------|------|
| `src/auth.ts` | Full config: Google + Credentials, PrismaAdapter, JWT callbacks |
| `src/auth.config.ts` | Edge-safe config for middleware (Google only) |
| `src/middleware.ts` | Protects `/cases/*` and `/api/cases/*` |
| `src/app/api/auth/[...nextauth]/route.ts` | Auth.js route handlers |
| `src/app/api/auth/register/route.ts` | Email registration (bcrypt hash) |
| `src/lib/auth/require-user.ts` | `requireAuthUserId()`, `getOwnedCase()` |
| `src/lib/auth/password.ts` | bcrypt hash/verify (12 rounds) |
| `src/lib/auth/google-configured.ts` | Checks GOOGLE_CLIENT_ID + SECRET |
| `src/types/next-auth.d.ts` | Adds `user.id` to Session type |

## Providers

### Google OAuth (optional)

Enabled when both env vars are set:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Redirect URIs to configure in Google Cloud Console:
- `http://localhost:3000/api/auth/callback/google`
- `https://cheshbon-analyzer.vercel.app/api/auth/callback/google`

UI: `src/components/auth/google-auth-section.tsx`

### Email + password

- Register: `POST /api/auth/register` with `{ email, password, name? }`
- Login: `signIn("credentials", { email, password })` on `/login`
- Password stored as `User.passwordHash` (bcrypt)

Minimum password length enforced in register route.

## Session strategy

```ts
session: { strategy: "jwt" }
adapter: PrismaAdapter(prisma)
```

- **JWT** required for Credentials provider
- **PrismaAdapter** still used for OAuth account linking and user records
- User ID propagated: `jwt` callback sets `token.sub` → `session.user.id`

## Protected routes

`src/middleware.ts` matcher: `["/cases/:path*", "/api/cases/:path*"]`

| Request | Unauthenticated behavior |
|---------|--------------------------|
| `/cases/*` page | Redirect to `/login?callbackUrl=...` |
| `/api/cases/*` | `401 { error: "Unauthorized" }` |

Public: `/`, `/analyze/*`, `/login`, `/register`, `/api/auth/*`

## Pages

- `/login` — `login-client.tsx`: Google button + email form (`redirect: false` for credentials)
- `/register` — `register-client.tsx`: creates user then redirects to login

Custom sign-in page: `pages.signIn: "/login"` in auth config.

## Production requirements

**`AUTH_SECRET` is mandatory** in production. Without it, Auth.js shows:

> "There is a problem with the server configuration."

Generate with: `openssl rand -base64 32`

Also set on Vercel:
- `AUTH_SECRET`
- `AUTH_URL` (recommended: `https://cheshbon-analyzer.vercel.app`)
- `DATABASE_URL` (for user/case storage)

`trustHost: true` is set in auth config for Vercel compatibility.

## UI gotcha

`src/components/auth/auth-button.tsx` header button calls `signIn("google")` only. Email users must navigate to `/login` manually or via middleware redirect.

## Registration flow

```
POST /api/auth/register
  → validate email/password
  → check duplicate email
  → hash password
  → prisma.user.create()
  → 201 { ok: true }
```

Login is separate via NextAuth Credentials provider in `auth.ts` `authorize()`.
