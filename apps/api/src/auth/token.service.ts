import { Injectable } from "@nestjs/common";
import { createHmac, timingSafeEqual } from "node:crypto";

export type TokenPayload = {
  sub: string;
  iat: number;
};

@Injectable()
export class TokenService {
  private readonly secret = process.env.AUTH_TOKEN_SECRET ?? "development-only-secret-change-before-production";

  createToken(userId: string): string {
    const payload = Buffer.from(
      JSON.stringify({ sub: userId, iat: Math.floor(Date.now() / 1000) }),
    ).toString("base64url");
    const signature = createHmac("sha256", this.secret)
      .update(payload)
      .digest("base64url");

    return `${payload}.${signature}`;
  }

  verifyToken(token: string): TokenPayload | null {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;

    const expected = createHmac("sha256", this.secret)
      .update(payload)
      .digest("base64url");

    const providedBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      providedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(providedBuffer, expectedBuffer)
    ) {
      return null;
    }

    try {
      const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as TokenPayload;
      if (!decoded.sub || typeof decoded.sub !== "string" || typeof decoded.iat !== "number") {
        return null;
      }
      return decoded;
    } catch {
      return null;
    }
  }
}
