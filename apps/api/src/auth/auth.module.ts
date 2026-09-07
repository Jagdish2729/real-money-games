import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { TokenService } from "./token.service";
import { PrismaService } from "../prisma.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, TokenService, PrismaService],
  exports: [AuthGuard, TokenService],
})
export class AuthModule {}
