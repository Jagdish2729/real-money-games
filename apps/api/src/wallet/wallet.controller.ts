import { Controller, Get, Inject, Query, UseGuards } from "@nestjs/common";
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
}
