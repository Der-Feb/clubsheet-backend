# AGENTS.md — ClubSheet Backend Development Guide

## Project Overview

ClubSheet is a football club management platform designed to manage clubs, teams, memberships, people, users, contracts, and operational workflows.

The backend is built with:

* **Framework:** NestJS
* **API Architecture:**

  * GraphQL for application data operations
  * REST API for authentication and security flows
* **ORM:** Prisma
* **Database:** PostgreSQL
* **Migration Tool:** Prisma Migrations
* **Language:** TypeScript

The goal is to maintain a clean, scalable, and maintainable backend suitable for multiple football clubs and organizations.

---

# Core Development Principles

## 1. Modular Architecture

Follow NestJS module boundaries.

Each domain should have its own module:

Example:

```
src/
 ├── auth/
 ├── users/
 ├── persons/
 ├── memberships/
 ├── clubs/
 ├── teams/
 ├── contracts/
 ├── common/
 └── prisma/
```

Avoid creating large shared services that contain unrelated business logic.

Business logic belongs to the domain module responsible for it.

---

# API Design Rules

## GraphQL

GraphQL is the primary application API.

Use GraphQL for:

* Club management
* Member management
* Team operations
* Profiles
* Reports
* Internal application workflows

Rules:

* Keep resolvers thin.
* Business logic belongs in services.
* Use DTOs/input types for mutations.
* Avoid putting database queries directly inside resolvers.

Example:

```
Resolver
   ↓
Service
   ↓
Repository / Prisma
   ↓
Database
```

---

## REST API

REST is used for authentication and security-sensitive operations.

Examples:

```
POST /auth/login
POST /auth/register
POST /auth/refresh
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
```

Authentication responsibilities:

* JWT issuing
* Refresh token management
* Password hashing
* Session handling
* Email verification
* Security workflows

Do not force authentication flows into GraphQL.

---

# Database Rules

## Prisma

Prisma is the only database access layer.

Do not write raw SQL unless absolutely necessary.

All schema changes must happen through:

```
prisma/schema.prisma
```

Then create migrations:

```
npx prisma migrate dev --name migration_name
```

Never manually edit migration files after creation.

---

## Database Design Principles

The system separates:

### Person

Represents a real-world human.

Example:

```
Person
 |
 ├── Player Profile
 ├── Coach Profile
 ├── Staff Profile
 └── User Account
```

A person can exist without having a login account.

---

### User

Represents system access.

A user:

* authenticates
* receives permissions
* belongs to roles

Example:

```
User
 |
 └── Person
```

Do not duplicate personal information inside User.

---

### Membership

Represents the relationship between a person and a club.

Example:

```
Person
   |
Membership
   |
Club
```

Membership has:

* membership type
* start date
* end date
* status
* contract information

A membership ending should not delete the person or user.

Historical records must remain.

---

# Authentication Rules

Passwords:

* Never store plain text passwords.
* Use secure hashing.
* Never expose password fields through GraphQL.

Tokens:

* Access tokens should be short-lived.
* Refresh tokens should be stored securely.
* Refresh token rotation is preferred.

---

# Authorization Rules

Authorization should be role-based.

Examples:

```
SUPER_ADMIN
CLUB_ADMIN
COACH
PLAYER
STAFF
MEMBER
```

Do not hardcode permissions inside controllers/resolvers.

Use guards and decorators.

Example:

```
@RequirePermission("club.manage")
```

---

# Code Style

## TypeScript

Rules:

* Use strict TypeScript.
* Avoid `any`.
* Prefer interfaces/types for contracts.
* Use dependency injection.

Bad:

```typescript
const data:any = {};
```

Good:

```typescript
const data: UserResponse = {};
```

---

# Naming Conventions

## Files

Use NestJS conventions:

```
user.module.ts
user.service.ts
user.resolver.ts
user.controller.ts
user.dto.ts
```

---

## Database

Use singular model names:

Good:

```
User
Membership
Club
Person
```

Avoid:

```
Users
Memberships
```

---

# Testing Rules

Every important business rule should have tests.

Priority:

1. Authentication
2. Membership lifecycle
3. Permissions
4. Financial/contract logic
5. Critical workflows

Testing stack:

* Jest
* NestJS testing utilities

---

# Environment Configuration

Never commit secrets.

Required environment variables:

```
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
NODE_ENV=
```

Production environments must not expose database credentials.

Health checks should confirm:

```
Database connected successfully
API running successfully
```

without displaying connection strings.

---

# Git Rules

Commit messages should be descriptive.

Format:

```
type(scope): description
```

Examples:

```
feat(auth): add refresh token authentication

feat(membership): create membership domain models

fix(prisma): resolve migration configuration

docs(project): update architecture documentation
```

---

# Agent Rules

When modifying the project:

1. Understand existing architecture before creating new files.
2. Prefer extending existing modules over creating duplicates.
3. Do not introduce new dependencies without justification.
4. Do not change database models without considering migration impact.
5. Preserve historical business data.
6. Avoid breaking API contracts.
7. Keep controllers/resolvers thin.
8. Put business rules inside services.
9. Add tests for new critical functionality.
10. Update documentation when architecture changes.

---

# Current Architectural Direction

The expected domain model follows:

```
User
 |
Person
 |
Membership
 |
Club
 |
Team
 |
Profile Types
```

Membership is the connection point between people and clubs.

A person's relationship with a club can end, but:

* the person remains
* historical memberships remain
* previous contracts remain
* user access can be managed separately

This allows people to move between clubs while preserving identity and history.

---

# Production Requirements

Before deployment:

* Database migrations must run successfully.
* Environment variables must be configured.
* No secrets should exist in code.
* Logging must not expose sensitive information.
* Authentication flows must be tested.
* API health checks must pass.
