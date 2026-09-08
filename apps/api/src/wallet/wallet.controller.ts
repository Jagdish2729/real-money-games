import { BadRequestException, Body, Controller, Get, Inject, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { AuthUser } from "../auth/auth.types";
import { WalletService } from "./wallet.service";

@Controller("wallet")
@UseGuards(AuthGuard)
export class WalletController {
  constructor(@Inject(WalletService) private readonly walletService: WalletService) {}

  @Get()
  getWallet(@CurrentUser() user: AuthUser) {
    return this.walletService.getWallet(user.id);
  }

  @Get("transactions")
  getTransactions(@CurrentUser() user: AuthUser, @Query("limit") limit?: string) {
    const parsedLimit = limit ? Number.parseInt(limit, 10) : 50;
    return this.walletService.getTransactions(user.id, Number.isNaN(parsedLimit) ? 50 : parsedLimit);
  }

  @Get("deposit-limit")
  getDepositLimit(@CurrentUser() user: AuthUser) {
    return this.walletService.getDepositLimit(user.id);
  }

  @Post("deposits")
  createDeposit(
    @CurrentUser() user: AuthUser,
    @Body() body: { amountRupees?: number; utr?: string; proofUrl?: string },
  ) {
    if (body.amountRupees === undefined || !Number.isFinite(body.amountRupees) || body.amountRupees <= 0) {
      throw new BadRequestException("A valid deposit amount is required");
    }

    if (!body.utr?.trim()) {
      throw new BadRequestException("UTR is required");
    }

    return this.walletService.createDeposit(user.id, body.amountRupees, body.utr.trim(), body.proofUrl?.trim());
  }

  @Post("dev/top-up")
  devTopUp(@CurrentUser() user: AuthUser, @Body() body: { amountRupees?: number }) {
    if (body.amountRupees === undefined || !Number.isFinite(body.amountRupees) || body.amountRupees <= 0) {
      throw new BadRequestException("A valid top-up amount is required");
    }

    return this.walletService.devTopUp(user.id, body.amountRupees);
  }
}
