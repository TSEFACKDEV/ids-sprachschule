import * as jose from "jose";
import type { JWTPayload } from "@/types";

export async function verifyTokenEdge(
  token: string
): Promise<JWTPayload | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}