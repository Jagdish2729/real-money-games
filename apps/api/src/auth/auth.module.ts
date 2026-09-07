import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { TokenService } from "./token.service";
import { PrismaService } from "../prisma.service";

@Module({
  controllers: [AuthController],
  providers: [AuthService, TokenService, PrismaService],
})
export class AuthModule {}
