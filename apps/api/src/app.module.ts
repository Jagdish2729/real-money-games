import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { PrismaService } from "./prisma.service";
import { AuthModule } from "./auth/auth.module";
import { WalletModule } from "./wallet/wallet.module";
import { DepositModule } from "./deposit/deposit.module";
import { AdminModule } from "./admin/admin.module";

@Module({
  imports: [AuthModule, WalletModule, DepositModule, AdminModule],
  controllers: [AppController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
