# ClubSheet Backend — Todo

> Scope: everything needed to have a complete, solid core platform
> (auth, access system, club, people, memberships, teams) before
> touching optional modules (training, matches, finance, etc.).
>
> Sections are ordered by dependency — work top to bottom.

---

## Auth & Security

- [ ] `GET /auth/me` — extend response to include active membership, club info, resolved roles and permissions
- [ ] Refresh token — implement rotating refresh tokens (currently only access token is issued, no refresh flow)
- [ ] Signout — invalidate refresh token on signout (currently only clears the cookie client-side)
- [ ] Rate limiting — add global rate limiter (e.g. `@nestjs/throttler`) to protect auth endpoints from brute force
- [ ] Google OAuth — add Passport Google strategy for social signup/signin
- [ ] Invitation expiry — invitations are currently 5 minutes; decide on a real expiry (24h or 7d is more practical for email invites)

---

## Access System (RBAC) — Critical

- [ ] `PermissionsGuard` — implement the guard that reads `@RequirePermissions` metadata and enforces it
  - Resolve the membership's effective permissions: direct grants (`MembershipPermission`) + all permissions from assigned roles (`MembershipRole → RolePermission`)
  - Evaluate `strict` mode (ALL required) vs non-strict (ANY one is enough)
  - Scope resolution: `OWN`, `TEAM`, `CLUB`, `ANY`
  - Throw `ForbiddenException` if check fails
- [ ] Register `PermissionsGuard` globally (or on all non-auth controllers)
- [ ] Role management API — endpoints to assign/revoke roles on a membership
  - `POST /membership/:id/roles` — assign role
  - `DELETE /membership/:id/roles/:roleId` — revoke role
  - Guard with `ROLE_ASSIGN` / `ROLE_REVOKE` permissions
- [ ] Permission management API — endpoints to assign/revoke direct permissions on a membership
  - `POST /membership/:id/permissions` — assign permission with scope
  - `DELETE /membership/:id/permissions/:permissionId` — revoke permission
  - Guard with `PERMISSION_ASSIGN` / `PERMISSION_REVOKE` permissions
- [ ] Sync utility — method to copy all permissions from a role into a membership's direct permissions (noted in old todo)
  - Useful when a role is customized post-assignment and changes need to propagate
- [ ] Seed remaining system roles — `COACH`, `STAFF`, `ATHLETE` with appropriate permission sets
- [ ] Seed core permissions for all permission codes currently declared in `ENPermissionFeature`

---

## Club Module Enablement System

- [ ] `ClubModule` schema — add `ClubModule` model to `access.prisma`
  - Fields: `id`, `clubId`, `module` (`ENModuleCode` enum), `status` (`ACTIVE` | `SUSPENDED`), `enabledAt`
  - Unique constraint: `[clubId, module]`
- [ ] `ENModuleCode` enum — `TRAINING`, `MATCHES`, `MEDICAL`, `FINANCE`, `SCOUTING`, `ACADEMIC`
- [ ] Migration — run `prisma migrate dev`
- [ ] `ModuleGuard` — guard that checks if the club has a specific module enabled
  - Reads a `@RequireModule('TRAINING')` decorator from the handler
  - Looks up `ClubModule` for the current membership's club
  - Throws `ForbiddenException` with a module-specific message if not enabled
- [ ] Club settings API — endpoints to enable/disable modules for a club (admin only)
  - `POST /club/modules` — enable a module
  - `DELETE /club/modules/:moduleCode` — disable a module
- [ ] `GET /auth/me` — include `enabledModules` list in the membership section of the response

---

## Club

- [ ] `GET /club/me` — return the current user's active club with full details (name, logo, country, short name, status, enabled modules, membership count)
- [ ] Club deletion / archival — `DELETE /club` or `PUT /club/archive`, sets status to `DELETED`, guards with ownership check
- [ ] Club logo upload — file upload endpoint for club logo (or accept a URL for now)
- [ ] Seed default roles into a club on creation — when a club is created, seed the system roles (`ADMIN`, `COACH`, `PLAYER`) as available roles for that club automatically

