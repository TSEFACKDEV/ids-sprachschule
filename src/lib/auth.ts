import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { JWTPayload } from "@/types";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "ids_token";

export function generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    // Version synchrone pour middleware Edge (jose)
    // Utilisée UNIQUEMENT dans le middleware
    // Les API routes utilisent jsonwebtoken
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    // jose.jwtVerify est async — pour le middleware on utilise jose
    // Cette fonction reste pour les API routes (côté Node.js)
    const decoded = require("jsonwebtoken").verify(
      token,
      process.env.JWT_SECRET!
    ) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function generateTempPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "@#$!%&*";
  const all = upper + lower + digits + symbols;

  const getRandom = (chars: string) =>
    chars[Math.floor(Math.random() * chars.length)];

  let password =
    getRandom(upper) +
    getRandom(lower) +
    getRandom(digits) +
    getRandom(symbols);

  for (let i = 0; i < 8; i++) {
    password += getRandom(all);
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export function generateNumeroInscription(count: number): string {
  const year = new Date().getFullYear();
  const padded = String(count).padStart(5, "0");
  return `IDS-${year}-${padded}`;
}

export function generateNumeroRecu(count: number): string {
  const year = new Date().getFullYear();
  const padded = String(count).padStart(3, "0");
  return `IDS-${year}-${padded}`;
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME;