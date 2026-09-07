import { BadRequestException, Body, Controller, Inject, Param, Post, UseGuards } from "@nestjs/common";
import { AdminGuard } from "./admin.guard";
import { AdminService } from "./admin.service";

@Controller("admin")
@UseGuards(AdminGuard)
export class AdminController {
  constructor(@Inject(AdminService) private readonly adminService: AdminService) {}

  @Post("deposits/:depositId/approve")
  approveDeposit(@Param("depositId") depositId: string) {
    return this.adminService.approveDeposit(depositId);
  }

  @Post("deposits/:depositId/reject")
  rejectDeposit(@Param("depositId") depositId: string, @Body() body: { reason?: string }) {
    if (!body.reason?.trim()) throw new BadRequestException("Rejection reason is required");
    return this.adminService.rejectDeposit(depositId, body.reason);
  }
}