---

## People (Person Management)

- [ ] `GET /people` — list all persons in the current club (via their memberships), with search, filter by membership type/status, pagination
- [ ] `GET /people/:id` — get a single person's details, their membership history, roles, permissions
- [ ] `POST /people` — create a new person without a user account (clubs often add players before inviting them)
- [ ] `PUT /people/:id` — update personal details (name, dob, nationality, gender, profile picture)
- [ ] Person search — global search across the club's people by name

---

## Membership

- [ ] `GET /memberships` — list memberships for the current club, with filters (status, type) and pagination
- [ ] `GET /memberships/:id` — get a single membership's full detail (person info, roles, permissions, types, history)
- [ ] `PUT /memberships/:id/status` — change membership status (ACTIVE → SUSPENDED → ENDED) with audit log
- [ ] End membership — set `endedAt`, change status to `ENDED`, revoke all active roles; don't delete the record
- [ ] `inviteUser` — move to a proper controller endpoint under `/invitation` with JWT + email-verified guards
  - Currently only `POST /invitation/accept` is exposed; `inviteUser` is not wired to any route

---

## Invitation

- [ ] `POST /invitation/send` — expose the `inviteUser` service method as a proper REST endpoint (requires JWT + email verified + `PERMISSION_ASSIGN` or similar)
- [ ] `GET /invitation/:token` — allow the frontend to preview an invitation before accepting (club name, inviter, role type, expiry status) without requiring auth
- [ ] Resend invitation — `POST /invitation/:id/resend` — regenerate token, update expiry, resend email
- [ ] Cancel invitation — `DELETE /invitation/:id` — mark as DISRUPTED, delete record, guard with appropriate permission
- [ ] List pending invitations — `GET /invitation` — list all pending invitations for the club, so admins can see who hasn't accepted yet

---

## Team (Core Entity — missing)

- [ ] `Team` schema — add `Team` model to `access.prisma`
  - Fields: `id`, `name`, `clubId`, `ageGroup` (optional), `category` (optional), `season` (optional), `status`, `createdAt`, `updatedAt`
  - Relation to `Club`
- [ ] `TeamMembership` — join table connecting a `Membership` to a `Team` with a role (player, coach, captain)
- [ ] Migration — run `prisma migrate dev`
- [ ] `POST /teams` — create a team within the current club
- [ ] `GET /teams` — list all teams for the current club
- [ ] `GET /teams/:id` — get team detail with squad list and coaches
- [ ] `PUT /teams/:id` — update team details
- [ ] `POST /teams/:id/members` — add a membership to a team
- [ ] `DELETE /teams/:id/members/:membershipId` — remove a member from a team

---

## Profile System (Basic)

- [ ] `PlayerProfile` schema — attach to `Membership` where type is `ATHLETE`
  - Fields: `position`, `preferredFoot`, `height`, `weight`, `jerseyNumber`, `notes`
- [ ] `CoachProfile` schema — attach to `Membership` where type is `STAFF` or `BOARD`
  - Fields: `coachingLicense`, `qualifications`, `specialization`
- [ ] Migration — run `prisma migrate dev`
- [ ] Auto-create profile skeleton when membership with matching type is created
- [ ] `PUT /people/:id/player-profile` — update player profile
- [ ] `PUT /people/:id/coach-profile` — update coach profile

---

## Existing Items (from original todo)

- [ ] Sync method — move role permissions into a membership's direct `MembershipPermission` records
- [ ] Profile creation for persons — covered in the Profile System section above

---

## Hardening & Cleanup

