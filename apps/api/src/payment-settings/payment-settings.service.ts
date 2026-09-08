import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class PaymentSettingsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async get() {
    const settings = await this.prisma.paymentSetting.findUnique({ where: { id: 1 } });
    return settings ?? { id: 1, upiId: "", qrImageUrl: null, instructions: "Pay using the UPI ID or scan the QR code. Submit the UTR after payment." };
  }

  async update(input: { upiId?: string; qrImageUrl?: string; instructions?: string }) {
    const upiId = input.upiId?.trim() ?? "";
    const qrImageUrl = input.qrImageUrl?.trim() || null;
    const instructions = input.instructions?.trim() || "Pay using the UPI ID or scan the QR code. Submit the UTR after payment.";

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
