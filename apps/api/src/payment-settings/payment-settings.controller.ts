import { Body, Controller, Get, Inject, Put, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../admin/admin.guard";
import { PaymentSettingsService } from "./payment-settings.service";

@Controller("payment-settings")
export class PaymentSettingsController {
  constructor(@Inject(PaymentSettingsService) private readonly service: PaymentSettingsService) {}

  @Get()
  get() {
    return this.service.get();
  }

  @Put()
  @UseGuards(AdminGuard)
  update(@Body() body: { upiId?: string; qrImageUrl?: string; instructions?: string }) {
    return this.service.update(body);
  }
}
