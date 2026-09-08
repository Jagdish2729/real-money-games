import { BadRequestException, Body, Controller, Get, Inject, Param, Post, Query, UseGuards } from "@nestjs/common";
import { AdminGuard } from "./admin.guard";
import { AdminService } from "./admin.service";

@Controller("admin")
@UseGuards(AdminGuard)
export class AdminController {
  constructor(@Inject(AdminService) private readonly adminService: AdminService) {}

  @Get("dashboard") dashboard() { return this.adminService.getDashboard(); }

  @Get("deposits")
  deposits(@Query("status") status?: string) {
    const normalized = status?.toUpperCase();
    if (normalized && !["PENDING", "APPROVED", "REJECTED"].includes(normalized)) throw new BadRequestException("Invalid deposit status");
    return this.adminService.getDeposits(normalized as "PENDING" | "APPROVED" | "REJECTED" | undefined);
  }

  @Post("deposits/:depositId/approve") approveDeposit(@Param("depositId") depositId: string) { return this.adminService.approveDeposit(depositId); }

  @Post("deposits/:depositId/reject")
  rejectDeposit(@Param("depositId") depositId: string, @Body() body: { reason?: string }) {
    if (!body.reason?.trim()) throw new BadRequestException("Rejection reason is required");
    return this.adminService.rejectDeposit(depositId, body.reason);
  }

  @Get("withdrawals")
  withdrawals(@Query("status") status?: string) {
    const normalized = status?.toUpperCase();
    if (normalized && !["PENDING", "PROCESSING", "PAID", "REJECTED"].includes(normalized)) throw new BadRequestException("Invalid withdrawal status");
    return this.adminService.getWithdrawals(normalized as "PENDING" | "PROCESSING" | "PAID" | "REJECTED" | undefined);
  }

  @Post("withdrawals/:withdrawalId/approve") approveWithdrawal(@Param("withdrawalId") withdrawalId: string) { return this.adminService.approveWithdrawal(withdrawalId); }

  @Post("withdrawals/:withdrawalId/reject")
  rejectWithdrawal(@Param("withdrawalId") withdrawalId: string, @Body() body: { reason?: string }) {
    if (!body.reason?.trim()) throw new BadRequestException("Rejection reason is required");
    return this.adminService.rejectWithdrawal(withdrawalId, body.reason);
  }
}
