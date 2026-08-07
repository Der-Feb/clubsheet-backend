import { createHmac, randomBytes } from 'crypto';

/**
 * Generate a cryptographically random application token using Node's CSPRNG.
 * Returns the raw token (to be sent to the user) and its HMAC-SHA-256 digest
 * (to be stored in the database).
 *
 * The raw token is NEVER stored. Only the deterministic HMAC digest is persisted,
 * allowing O(1) lookup via findUnique without iterating through records.
 *
 * @param secret - TOKEN_HASH_SECRET from environment. Must not be the JWT secret.
 */
export function generateApplicationToken(secret: string): {
    token: string;
    hash: string;
} {
    const token = randomBytes(32).toString('base64url');
    const hash = computeTokenHash(secret, token);
    return { token, hash };
}

/**
 * Compute the HMAC-SHA-256 digest of a raw token using the dedicated secret.
 * Use this during validation to derive the lookup key from a submitted token.
 *
 * @param secret - TOKEN_HASH_SECRET from environment.
 * @param rawToken - The plain token received from the user.
 */
export function computeTokenHash(secret: string, rawToken: string): string {
    return createHmac('sha256', secret).update(rawToken).digest('hex');
}
