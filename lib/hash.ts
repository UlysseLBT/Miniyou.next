import bcrypt from "bcryptjs";

export async function hashPassword(plain: string) {
  const rounds = 12; // équilibré perf/sécurité
  return bcrypt.hash(plain, rounds);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
