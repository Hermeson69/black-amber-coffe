/**
 * JWT private key and expiration date
 */
export const JWTSECRETKEY = process.env.JWT_SECRET;
export const JWTEXPIRATION = process.env.JWT_EXPIRATION;
export const JWTREFRESHSECRET =
  process.env.JWT_SECRET_REFRESH ?? process.env.REFRESH_SECRET;
