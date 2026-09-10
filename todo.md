## TODO

Yep. Based on the backend status document you uploaded, the **foundation is actually in pretty good shape**. The big remaining work is turning the IAM/core infrastructure into the actual **club operations platform**.

Here’s how I’d break down what’s still to do, in the order I’d tackle it.

### 🔴 Phase 1 — Finish the backend foundation

These should come before building lots of features.

1. **Finish `MemberShipStrategy`**

   * Decide exactly what it is responsible for.
   * Make sure membership context and JWT authentication aren't duplicating responsibilities.
   * Since `ActiveMembershipGuard` already resolves the active club membership, we may ultimately find that this strategy isn't needed at all.

2. **Multi-membership / active-club architecture**

   * User can belong to multiple clubs.
   * `x-club-id` selects the active club.
   * Validate that the user actually belongs to that club.
   * Make the frontend's club switching work cleanly.
   * This is especially important given the club-based frontend/theme work we've been doing.

3. **Club lifecycle**

   * Add the missing `archiveClub()` endpoint.
   * Decide what happens to memberships, teams, players, etc. when a club becomes inactive/deleted.
   * Add proper authorization around destructive operations.

4. **Audit-log read API**

   * List logs for a club.
   * Filter by:

     * actor
     * category
     * entity
     * action
     * date range
   * Pagination.
   * Permission-controlled access.

---

### 🟠 Phase 2 — Finish people + membership management

This is the next major piece because almost everything else depends on knowing **who belongs to the club and in what capacity**.

5. **Membership management**

   * List club members.
   * Get member details.
   * Update membership type/status.
   * Suspend/reactivate/end membership.
   * Remove membership where appropriate.
   * Prevent invalid membership transitions.

6. **Role management hardening**

   * You already have CRUD + assignment.
   * Add proper validation around:

     * system roles
     * duplicate assignments
     * invalid membership IDs
     * protecting the last owner/admin
     * preventing privilege escalation.

7. **Permission management hardening**

   * Grant/revoke direct permissions.
   * Make effective-permission calculation consistent everywhere.
   * Consider whether the current `sync` endpoint should actually persist role permissions or whether permissions should remain dynamically derived.

8. **Person/profile management**

   * Complete profile editing.
   * Profile picture handling.
   * Phone/contact information.
   * Player and coach profile updates.
   * Decide which fields are owned by `Person`, `Profile`, `PlayerProfile`, etc.

---

# 🟡 Phase 3 — Players

This is currently the **biggest functional hole**.

Your database already has the foundation, but the Player module is empty.

We need:

```text
Player
├── create
├── get
├── list
├── update
├── archive/deactivate
├── assign to team
├── remove from team
└── player profile
```

And importantly:

### Player ↔ Membership ↔ Person

We need to keep the distinction clear:

```text
User
  ↓
Person
  ↓
Membership
  ↓
Player
  ↓
Team
```

A **person** is not automatically a player.

A person can potentially become:

* staff
* coach
* player
* guardian
* board member

depending on their memberships/roles and the club's configuration.

That's important for the architecture we're building.

---

# 🟡 Phase 4 — Teams

Teams are partially done already.

You currently have:

* create
* list
* get
* update

What's missing is making them operational:

```text
Team
├── players
├── coaches
├── training sessions
└── future matches
```

So we'd add:

* assign player
* remove player
* list players
* assign coach
* remove coach
* list coaches
* team-specific permissions
* possibly age group/category/season later.

---

# 🟢 Phase 5 — Coaches

You already have `CoachProfile` and `CoachAssignment`.

Now we need the actual business logic:

```text
Coach
   ↓
CoachAssignment
   ↓
Team
```

Endpoints such as:

```text
POST   /coach/assign
DELETE /coach/unassign
GET    /coach/:id/teams
GET    /team/:id/coaches
```

And validate that someone is actually eligible to be assigned as a coach.