- [ ] Remove `try/catch` in `ClubService.createClub` that silently swallows errors — it currently catches everything and returns `undefined` on failure
- [ ] `membership/suspend` endpoint naming — currently named "suspendClub" in the controller but it suspends a membership; rename for clarity
- [ ] `ENUserTokenStatus.DISRUPTED` — the status enum exists and is checked by the cleanup task, but tokens are hard-deleted rather than marked DISRUPTED; align the implementation with the schema intent or remove the enum value
- [ ] Error response format — ensure all exceptions go through the global `HttpExceptionFilter` and return a consistent shape
- [ ] Input validation — audit all DTOs to confirm `class-validator` decorators are thorough and `ValidationPipe` is applied globally
- [ ] `description` field on `AuditLog` — currently optional in the service but required in the schema; align them

## TODO
- [ ] On club, i removed creating the club with permissions, to mean that the user will have other series of steps to actually verify the validity of the club
- [ ] Make the club invitation permissions 


[RoutesResolver] AuthController {/api/auth}: +6ms
[RouterExplorer] Mapped {/api/auth/signup, POST} route +5ms
[RouterExplorer] Mapped {/api/auth/signin, POST} route +1ms
[RouterExplorer] Mapped {/api/auth/signout, POST} route +1ms
[RouterExplorer] Mapped {/api/auth/me, GET} route +0ms
[RouterExplorer] Mapped {/api/auth/email/send-verify, POST} route +1ms
[RouterExplorer] Mapped {/api/auth/email/verify, PUT} route +0ms
[RouterExplorer] Mapped {/api/auth/password/forgot, POST} route +1ms
[RouterExplorer] Mapped {/api/auth/password/reset, PUT} route +0ms
[RoutesResolver] AuditLogsController {/api/audit-logs}: +0ms
[RoutesResolver] MembershipController {/api/membership}: +0ms
[RouterExplorer] Mapped {/api/membership/my, GET} route +1ms
[RouterExplorer] Mapped {/api/membership/create, POST} route +0ms
[RouterExplorer] Mapped {/api/membership/suspend/:membershipId, PUT} route +1ms
[RoutesResolver] InvitationController {/api/invitation}: +1ms
[RouterExplorer] Mapped {/api/invitation/accept, POST} route +1ms
[RoutesResolver] PermissionController {/api/permission}: +0ms
[RouterExplorer] Mapped {/api/permission/my, GET} route +1ms
[RouterExplorer] Mapped {/api/permission/grant/:membershipId, POST} route +0ms
[RouterExplorer] Mapped {/api/permission/sync/:membershipId, POST} route +0ms
[RouterExplorer] Mapped {/api/permission/revoke/:membershipId, POST} route +1ms
[RoutesResolver] RoleController {/api/role}: +0ms
[RouterExplorer] Mapped {/api/role/my, GET} route +0ms
[RouterExplorer] Mapped {/api/role/club, GET} route +1ms
[RouterExplorer] Mapped {/api/role/:role_id, GET} route +0ms
[RouterExplorer] Mapped {/api/role, POST} route +0ms
[RouterExplorer] Mapped {/api/role/:role_id, DELETE} route +1ms
[RouterExplorer] Mapped {/api/role/:role_id, PATCH} route +0ms
[RouterExplorer] Mapped {/api/role/assign/:membership_id, POST} route +1ms
[RouterExplorer] Mapped {/api/role/revoke/:membership_id, POST} route +0ms
[RoutesResolver] ClubController {/api/club}: +0ms
[RouterExplorer] Mapped {/api/club/my, GET} route +1ms
[RouterExplorer] Mapped {/api/club/register, POST} route +0ms
[RouterExplorer] Mapped {/api/club/update, PUT} route +0ms
[RouterExplorer] Mapped {/api/club/workspace, GET} route +0ms
[RoutesResolver] ProfileController {/api/profile}: +1ms
[RoutesResolver] PlayerController {/api/player}: +0ms
[RoutesResolver] TeamController {/api/team}: +1ms
[RouterExplorer] Mapped {/api/team, GET} route +0ms
[RouterExplorer] Mapped {/api/team/:team_id, GET} route +1ms
[RouterExplorer] Mapped {/api/team, POST} route +0ms
[RouterExplorer] Mapped {/api/team/:team_id, PATCH} route +1ms
