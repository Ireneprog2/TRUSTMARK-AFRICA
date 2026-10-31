import { randomBytes, scrypt as callbackScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(callbackScrypt);
const keyLength = 64;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = await scrypt(password, salt, keyLength) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, storedKey] = passwordHash.split("$");
  if (algorithm !== "scrypt" || !salt || !storedKey || !/^[a-f0-9]{128}$/.test(storedKey)) return false;
  const derivedKey = await scrypt(password, salt, keyLength) as Buffer;
  return timingSafeEqual(derivedKey, Buffer.from(storedKey, "hex"));
}