---

# 🟢 Phase 6 — Training

This is the next substantial feature.

Your schema already contains `Training`, but there isn't a service/controller yet.

I'd build:

```text
POST   /training
GET    /training
GET    /training/:id
PATCH  /training/:id
DELETE /training/:id
```

With:

* team
* date/time
* location
* training type
* status
* coach
* notes
* attendance

And eventually:

```text
Training
   ↓
Attendance
   ↓
Player
```

**Attendance deserves its own model** if it isn't already represented in the schema.

---

# 🔵 Phase 7 — Notifications

You already have the `Notification` model, but no actual system.

We need:

```text
NotificationService
NotificationController
Notification creation events
Notification read/unread state
```

For example:

```text
Training scheduled
        ↓
Notification
        ↓
Coach / players / relevant members
```

Later this can become the central event-driven notification layer.

---

# 🔵 Phase 8 — Club feature system

This is **very important for ClubSheet's business model**.

Your schema already has:

```text
ENFeature
IAM
CLUB
TEAM
PLAYER
TRAINING
MATCH
SIGNING
MEDICAL
FINANCE
```

But the actual feature/subscription system isn't built yet.

This is where we need to establish:

```text
Club
  ↓
Enabled Features
  ↓
Available modules
```

For example:

```text
Club A
├── IAM ✓
├── CLUB ✓
├── TEAM ✓
├── PLAYER ✓
├── TRAINING ✓
├── MATCH ✗
├── MEDICAL ✗
└── FINANCE ✗
```

This ties directly into the product direction we've discussed: **some functionality is default/free, while other modules can be enabled as additional features.**

I'd actually prioritize designing this **before implementing Match, Medical, Finance, etc.**

---

# 🔵 Phase 9 — Matches

Then we'd build the football-specific match system:

```text
Match
├── home team
├── away team
├── competition
├── venue
├── date/time
├── squad
├── lineup
├── goals
├── cards
├── substitutions
└── result
```

This will probably become one of the largest modules.

---

# 🔵 Phase 10 — Medical

Because `MEDICAL` already exists as a permission/feature concept, eventually:

```text
Player
 ↓
MedicalRecord
 ├── injuries
 ├── treatments
 ├── notes
 └── availability
```

This also requires **very careful permission design**, because medical data is much more sensitive than ordinary player information.

---

# 🔵 Phase 11 — Finance

Same story:

```text
Finance
├── membership fees
├── player payments
├── expenses
├── invoices
└── transactions
```

And this should be feature-gated through the club feature system.

---

# 🟣 Phase 12 — GraphQL

Don't spend much time here yet.

You currently have only:

```text
healthCheck
```

I'd keep REST as the primary API until the domain model stabilizes.

Then decide whether GraphQL is actually useful for the dashboard's highly nested queries.

---

# 🔴 Phase 13 — Security + production hardening

Before calling the backend production-ready:

* refresh-token rotation
* CSRF strategy for cookie authentication
* rate limiting
* brute-force protection
* security headers
* CORS configuration
* request-size limits
* password policy
* session/token revocation
* authorization edge-case testing
* sensitive-data logging prevention
* database indexes
* transaction consistency
* pagination everywhere
* consistent API response DTOs

---

# 🔴 Phase 14 — Tests

This is currently completely missing.

I'd eventually want:

```text
Unit tests
    ↓
Services / permission resolution

Integration tests
    ↓
Prisma + PostgreSQL

E2E tests
    ↓
HTTP → Guards → Controller → Service → DB
```

Especially test the PBAC system heavily.

For example:

```text
ADMIN
  → CLUB_WRITE ✓

COACH
  → CLUB_WRITE ✗

COACH + GRANT CLUB_WRITE
  → CLUB_WRITE ✓

ADMIN + REVOKE CLUB_WRITE
  → CLUB_WRITE ✗
```

That permission engine is too important to leave untested.

---

