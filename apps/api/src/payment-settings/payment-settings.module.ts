import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { PaymentSettingsController } from "./payment-settings.controller";
import { PaymentSettingsService } from "./payment-settings.service";

@Module({
  controllers: [PaymentSettingsController],
  providers: [PaymentSettingsService, PrismaService],
})
export class PaymentSettingsModule {}
