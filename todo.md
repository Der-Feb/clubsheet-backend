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
