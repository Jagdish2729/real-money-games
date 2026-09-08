import { Inject, Injectable, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { PrismaService } from "../prisma.service";
import { TokenService } from "./token.service";
import { EmailService } from "./email.service";

const RESET_TTL_MINUTES = 30;

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(TokenService) private readonly tokenService: TokenService,
    @Inject(EmailService) private readonly emailService: EmailService,
  ) {}

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, stored: string) {
    const [salt, storedHash] = stored.split(":");
    if (!salt || !storedHash) return false;
    const derived = scryptSync(password, salt, 64);
    const expected = Buffer.from(storedHash, "hex");
    return expected.length === derived.length && timingSafeEqual(derived, expected);
  }

  private normalizePhone(phoneNumber: string) {
    const phone = phoneNumber.trim();
    return phone.startsWith("+91") ? phone : `+91${phone}`;
  }

  private publicUser(user: { id: string; name: string; email: string | null; phoneNumber: string; status: string }) {
    return { id: user.id, name: user.name, email: user.email, phoneNumber: user.phoneNumber, status: user.status };
  }

  async register(body: { name?: string; email?: string; phoneNumber?: string; password?: string }) {
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const phoneNumber = body.phoneNumber ? this.normalizePhone(body.phoneNumber) : "";
    const password = body.password ?? "";

    if (!name || name.length < 2 || name.length > 100) throw new BadRequestException("Please enter a valid name");
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException("Please enter a valid email address");
    if (!/^\+91[6-9]\d{9}$/.test(phoneNumber)) throw new BadRequestException("A valid Indian mobile number is required");
    if (password.length < 8) throw new BadRequestException("Password must be at least 8 characters");

    const existing = await this.prisma.user.findFirst({ where: { OR: [{ phoneNumber }, { email }] } });
    if (existing) {
      if (existing.phoneNumber === phoneNumber) throw new BadRequestException("This mobile number is already registered");
      throw new BadRequestException("This email is already registered");
    }

    const user = await this.prisma.$transaction(async (tx) => tx.user.create({
      data: {
        name,
        email,
        phoneNumber,
        passwordHash: this.hashPassword(password),
        phoneVerifiedAt: new Date(),
        wallet: { create: {} },
      },
      select: { id: true, name: true, email: true, phoneNumber: true, status: true },
    }));

    return { message: "Account created successfully", accessToken: this.tokenService.createToken(user.id), user: this.publicUser(user) };
  }

  async login(phoneNumberInput: string, password: string) {
    const phoneNumber = this.normalizePhone(phoneNumberInput);
    const user = await this.prisma.user.findUnique({ where: { phoneNumber } });
    if (!user || !user.passwordHash || !this.verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException("Invalid mobile number or password");
    }
    if (user.status !== "ACTIVE") throw new UnauthorizedException("User account is not active");

    return { message: "Login successful", accessToken: this.tokenService.createToken(user.id), user: this.publicUser(user) };
  }

  async forgotPassword(emailInput: string) {
    const email = emailInput.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always return the same response so the endpoint does not reveal whether an email is registered.
    if (!user) return { message: "If an account exists for this email, a reset link has been sent." };

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await this.prisma.passwordReset.create({
      data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000) },
    });

    const webUrl = process.env.WEB_URL ?? "http://localhost:3000";
    await this.emailService.sendPasswordReset(email, user.name, `${webUrl}/reset-password?token=${token}`);
    return { message: "If an account exists for this email, a reset link has been sent." };
  }

  async resetPassword(token: string, password: string) {
    if (!token || password.length < 8) throw new BadRequestException("Invalid reset request or password");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const reset = await this.prisma.passwordReset.findUnique({ where: { tokenHash } });
    if (!reset || reset.usedAt || reset.expiresAt.getTime() <= Date.now()) throw new BadRequestException("Reset link is invalid or expired");

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: reset.userId }, data: { passwordHash: this.hashPassword(password) } }),
      this.prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    ]);
    return { message: "Password updated successfully" };
  }
}
