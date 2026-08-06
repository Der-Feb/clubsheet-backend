import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = "permissions";
export interface IPermissionsMetadata {
    strict: boolean,
    permissions: string[],
}

/**
 * @param strict - If `true`, user must have ALL listed permissions. If `false`, user needs AT LEAST ONE.
 * @param permissions - Array of permission code strings.
 */
export const RequirePermissions = (strict: boolean, permissions: string[]) => 
    SetMetadata(PERMISSIONS_KEY, { strict, permissions } as IPermissionsMetadata);
