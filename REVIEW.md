# Code Review — `task-mgmt-api` (Backend)

**Reviewed:** 2026-08-25
**Scope:** `task-mgmt-api` (Node.js / Express / TypeScript / MongoDB backend). Frontend (`task-mgmt-ui`) not covered here.
**Method:** Full read of `src/`, `tests/`, config files, `package.json`, `.env.example`, `README.md`, and git history (`git log`, `git remote`). Test suite executed locally (128/128 passing).

## Verdict

The backend is well organized (clean layering: routes → middleware → controllers → services → models), has genuinely good ownership-isolation logic, decent test coverage, and a strong README. It's submittable **after fixing one critical secret-leak issue and a short list of security hardening items**. None of the issues below are "start over" issues — this is solid junior/mid-level work with a few classic gaps.

**Do not submit before fixing Issue #1.** It's a live credential leak on a public GitHub repo.

---

## 🔴 Critical — Fix Before Submission

### 1. Real Cloudinary API secret committed and pushed to a public GitHub repo

`.env.example` contains **real, working-looking credentials**, not placeholders:

```1:20:/Users/mohamedzohair/Desktop/untitled folder/task-management-app/task-mgmt-api/.env.example
CLOUDINARY_CLOUD_NAME=dwjjresyx
CLOUDINARY_API_KEY=119271979637778
CLOUDINARY_API_SECRET=CuR-DCDvOcR5OcPCn3oX_FAJIKs
```

- This file is **tracked and pushed** to `github.com/Mohameed547/task-mgmt-api` (confirmed via `git remote -v` / `git log -- .env.example`), i.e. this secret is public right now.
- This directly violates the assignment's explicit rule ("Do not commit … API keys, or other secrets" / ".env.example … with no secret values") and is the single fastest way to fail the security section of the review.
- The actual `.env` file is correctly gitignored — the leak is specifically in `.env.example`.

