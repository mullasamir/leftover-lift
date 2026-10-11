# Leftover Lift

A food-rescue marketplace. Bakeries, cafés and kitchens post surplus food at the end of the day; neighbours rescue it at a fraction of the price before a countdown runs out.

**Stack:** Java 21, Spring Boot 3.5, Spring Security (JWT), PostgreSQL, Flyway, React 18 + Vite (plain CSS, no UI kit).

## Run it

You need Java 21, Maven 3.9+, Node 20+ and Docker.

```bash
# 1. Database
docker compose up -d db

# 2. API (http://localhost:8080, Swagger UI at /swagger-ui.html)
cd backend
mvn spring-boot:run

# 3. Web app (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Defaults work out of the box for local development. For anything shared or deployed, copy `.env.example` to `.env`
and set a real `JWT_SECRET` (`openssl rand -base64 48`) and `DB_PASSWORD`.

Run the tests: `cd backend && mvn test`

## Project layout

```
backend/src/main/java/com/leftoverlift
  auth/       register, login, current user (controller, service, DTO records)
  user/       User and VendorProfile entities, repositories
  security/   JWT service, request filter, SecurityConfig
  common/     ApiException, ApiError, GlobalExceptionHandler
  config/     typed properties (JWT, CORS), OpenAPI
backend/src/main/resources/db/migration   Flyway SQL migrations (Hibernate only validates)
frontend/src
  api/ context/ components/ pages/ styles/ data/
```

## API (Phase 1)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/register` | public | Create a consumer or vendor account, returns a JWT |
| POST | `/api/v1/auth/login` | public | Sign in, returns a JWT |
| GET | `/api/v1/auth/me` | Bearer token | Current user (with business profile for vendors) |

Errors are always JSON: `{ status, code, message, fieldErrors?, path }`.

## Design decisions worth knowing

- **BCrypt (cost 12)** for passwords; the hash never leaves the server (responses use DTO records).
- **One generic login error** and a dummy hash comparison for unknown emails, so accounts can't be enumerated by message or timing.
- **Role is read from the database on every request**, not trusted from the token, so changes take effect immediately.
- **ADMIN can't be self-registered.** Only CONSUMER and VENDOR are allowed through the public endpoint.
- **Flyway owns the schema**; `ddl-auto=validate` makes startup fail if entities and migrations drift.
- **UUID primary keys** so ids aren't guessable or sequential.
- Secrets come from environment variables; nothing sensitive is committed.

## Roadmap

- [x] Phase 1: auth foundation, roles, vendor profiles, design system, landing / browse / sign-in screens
- [ ] Phase 2: vendor listings (create, edit, expire), search, filters, pagination, nearby search
- [ ] Phase 3: reservations with concurrency-safe stock (`@Version`), pickup codes
- [ ] Phase 4: driver role and delivery tracking
- [ ] Phase 5: Stripe test payments, email notifications, admin impact stats, deployment + CI
- [ ] Later: refresh tokens, move the token to an httpOnly cookie, rate limiting on auth endpoints, Testcontainers integration tests
