import { env } from '$env/dynamic/public';

/**
 * Deployment-wide product mode.
 * Defaults to beta during this early stage; set PUBLIC_BETA_MODE=false for release copy.
 */
export const betaMode = env.PUBLIC_BETA_MODE?.trim().toLowerCase() !== 'false';
