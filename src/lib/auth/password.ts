import { compare, hash } from "bcryptjs";

import { PASSWORD_SALT_ROUNDS } from "./constants";

export function hashPassword(password: string): Promise<string> {
  return hash(password, PASSWORD_SALT_ROUNDS);
}

export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}