**Action required (in this order):**
1. Rotate the Cloudinary API secret/key immediately in the Cloudinary dashboard — treat it as compromised regardless of any history rewrite, since it's already been public.
2. Replace the values in `.env.example` with placeholders, e.g. `your_cloudinary_cloud_name`, `your_cloudinary_api_key`, `your_cloudinary_api_secret` (the backend `README.md` already shows the correct placeholder version — `.env.example` just needs to match it).
3. Since the secret is in git history, either purge history (`git filter-repo`/BFG) before making the repo public/submitting it, or accept that the *rotated* key is what matters (don't just delete the file going forward — that leaves the old secret in history forever).

---

## 🟠 High Priority — Should Fix

### 2. No rate limiting on auth endpoints
`POST /api/auth/login` and `/register` have no throttling (`src/routes/auth.routes.ts`). This allows unlimited password-guessing / credential-stuffing and user-enumeration timing attacks. Add `express-rate-limit` scoped to the auth router:

```ts
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
router.post('/login', authLimiter, validateBody(validateLoginInput), login);
```

### 3. No `helmet` (or equivalent secure headers)
`src/app.ts` sets up CORS and body parsing but never sets standard security headers (`X-Content-Type-Options`, `Strict-Transport-Security`, disabling `X-Powered-By`, etc.). Add `helmet()` near the top of the middleware chain — it's a one-line, zero-risk addition that graders will specifically look for.

### 4. Silent fallback secrets in `src/config/env.ts`
```13:13:/Users/amanyzohair/Desktop/task-manager/task-mgmt-api/src/config/env.ts
JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret_key_change_in_production',
```
If `JWT_SECRET` is ever missing at runtime (e.g. misconfigured deploy), the app **silently** signs tokens with a publicly-known default string instead of crashing — meaning anyone can forge valid auth tokens. This is a classic "fail-open" bug. Same pattern applies more mildly to `MONGODB_URI`.

Fail fast instead:
```ts
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const env: EnvironmentVariables = {
  // ...
  JWT_SECRET: requireEnv('JWT_SECRET'),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/task_management_db', // dev-only default is fine here
};
```
This should throw at process startup (not deep inside a request handler), which is exactly where it lives now — just remove the silent default.

### 5. Memory-leak-prone event listener registration
```34:41:/Users/mohamedzohair/Desktop/untitled folder/task-management-app/task-mgmt-api/src/config/database.ts
mongoose.connection.on('error', (err) => { ... });
mongoose.connection.on('disconnected', () => { ... });
```
These `.on()` listeners are registered **every time `connectDatabase()` runs**, not once. In tests or any reconnect/retry logic, this accumulates duplicate listeners on the same `EventEmitter` (Node will eventually warn `MaxListenersExceededWarning`, and each reconnect leaks a bit more memory / triggers duplicate log lines). This is exactly the kind of subtle Node.js leak worth catching before a review.

Fix: register listeners once, outside/independent of the connect call (e.g. at module load, or guard with `mongoose.connection.listenerCount('error') === 0`):
```ts
let listenersAttached = false;
export const connectDatabase = async (customUri?: string) => {
  // ...
  if (!listenersAttached) {
    mongoose.connection.on('error', (err) => logger.error('MongoDB runtime connection error:', err));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB connection lost.'));
    listenersAttached = true;
  }
  return connection;
};
```

### 6. Oversized JSON body limit
```35:36:/Users/mohamedzohair/Desktop/untitled folder/task-management-app/task-mgmt-api/src/app.ts
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```
File uploads already go through `multer` (memory storage, capped at 5MB) on `multipart/form-data`. The plain JSON/urlencoded body limit is only for text fields (title/description/etc., max ~1KB realistically), so 10MB is a needless DoS surface (large-body attacks tie up the event loop parsing JSON). Drop this to something like `'100kb'`.

---

## 🟡 Medium — Code Quality / Node.js Best Practices

### 7. Hand-rolled validation instead of a schema library
`src/schemas/auth.schema.ts` and `task.schema.ts` reimplement validation manually (duplicated email regex in two places, near-duplicate blocks between `validateCreateTaskInput`/`validateUpdateTaskInput`). It works and is tested, but:
- It's ~250 lines of repetitive, hand-maintained logic that a library does more safely (e.g. proper RFC-compliant email checks — the current regex `/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/` rejects valid emails with `+` tags and TLDs longer than 3 chars like `.info`).
- Recommend migrating to **Zod** (pairs naturally with TypeScript, gives you inferred types "for free" instead of hand-written `CreateTaskInput`/`RegisterInput` interfaces that must be kept in sync manually).

### 8. Dead ESLint suppression comments with no ESLint config
There are 11 `// eslint-disable-next-line` comments across `src/` (e.g. `user.model.ts`, `task.model.ts`, `task.service.ts`, `errorHandler.ts`), but there is **no `.eslintrc`/`eslint.config.*` and no `lint` script** in `package.json`. These comments do nothing right now and are misleading — they suggest a lint pass was run against a config that isn't actually in the repo. Either:
- Add ESLint (`@typescript-eslint`) + a `"lint"` script and keep the suppressions where genuinely justified, or
- Remove the dead comments and fix the underlying `any` usage instead (most are `Record<string, any>` for Mongo update payloads — could be typed as `Partial<UpdateTaskInput>` / `mongoose.UpdateQuery<ITaskDocument>`).

Given `tsconfig.json` has `"strict": true` (good), it's inconsistent to have unenforced `any` escapes sitting next to it.

### 9. Redundant `AuthenticatedRequest` type
```86:96:/Users/mohamedzohair/Desktop/task-management-app/task-mgmt-api/src/types/index.ts
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
```
The global augmentation already adds `user` to every Express `Request`. `AuthenticatedRequest` is therefore a duplicate of the ambient `Request` type and can be deleted — just type controllers as `(req: Request, res: Response)`. Minor, but it's the kind of "two sources of truth" thing that's confusing to explain in a live review ("why do we have both?").

### 10. Custom `console.*` logger instead of a real logging library
```1:16:/Users/mohamedzohair/Desktop/untitled folder/task-management-app/task-mgmt-api/src/utils/logger.ts
export const logger = { info: ..., warn: ..., error: ..., debug: ... };
```
Fine for an assignment, but worth mentioning if asked about production-readiness: no log levels config, no structured/JSON output, no correlation/request IDs, writes straight to stdout/stderr synchronously via `console`. `pino` (fast, structured, pairs well with `morgan` replacement `pino-http`) or `winston` would be the standard upgrade.

### 11. Modern Node.js syntax nitpicks
- Use the `node:` protocol for built-ins for clarity and slightly faster resolution: `import path from 'node:path'`, `import { Readable } from 'node:stream'`, `import { Server } from 'node:http'` (currently `'path'`, `'stream'`, `'http'` throughout).
- `package.json` has no `"engines"` field. Add `"engines": { "node": ">=18.0.0" }` so it's enforced by `npm`/CI, not just documented in the README.
- `mongoose.set('strictQuery', true)` in `database.ts` is a no-op on Mongoose 7+ (this is already the default and the flag was removed) — safe to delete.

### 12. Task ownership & injection handling — this part is done well
Worth calling out as a strength, not a problem: every task query is scoped with `{ _id, user: userId }` (`task.service.ts`), `ObjectId` format is validated before hitting the DB, and search input is regex-escaped before being used in `$regex`. This is exactly the "each user can only access their own data" requirement done correctly and defensively. Good instinct not returning `403` vs `404` for cross-user access (prevents resource-existence enumeration).

### 13. Attachment upload rollback logic
`task.controller.ts` deletes the Cloudinary asset if the DB write fails after upload — good defensive cleanup thinking. Two small gaps:
- The `catch (cleanupErr)` blocks are empty (`// Log cleanup error silently`) — should at least call `logger.error(...)`, otherwise a failed cleanup is invisible and you end up with orphaned Cloudinary files with no trace.
- `updateTask`'s cleanup deletes the **newly uploaded** attachment on failure, but doesn't handle deleting the **old** attachment when a new one successfully replaces it — likely an orphaned-file leak on every successful attachment replacement (not a crash, just a storage leak worth a `Known Issues` mention).

---

## 🟢 Nice to Have

- **Pagination** already implemented server-side (`page`/`limit`, capped at 50) — good, matches the bonus requirement.
- Consider returning a JWT immediately on `register` (currently requires a separate `login` call) for a smoother UX — not wrong, just a product choice worth being able to justify in review.
- `errorHandler.ts` leaking `err.stack` only in development (`env.NODE_ENV === 'development'`) is correct and worth highlighting as a deliberate security choice if asked.
- Compound indexes (`{user,status}`, `{user,priority}`, `{user,title}`) are sensible for the filtering/search patterns used — good API/database co-design.

---

## Requirements Checklist (against the assignment brief)

| Requirement | Status |
|---|---|
| Registration/login | ✅ |
| JWT auth + protected routes | ✅ |
| Per-user task isolation | ✅ (defense-in-depth, well done) |
| Task CRUD | ✅ |
| title/description/status/priority/dueDate | ✅ |
| Status enum (To Do/In Progress/Done) | ✅ |
| Priority enum (Low/Medium/High) | ✅ |
| Search by title | ✅ (regex, escaped) |
| Filter by status/priority | ✅ |
| Backend validation | ✅ (works, but see #7) |
| bcrypt password hashing | ✅ (`bcryptjs`, 10 rounds) |
| No secrets committed | ❌ **See Issue #1 — currently failing this** |
| `.env.example` present | ⚠️ present but contains real secrets, see #1 |
| Clear error handling | ✅ (centralized `errorHandler`, consistent JSON shape) |

Frontend requirements (responsive UI, loading/empty/error states) live in `task-mgmt-ui` and are out of scope for this backend-only review.

---

## Priority Order to Fix

1. **Rotate the Cloudinary secret and scrub `.env.example`** (Issue #1) — non-negotiable before sending this anywhere.
2. Add `helmet` + `express-rate-limit` on auth routes (Issues #2, #3) — ~15 minutes of work, meaningfully improves the "Security and input validation" score (10% of the grade).
3. Fail-fast on missing `JWT_SECRET` (Issue #4).
4. Fix the listener leak in `database.ts` (Issue #5).
5. Everything in the Medium section is polish — good to mention as "known trade-offs" in the submission's "Known Issues" section if you don't have time to fix all of them (e.g. "hand-rolled validation instead of Zod, could be migrated") rather than silently leaving them.
