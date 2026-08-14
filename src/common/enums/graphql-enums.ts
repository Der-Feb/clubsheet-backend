import { registerEnumType } from '@nestjs/graphql';
import {
  // access.prisma
  ENGender,
  ENUserTokenType,
  ENUserTokenStatus,
  ENMembershipStatus,
  ENMembershipType,
  ENPermissionModule,
  ENPermissionAction,
  ENPermissionScope,
  ENClubStatus,
  ENInvitationStatus,
  // system.prisma
  ENAuditCategory,
} from '@prisma/client';

// ─── Person ──────────────────────────────────────────────────────────────────

registerEnumType(ENGender, {
  name: 'ENGender',
  description: 'Biological gender of a person.',
});

// ─── User Token ──────────────────────────────────────────────────────────────

registerEnumType(ENUserTokenType, {
  name: 'ENUserTokenType',
  description: 'Purpose of a one-time application token.',
});

registerEnumType(ENUserTokenStatus, {
  name: 'ENUserTokenStatus',
  description: 'Lifecycle state of a user token.',
});

// ─── Membership ──────────────────────────────────────────────────────────────

registerEnumType(ENMembershipStatus, {
  name: 'ENMembershipStatus',
  description: 'Lifecycle state of a club membership.',
});

registerEnumType(ENMembershipType, {
  name: 'ENMembershipType',
  description: 'Role category a person holds within a club membership.',
});

// ─── Permissions & Roles ─────────────────────────────────────────────────────

registerEnumType(ENPermissionModule, {
  name: 'ENPermissionModule',
  description: 'Feature area a permission belongs to.',
});

registerEnumType(ENPermissionAction, {
  name: 'ENPermissionAction',
  description: 'Operation type a permission grants.',
});

registerEnumType(ENPermissionScope, {
  name: 'ENPermissionScope',
  description: 'Boundary within which a permission applies (OWN, TEAM, CLUB, ANY).',
});

// ─── Club ─────────────────────────────────────────────────────────────────────

registerEnumType(ENClubStatus, {
  name: 'ENClubStatus',
  description: 'Operational status of a club.',
});

// ─── Invitation ───────────────────────────────────────────────────────────────

registerEnumType(ENInvitationStatus, {
  name: 'ENInvitationStatus',
  description: 'State of a club invitation.',
});

// ─── Audit ────────────────────────────────────────────────────────────────────

registerEnumType(ENAuditCategory, {
  name: 'ENAuditCategory',
  description: 'Domain category an audit log entry belongs to.',
});
