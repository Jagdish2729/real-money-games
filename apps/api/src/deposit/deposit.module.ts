import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { AuthModule } from "../auth/auth.module";
import { DepositController } from "./deposit.controller";
import { DepositService } from "./deposit.service";

@Module({
  imports: [AuthModule],
  controllers: [DepositController],
  providers: [DepositService, PrismaService],
})
export class DepositModule {}
