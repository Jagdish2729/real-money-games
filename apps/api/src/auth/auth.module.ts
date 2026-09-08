import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { TokenService } from "./token.service";
import { OtpSmsService } from "./otp-sms.service";
import { PrismaService } from "../prisma.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, TokenService, OtpSmsService, PrismaService],
  exports: [AuthGuard, TokenService],
})
export class AuthModule {}
