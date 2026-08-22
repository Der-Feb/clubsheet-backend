import 'dotenv/config';
import { ENPermissionAction, ENPermissionFeature, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Initialize PostgreSQL pool and Prisma adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const permissionsData = [
  // CLUB MODULE
  { code: 'CLUB_READ', name: 'Read Club Information', module: ENPermissionFeature.ACCESS, action: ENPermissionAction.READ, description: 'View club details' },
  { code: 'CLUB_WRITE', name: 'Write Club Information', module: ENPermissionFeature.ACCESS, action: ENPermissionAction.WRITE, description: 'Write club details' },
  { code: 'CLUB_DELETE', name: 'Delete Club', module: ENPermissionFeature.ACCESS, action: ENPermissionAction.DELETE, description: 'Delete or archive club' },

  // ACCESS & ROLES MODULE
  { code: 'PERMISSION_ASSIGN', name: 'Assign Permission', module: ENPermissionFeature.ACCESS, action: ENPermissionAction.ASSIGN, description: 'Assign permissions to members' },
  { code: 'PERMISSION_READ', name: 'Read Member Information', module: ENPermissionFeature.ACCESS, action: ENPermissionAction.READ, description: 'View permissions details' },
  { code: 'PERMISSION_REVOKE', name: 'Revoke Permission', module: ENPermissionFeature.ACCESS, action: ENPermissionAction.DELETE, description: 'Revoke permissions to members' },
  
  { code: 'ROLE_ASSIGN', name: 'Assign Role', module: ENPermissionFeature.ACCESS, action: ENPermissionAction.ASSIGN, description: 'Assign roles to members' },
  { code: 'ROLE_READ', name: 'Read Role Information', module: ENPermissionFeature.ACCESS, action: ENPermissionAction.READ, description: 'View roles details' },
  { code: 'ROLE_REVOKE', name: 'Revoke Roles', module: ENPermissionFeature.ACCESS, action: ENPermissionAction.DELETE, description: 'Revoke roles to members' },
  { code: 'ROLE_DELETE', name: 'Delete Role', module: ENPermissionFeature.ACCESS, action: ENPermissionAction.DELETE, description: 'Delete or archive non system role' },

  // PLAYER MODULE
  { code: 'PLAYER_READ', name: 'Read Player Information', module: ENPermissionFeature.PLAYER, action: ENPermissionAction.READ, description: 'View player details' },
  { code: 'PLAYER_WRITE', name: 'Write Player Information', module: ENPermissionFeature.PLAYER, action: ENPermissionAction.WRITE, description: 'Write player details' },
  { code: 'PLAYER_ASSIGN', name: 'Move player to team', module: ENPermissionFeature.PLAYER, action: ENPermissionAction.ASSIGN, description: 'Move player to team' },
  { code: 'PLAYER_UNASSIGN', name: 'Remove player from team', module: ENPermissionFeature.PLAYER, action: ENPermissionAction.DELETE, description: 'Remove player from team' },

  // MEMBERSHIP MODULE
  { code: 'MEMBERSHIP_READ', name: 'Read Membership Information', module: ENPermissionFeature.ACCESS, action: ENPermissionAction.READ, description: 'View membership details' },
  { code: 'MEMBERSHIP_WRITE', name: 'Write Membership Information', module: ENPermissionFeature.ACCESS, action: ENPermissionAction.WRITE, description: 'Write membership details' },
  { code: 'MEMBERSHIP_SUSPEND', name: 'Suspend Membership', module: ENPermissionFeature.ACCESS, action: ENPermissionAction.DELETE, description: 'Suspend membership' },

  // PROFILE MODULE
  { code: 'PROFILE_READ', name: 'Read Profile Information', module: ENPermissionFeature.ACCESS, action: ENPermissionAction.READ, description: 'View profile details' },
  { code: 'PROFILE_WRITE', name: 'Write Profile Information', module: ENPermissionFeature.ACCESS, action: ENPermissionAction.WRITE, description: 'Write profile details' },

  // TEAM MODULE
  { code: 'TEAM_READ', name: 'Read Team Information', module: ENPermissionFeature.TEAM, action: ENPermissionAction.READ, description: 'View team details' },
  { code: 'TEAM_WRITE', name: 'Write Team Information', module: ENPermissionFeature.TEAM, action: ENPermissionAction.WRITE, description: 'Write team details' },
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
    permissionCodes: ["CLUB_READ", "PLAYER_READ", "PLAYER_WRITE", "TEAM_READ"]
  },
  {
    code: "PLAYER", name: "Player",
    description: "Player role with access to player features of the club",
    permissionCodes: ["PLAYER_READ"]
  }
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