# So, where are we actually?

I'd visualize the backend like this:

```text
                    ClubSheet Backend

                         ┌─────────┐
                         │  AUTH   │
                         │   ✅    │
                         └────┬────┘
                              │
                    ┌─────────▼─────────┐
                    │ IAM / MEMBERSHIP  │
                    │      🟡           │
                    └─────────┬─────────┘
                              │
              ┌───────────────┼────────────────┐
              │               │                │
        ┌─────▼─────┐   ┌────▼────┐     ┌────▼─────┐
        │  PEOPLE   │   │  ROLES  │     │   CLUB   │
        │    🟡     │   │   🟡    │     │    🟡    │
        └─────┬─────┘   └─────────┘     └──────────┘
              │
       ┌──────┴───────┐
       │              │
 ┌─────▼─────┐  ┌─────▼─────┐
 │  PLAYERS  │  │  COACHES  │
 │    🔴     │  │    🟡     │
 └─────┬─────┘  └─────┬─────┘
       │               │
       └───────┬───────┘
               │
          ┌────▼─────┐
          │  TEAMS   │
          │    🟡    │
          └────┬─────┘
               │
          ┌────▼─────┐
          │ TRAINING │
          │    🔴    │
          └────┬─────┘
               │
       ┌───────┼────────┐
       │       │        │
   ┌───▼───┐ ┌─▼─────┐ ┌▼────────┐
   │MATCHES│ │MEDICAL│ │ FINANCE │
   │  🔴   │ │  🔴   │ │   🔴    │
   └───────┘ └───────┘ └─────────┘
```

### My recommended next sequence

I **wouldn't** jump straight into Training or Matches.

I'd do:

**1. Finish multi-club/membership architecture**
↓
**2. Finish membership + people management**
↓
**3. Build Player module**
↓
**4. Player ↔ Team assignment**
↓
**5. Coach ↔ Team assignment**
↓
**6. Finish Team module**
↓
**7. Build Feature/Module activation system**
↓
**8. Build Training**
↓
**9. Notifications**
↓
**10. Matches / Medical / Finance**

And alongside that, gradually add **tests + audit logging** rather than leaving them until the very end.

The uploaded document confirms the current stubs/TODOs and the existing architecture, so this roadmap is based on the backend state documented there. 

If we're going back into implementation now, **I'd start with #1: the multi-club + membership architecture**, because that decision affects practically every module we build afterward.

Here's the fix order, sequenced so each step doesn't get undone or complicated by the next one.

## 1. Decide and enforce: one ACTIVE membership per (person, club)

**The bug:** `createMembership` never checks for an existing active membership before creating a new one. Nothing in the schema stops it either — there's no unique constraint on `(personId, clubId)`.

**What it can cause:** Two `ACTIVE` rows for the same person at the same club. Every downstream thing that assumes "a person's active membership at a club" (singular) — `ActiveMembershipGuard`'s `findFirst`, permission resolution, `myClubs`, audit trails — starts getting ambiguous or wrong answers, because "first match" becomes arbitrary once there are two. A permission-revoke on one row wouldn't touch the other, so someone could end up with contradictory access depending on which row a query happens to pick up.

**Fix:** Check for an existing `ACTIVE` membership at that `clubId` before creating — same shape as the invitee check in `inviteUser`, scoped to the club (not global). This check has to run **before** `$transaction`, not inside it (ties to point 5 below).

**Analogy:** A club shouldn't be able to issue you two separate active membership cards at once. If you lost your card and asked for a new one, the old one gets cancelled first — you don't walk around with two live cards to the same building. But you can absolutely hold a valid membership card at *this* gym and a separate one at a *different* gym at the same time — that's not a conflict, that's just two different memberships.

---

## 2. Fix audit-log ordering and transaction isolation in `createMembership`

**The bug:** The audit log is written *before* `tx.membership.create` runs, and on a completely separate DB connection (no `tx` passed to `createLog`).

