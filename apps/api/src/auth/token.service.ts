import { Injectable } from "@nestjs/common";
import { createHmac, randomBytes } from "node:crypto";

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
}
