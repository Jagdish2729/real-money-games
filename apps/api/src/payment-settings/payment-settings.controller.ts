import { BadRequestException, Body, Controller, Get, Inject, Put, UseGuards } from "@nestjs/common";
import { AdminGuard } from "../admin/admin.guard";
import { PrismaService } from "../prisma.service";

const DEFAULT_INSTRUCTIONS = "Pay using the UPI ID or scan the QR code. Submit the UTR after payment.";

@Controller("payment-settings")
export class PaymentSettingsController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async get() {
    const settings = await this.prisma.paymentSetting.findUnique({ where: { id: 1 } });
    return settings ?? { id: 1, upiId: "", qrImageUrl: null, instructions: DEFAULT_INSTRUCTIONS };
  }

  @Put()
  @UseGuards(AdminGuard)
  async update(@Body() body: { upiId?: string; qrImageUrl?: string; instructions?: string }) {
    const upiId = body.upiId?.trim() ?? "";
    const qrImageUrl = body.qrImageUrl?.trim() || null;
    const instructions = body.instructions?.trim() || DEFAULT_INSTRUCTIONS;

    if (!upiId) throw new BadRequestException("UPI ID is required");
    if (upiId.length > 255) throw new BadRequestException("UPI ID is too long");
    if (qrImageUrl && qrImageUrl.length > 1000) throw new BadRequestException("QR image URL is too long");
    if (instructions.length > 1000) throw new BadRequestException("Payment instructions are too long");

    return this.prisma.paymentSetting.upsert({
      where: { id: 1 },
      create: { id: 1, upiId, qrImageUrl, instructions },
      update: { upiId, qrImageUrl, instructions },
    });
  }
}