**What it can cause:** If the membership creation fails after the log call (a DB error, a constraint violation, anything), you get a permanent audit record saying "Membership created successfully" for a membership that doesn't exist. Audit logs are supposed to be the trustworthy record of what actually happened — this makes them capable of lying.

**Fix:** Move the `createLog` call to *after* `tx.membership.create` succeeds, and pass `tx` as the second argument so it's part of the same atomic unit — if the transaction rolls back, the log never commits either.

**How this connects to #1:** Once you add the active-membership check, that check has to fail *before* you ever get near the transaction or the audit log — so the ordering becomes: check → transaction { create membership → log it } — not check-inside-transaction.

**Analogy:** A guardian doesn't sign the "enrollment confirmed" form before the child is actually enrolled. The signature comes after enrollment clears, and it's stapled to the same paperwork — not filed separately in a drawer where it could exist even if the enrollment itself later falls through.

---

## 3. Fix `suspendMembership`'s not-found handling

**The bug:** `.update()` throws when the row doesn't exist (Prisma error `P2025`) — it never returns `null`. The `if (!membershipUpdate) throw ResourceNotFoundException` is dead code that can never run.

**What it can cause:** A bad `membershipId` (typo, stale reference, deleted record) surfaces as a raw, unhandled Prisma error — a generic 500 with an internal error message — instead of your intended clean 404. Anyone calling this (frontend, another service) gets an unhelpful failure instead of "that membership doesn't exist."

**Fix:** Either wrap the update in try/catch and translate `P2025` specifically into your `ResourceNotFoundException`, or do a `findUnique` check first and throw before attempting the update.

**Analogy:** If a coach asks the front desk to suspend a membership number that doesn't exist in the system, the front desk should say "there's no such membership" clearly — not have the filing cabinet jam and hand back a garbled error slip.

---

## 4. Add a status-transition guard to `suspendMembership`

**The bug:** No check on the membership's current status before overwriting it to `SUSPENDED`. Suspending an already-suspended, or even an already-`ENDED`, membership "succeeds" silently.

**What it can cause:** Audit log noise (repeated no-op suspend entries make the log harder to trust and read), and it can mask a real bug upstream — e.g. a retry-on-timeout hitting suspend twice, or someone trying to suspend a membership that already permanently ended, which should probably be flagged as a mistake rather than quietly accepted.

**Fix:** Fetch the membership first, check `status === ACTIVE` before proceeding, throw a clear exception (e.g. `ConflictException` or `BadRequestException`) if it's already suspended/ended. This naturally folds into the fix for #3, since you're fetching the row first anyway.

**Analogy:** You don't re-suspend a student who's already suspended, and you definitely don't "suspend" someone who already graduated and left. The front office should say "this membership isn't currently active" rather than stamping the same form twice.

---

## 5. Decide: does `createMembership` need to support multiple types at once?

**The bug/gap:** `types: ENMembershipType` is singular, but `ClubService.createClub` inline-creates a membership with *multiple* types unioned together (`OWNER` + whatever else). You now have two different membership-creation code paths with different capabilities.

**What it can cause:** Drift — future features built on top of `MembershipService.createMembership` (the "shared" service) silently can't do something the inline `ClubService` logic already can. Bugs like "why can't I invite someone as both STAFF and BOARD in one call" trace back to this asymmetry.

**Fix:** Change the signature to `types: ENMembershipType[]`, and consider having `ClubService.createClub` call this shared method instead of duplicating the create logic inline — one source of truth for "how a membership gets created," rather than two.

**Analogy:** A person can hold multiple roles at a club at once — a parent who's also a board member, a coach who's also a club officer. The membership card doesn't have room for only one job title; it should be built to hold a list from the start, not patched later when someone predictably needs two roles.

---

## 6. Decide: does `createMembership` need to handle ATHLETE + `teamId`?

