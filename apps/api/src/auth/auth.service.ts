import { Injectable, TooManyRequestsException, UnauthorizedException } from "@nestjs/common";
import { createHash, randomInt } from "node:crypto";
import { PrismaService } from "../prisma.service";

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 5;
const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 30;

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async requestOtp(phoneNumber: string) {
    const normalizedPhone = phoneNumber.trim();

    const latest = await this.prisma.otpRequest.findFirst({
      where: { phoneNumber: normalizedPhone },
      orderBy: { createdAt: "desc" },
    });

    if (latest) {
      const elapsedSeconds = Math.floor((Date.now() - latest.createdAt.getTime()) / 1000);
      if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
        throw new TooManyRequestsException(
          `Please wait ${RESEND_COOLDOWN_SECONDS - elapsedSeconds} seconds before requesting another OTP`,
        );
      }
    }

    const code = randomInt(0, 1_000_000).toString().padStart(OTP_LENGTH, "0");
    const codeHash = createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await this.prisma.otpRequest.create({
      data: {
        phoneNumber: normalizedPhone,
        codeHash,
        expiresAt,
      },
    });

    // Development-only response. A real SMS provider will replace this before production.
    return {
      message: "OTP generated successfully",
      expiresInSeconds: OTP_TTL_MINUTES * 60,
      ...(process.env.NODE_ENV !== "production" ? { developmentOtp: code } : {}),
    };
  }

  async verifyOtp(phoneNumber: string, code: string) {
    const normalizedPhone = phoneNumber.trim();
    const otp = await this.prisma.otpRequest.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        verifiedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp || otp.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException("OTP is invalid or expired");
    }

    if (otp.attempts >= MAX_VERIFY_ATTEMPTS) {
      throw new UnauthorizedException("Maximum OTP attempts exceeded");
    }

    const codeHash = createHash("sha256").update(code).digest("hex");
    if (codeHash !== otp.codeHash) {
      await this.prisma.otpRequest.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException("OTP is invalid or expired");
    }

    const user = await this.prisma.$transaction(async (tx) => {
      await tx.otpRequest.update({
        where: { id: otp.id },
        data: { verifiedAt: new Date() },
      });

      return tx.user.upsert({
        where: { phoneNumber: normalizedPhone },
        create: {
          phoneNumber: normalizedPhone,
          phoneVerifiedAt: new Date(),
          wallet: { create: {} },
        },
        update: { phoneVerifiedAt: new Date() },
        select: { id: true, phoneNumber: true, status: true },
      });
    });

    return {
      message: "OTP verified successfully",
      user,
    };
  }
}
