import { Prisma } from '@prisma/client';

export function parsePrismaError(error: unknown): string {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return 'An unexpected database error occurred.';
  }

  switch (error.code) {
    case 'P2002': {
      const fields = (error.meta?.target as string[] | undefined)?.join(', ');
      return `${fields ?? 'Resource'} already exists.`;
    }

    case 'P2003':
      return 'The referenced resource does not exist.';

    case 'P2025':
      return 'The requested resource was not found.';

    case 'P2014':
      return 'The operation violates a database relationship.';

    case 'P1000':
      return 'Database authentication failed.';

    case 'P1001':
      return 'Unable to connect to the database.';

    default:
      return `Database error (${error.code}).`;
  }
}