**The bug/gap:** If anything besides `acceptInvitation` calls `createMembership` directly with `type: ATHLETE`, no `Player` row gets created — the membership exists but the person isn't actually assigned to a team, silently inconsistent with what the invitation path now guarantees.

**What it can cause:** An athlete who has club-level access but doesn't show up on any team roster, doesn't get training/match visibility, etc. — a half-onboarded state that's easy to create and confusing to debug later ("why is this person a member but not on any team?").

**Fix:** Either extend `createMembership` to accept an optional `teamId` and create the `Player` row when `type` includes `ATHLETE` (mirroring `acceptInvitation`'s logic), or explicitly document/restrict this method as "club-level membership only, doesn't handle team assignment" and make sure no caller uses it for athlete onboarding without a follow-up step.

**How this connects to #5:** If types become an array, "is ATHLETE among them" becomes an `.includes()` check rather than a single equality check — the two changes touch the same conditional.

**Analogy:** Signing a child up as a "member of the club" isn't the same as putting them on a specific team's roster. A guardian enrolling a child expects that enrollment to include being placed on *a* team, not just given a club ID card with nowhere to actually train.

---

## 7. Confirm authorization scoping exists upstream for `suspendMembership`

**The bug/gap:** The service itself doesn't verify `adminUserId` has authority over the specific club the membership belongs to — it trusts whatever called it.

**What it can cause:** If the guard/permission layer calling this only checks "is logged in" rather than "has `MEMBERSHIP_SUSPEND` permission *at this membership's club*," someone from Club A could suspend a membership at Club B if they ever got a valid `membershipId` for it (IDOR-style — Insecure Direct Object Reference).

**Fix:** Not necessarily a code change *here* — confirm the calling guard/resolver actually scopes the permission check to the target membership's club, the same way `inviteUser` re-derives and checks `clubId` rather than trusting the caller.

**Analogy:** A coach from one club shouldn't be able to suspend a player's membership at a rival club just because they know the player's membership number. The front desk needs to check "do you actually work here" before acting on any request, not just "are you someone."

---

## 8. Decide: does suspending a membership need to cascade to `Player`/roles?

**The bug/gap:** Suspending a membership doesn't touch the linked `Player` row (`leftAt` stays `null`) or their roles/permissions.

**What it can cause:** If any query lists "active team players" by joining `Player` without also filtering `membership.status === ACTIVE`, a suspended athlete still shows up on the roster. Low risk if every such query correctly joins through membership status — but it's an assumption currently living implicitly in query logic rather than being guaranteed by the data itself.

**Fix:** Either explicitly document that all "active roster" queries must filter through `membership.status`, or have `suspendMembership` also set `Player.leftAt = new Date()` for any linked player row, so the roster status is self-evident from the `Player` table alone.

**Analogy:** Suspending someone's club membership is like taking their gym card away — it shouldn't require every trainer to separately remember "oh, also check if their card still works" before letting them into a session. The moment the card's suspended, everything downstream should reflect that automatically.

---

## Suggested order to actually implement

1. **#1** (active-membership uniqueness check) — foundational, other fixes assume this exists.
2. **#2** (audit log ordering/tx) — small, isolated, safe to do immediately, no dependency on anything else.
3. **#3 + #4** together (suspend: not-found handling + status-transition guard) — same method, same fetch-first refactor covers both.
4. **#5** (multi-type support) — a signature change, so do it before #6 since #6's ATHLETE check depends on the final shape of `types`.
5. **#6** (ATHLETE + teamId) — builds directly on #5's new signature.
6. **#7** (authorization scoping) — verification/audit task, not a code change in this file, can happen anytime but worth doing before this ships.
7. **#8** (cascade to Player) — a product decision more than a bug; do it last once you've decided whether it's even needed given how your "active roster" queries are written elsewhere.

Want me to start writing the fixed `MembershipService` now, following this order?