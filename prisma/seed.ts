import 'dotenv/config';
import { ENPermissionAction, ENFeature, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Initialize PostgreSQL pool and Prisma adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const permissionsData = [
  // CLUB MODULE
  { code: 'CLUB_READ', name: 'Read Club Information', module: ENFeature.IAM, action: ENPermissionAction.READ, description: 'View club details' },
  { code: 'CLUB_WRITE', name: 'Write Club Information', module: ENFeature.IAM, action: ENPermissionAction.WRITE, description: 'Write club details' },
  { code: 'CLUB_DELETE', name: 'Delete Club', module: ENFeature.IAM, action: ENPermissionAction.DELETE, description: 'Delete or archive club' },

  // IAM & ROLES MODULE
  { code: 'PERMISSION_ASSIGN', name: 'Assign Permission', module: ENFeature.IAM, action: ENPermissionAction.ASSIGN, description: 'Assign permissions to members' },
  { code: 'PERMISSION_READ', name: 'Read Member Information', module: ENFeature.IAM, action: ENPermissionAction.READ, description: 'View permissions details' },
  { code: 'PERMISSION_REVOKE', name: 'Revoke Permission', module: ENFeature.IAM, action: ENPermissionAction.DELETE, description: 'Revoke permissions to members' },
  
  { code: 'ROLE_ASSIGN', name: 'Assign Role', module: ENFeature.IAM, action: ENPermissionAction.ASSIGN, description: 'Assign roles to members' },
  { code: 'ROLE_READ', name: 'Read Role Information', module: ENFeature.IAM, action: ENPermissionAction.READ, description: 'View roles details' },
  { code: 'ROLE_REVOKE', name: 'Revoke Roles', module: ENFeature.IAM, action: ENPermissionAction.DELETE, description: 'Revoke roles to members' },
  { code: 'ROLE_DELETE', name: 'Delete Role', module: ENFeature.IAM, action: ENPermissionAction.DELETE, description: 'Delete or archive non system role' },

  // ATHLETE MODULE
  { code: 'ATHLETE_READ', name: 'Read Athlete Information', module: ENFeature.ATHLETE, action: ENPermissionAction.READ, description: 'View athlete details' },
  { code: 'ATHLETE_WRITE', name: 'Write Athlete Information', module: ENFeature.ATHLETE, action: ENPermissionAction.WRITE, description: 'Write athlete details' },
  { code: 'ATHLETE_ASSIGN', name: 'Move athlete to team', module: ENFeature.ATHLETE, action: ENPermissionAction.ASSIGN, description: 'Move athlete to team' },
  { code: 'ATHLETE_UNASSIGN', name: 'Remove athlete from team', module: ENFeature.ATHLETE, action: ENPermissionAction.DELETE, description: 'Remove athlete from team' },

  // MEMBERSHIP MODULE
  { code: 'MEMBERSHIP_READ', name: 'Read Membership Information', module: ENFeature.IAM, action: ENPermissionAction.READ, description: 'View membership details' },
  { code: 'MEMBERSHIP_WRITE', name: 'Write Membership Information', module: ENFeature.IAM, action: ENPermissionAction.WRITE, description: 'Write membership details' },
  { code: 'MEMBERSHIP_SUSPEND', name: 'Suspend Membership', module: ENFeature.IAM, action: ENPermissionAction.DELETE, description: 'Suspend membership' },

  // PROFILE MODULE
  { code: 'PROFILE_READ', name: 'Read Profile Information', module: ENFeature.IAM, action: ENPermissionAction.READ, description: 'View profile details' },
  { code: 'PROFILE_WRITE', name: 'Write Profile Information', module: ENFeature.IAM, action: ENPermissionAction.WRITE, description: 'Write profile details' },

  // TEAM MODULE
  { code: 'TEAM_READ', name: 'Read Team Information', module: ENFeature.TEAM, action: ENPermissionAction.READ, description: 'View team details' },
  { code: 'TEAM_WRITE', name: 'Write Team Information', module: ENFeature.TEAM, action: ENPermissionAction.WRITE, description: 'Write team details' },
];

const roleData = [
  {
    code: "ADMIN", name: "Admin",
    description: "Admin role with full access to all features of the club",
    permissionCodes: [] // will get all permissions dynamically
  },
  {
    code: "COACH", name: "Coach",
    description: "Coach role with access to coach features of the club",
    permissionCodes: ["CLUB_READ", "ATHLETE_READ", "ATHLETE_WRITE", "TEAM_READ"]
  },
  {
    code: "ATHLETE", name: "Athlete",
    description: "Athlete role with access to athlete features of the club",
    permissionCodes: ["ATHLETE_READ"]
  }
];

const featuresData = [
  {
    code: ENFeature.IAM, name: 'Identity & Access Management',
    description: 'Authentication, memberships, roles and permissions for the club',
    isCore: true, isActive: true,
  },
  {
    code: ENFeature.CLUB, name: 'Club Management',
    description: 'Core club profile, settings and administration',
    isCore: true, isActive: true,
  },
  {
    code: ENFeature.TEAM, name: 'Team Management',
    description: 'Manage teams within the club',
    isCore: true, isActive: true,
  },
  {
    code: ENFeature.ATHLETE, name: 'Athlete Management',
    description: 'Manage athlete records and team assignment',
    isCore: true, isActive: true,
  },
  {
    code: ENFeature.TRAINING, name: 'Training',
    description: 'Schedule and track training sessions',
    isCore: false, isActive: true,
  },
  {
    code: ENFeature.MATCH, name: 'Matches', 
    description: 'Fixtures, results and match management',
    isCore: false, isActive: true,
  },
  {
    code: ENFeature.SIGNING, name: 'Signings',
    description: 'Athlete registrations, transfers and contract signings',
    isCore: false, isActive: true,
  },
  {
    code: ENFeature.MEDICAL, name: 'Medical',
    description: 'Medical records, injuries and treatment history',
    isCore: false, isActive: true,
  },
  {
    code: ENFeature.FINANCE, name: 'Finance',
    description: 'Club finances, invoicing and payments',
    isCore: false, isActive: true,
  },
];

async function main() {
  console.log("Starting data seeding ...");
  
  console.log("Seeding permissions ...");
  const createdPermissions = new Map<string, string>();
  for (const perm of permissionsData) {
    const permission = await prisma.permission.upsert({
      where: { code: perm.code },
      update: {
        name: perm.name,
        description: perm.description,
        module: perm.module,
        action: perm.action,
      },
      create: {
        code: perm.code,
        name: perm.name,
        description: perm.description,
        module: perm.module,
        action: perm.action,
      },
    });

    createdPermissions.set(permission.code, permission.id);
  }

  console.log("Seeding roles ...");
  for (const roleDef of roleData) {
    const role = await prisma.role.upsert({
      where: { code: roleDef.code },
      update: {
        name: roleDef.name,
        description: roleDef.description,
      },
      create: {
        code: roleDef.code,
        name: roleDef.name,
        description: roleDef.description,
      },
    });

    // Determine target permission codes (dynamically pull all permissions for ADMIN)
    const targetPermCodes =
      roleDef.code === "ADMIN"
        ? Array.from(createdPermissions.keys())
        : roleDef.permissionCodes;

    // Connect Permissions to Role via RolePermission junction table
    for (const permCode of targetPermCodes) {
      const permissionId = createdPermissions.get(permCode);
      if (!permissionId) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permissionId,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permissionId,
        },
      });
    }
  }

  console.log("Seeding features ...");
  for (const feat of featuresData) {
    await prisma.feature.upsert({
      where: { code: feat.code },
      update: { name: feat.name, description: feat.description, isCore: feat.isCore },
      create: { code: feat.code, name: feat.name, description: feat.description, isCore: feat.isCore },
    });
  }

  console.log("✅ Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });