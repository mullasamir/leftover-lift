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

## Pages

| Page | What it is |
|---|---|
| `/` | Landing: scroll-driven sky, pinned story, food carousel, "which side are you on", impact calculator, FAQ |
| `/discover` | Live search and filters with food-icon chips, Surprise me roulette, saved hearts, closing-soon banner |
| `/how-it-works` | Customer and business walkthroughs with an audience toggle |
| `/for-businesses` | Benefits and a "how much could you recover?" calculator |
| `/about`, `/faq`, `/contact`, `/privacy`, `/terms` | Content pages (searchable FAQ, contact form that lands in the admin inbox) |
| `/rescues` | Customer: reservations, a rescue tree that grows with each collected portion, badges, personal impact |
| `/vendor` | Business: pickup desk, impact card with share button, live and past listings, one-click "Post again" |
| `/admin` | Admin: people table, counts, contact inbox |

## Admin account and demo data

```text
ADMIN_EMAIL=you@example.com      # creates this administrator on startup if it does not exist yet
ADMIN_PASSWORD=choose-8-or-more   # never committed; set it as an environment variable
DEMO_DATA=true                    # local only: demo businesses and food, refreshed at every start
```

In Eclipse: Run > Run Configurations > your app > **Environment** tab > add the variables above.
Demo accounts are `crumb@`, `saffron@`, `loom@` and `greenbasket@` `demo.leftoverlift.test`, all with the password `demo-password-123`.

## API

| Method | Path | Who | Purpose |
|---|---|---|---|
| POST | `/api/v1/auth/register` | public | Create a customer or business account |
| POST | `/api/v1/auth/login` | public | Sign in, returns an access token and a refresh token |
| POST | `/api/v1/auth/refresh` | public | Trade a refresh token for new tokens (single use, rotated) |
| POST | `/api/v1/auth/logout` | public | Revoke a refresh token |
| GET | `/api/v1/auth/me` | signed in | Current user |
| GET | `/api/v1/listings` | public | Browse food: `q`, `category`, `city`, `minDiscount`, `sort` (CLOSING, CHEAPEST, DEAL, NEWEST), `page`, `size` |
| GET | `/api/v1/listings/{id}` | public | One listing |
| GET | `/api/v1/vendor/listings` | business | My listings |
| POST | `/api/v1/vendor/listings` | business | Post surplus food |
| PUT | `/api/v1/vendor/listings/{id}` | business | Edit my listing |
| POST | `/api/v1/vendor/listings/{id}/cancel` | business | Cancel my listing |
| POST | `/api/v1/reservations` | customer | Reserve 1 to 3 portions, returns a pickup code |
| GET | `/api/v1/reservations` | customer | My rescues |
| POST | `/api/v1/reservations/{id}/cancel` | customer | Cancel and put the food back on sale |
| GET | `/api/v1/vendor/reservations` | business | Orders waiting to be collected |
| POST | `/api/v1/vendor/reservations/collect` | business | Confirm a handover with the customer's code |
| GET | `/api/v1/vendor/reservations/stats` | business | Totals for the impact card: meals rescued, revenue recovered |
| POST | `/api/v1/contact` | public | Contact form (honeypot field and a per-caller rate limit) |
| GET | `/api/v1/admin/messages` | admin | Contact inbox (`handled` filter) |
| PATCH | `/api/v1/admin/messages/{id}/handled` | admin | Mark a message handled or unread |
| GET | `/api/v1/admin/users` | admin | Search and filter accounts |
| PATCH | `/api/v1/admin/users/{id}/enabled` | admin | Enable or disable an account |
| GET | `/api/v1/admin/stats` | admin | Account and listing counts |

Errors are always JSON: `{ status, code, message, fieldErrors?, path }`.

### Automatic discount
Vendors enter only a usual price and a rescue price. The server calculates the percentage (`Pricing.java`), stores it,
and returns it as `discountPercent` and `savings`, so the number can never disagree with the prices. The listing form shows
the same calculation live while typing, and offers one-tap discounts (30 to 70% off) that fill in the rescue price.

## Reservations and why nothing is ever oversold

Taking the last portion is the classic race condition: two people read "1 left" at the same moment and both succeed.
Here the stock change is one atomic SQL statement, never read-then-write:

```sql
UPDATE listings SET quantity_remaining = quantity_remaining - :qty, version = version + 1
WHERE id = :id AND status = 'AVAILABLE' AND quantity_remaining >= :qty AND pickup_end > now()
```

If two requests race, PostgreSQL makes the second wait for the first, re-checks the `WHERE`, and updates zero rows, so exactly
one wins. The rest of the reservation (the row, the pickup code) lives in the same transaction, so a failure anywhere rolls the
portions back onto the shelf. More guards:

- A partial unique index lets a customer hold only one active reservation per listing, even on a double click.
- `version` is bumped by every stock change, so a vendor editing a listing while a reservation lands gets a clean 409, not a silent overwrite.
- A reservation keeps the price it was made at; later edits cannot change what someone agreed to pay.
- Only the customer ever sees the pickup code; the business must hear it at the counter to confirm a handover.
- Cancelling a reservation (or the vendor cancelling the listing) puts portions back and reopens a sold-out listing.
- A scheduled job marks reservations nobody collected as no-shows once the pickup window closes.

### Running the concurrency test
`ReservationConcurrencyTest` fires 20 simultaneous reservations at a listing with 3 portions against a real PostgreSQL and
asserts that exactly 3 succeed. It needs its own empty database (it skips itself if that does not exist):

```sql
CREATE DATABASE leftoverlift_test OWNER leftoverlift;
```

Then run it from Eclipse (right-click the test > Run As > JUnit Test) or with `mvn test`.

## Design decisions worth knowing

- **BCrypt (cost 12)** for passwords; the hash never leaves the server (responses use DTO records).
- **One generic login error** and a dummy hash comparison for unknown emails, so accounts can't be enumerated by message or timing.
- **Refresh tokens are random, stored hashed, single use and rotated; reusing one revokes every session of that user.**
- **Role is read from the database on every request**, not trusted from the token, so changes take effect immediately.
- **ADMIN can't be self-registered.** Only CONSUMER and VENDOR are allowed through the public endpoint.
- **Flyway owns the schema**; `ddl-auto=validate` makes startup fail if entities and migrations drift.
- **UUID primary keys** so ids aren't guessable or sequential.
- Secrets come from environment variables; nothing sensitive is committed.

## Roadmap

- [x] Phase 1: auth foundation, roles, vendor profiles, design system, landing / browse / sign-in screens
- [x] Phase 1.5: admin bootstrap, admin endpoints and dashboard, refresh tokens with reuse detection, role-access tests
- [x] Phase 2: vendor listings (create, edit, cancel, auto-expire), automatic discount, search, filters, sorting, pagination
- [x] Phase 3: reservations with atomic stock, pickup codes, My rescues, vendor pickup desk, concurrency test
- [x] Phase 3.5: fresh redesign, content pages, contact inbox, rescue tree and badges, vendor impact card, Surprise me
- [ ] Phase 2.5: nearby search (latitude and longitude), photo upload
- [ ] Phase 4: driver role and delivery tracking
- [ ] Phase 5: Stripe test payments, email notifications, admin impact stats, deployment + CI
- [ ] Later: move tokens to httpOnly cookies, rate limiting on auth endpoints, Testcontainers integration tests
