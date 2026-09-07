import { Body, Controller, Inject, Param, Patch } from "@nestjs/common";
import { AdminService } from "./admin.service";

@Controller("admin")
export class AdminController {
  constructor(@Inject(AdminService) private readonly adminService: AdminService) {}

  @Patch("deposits/:depositId/approve")
  approveDeposit(@Param("depositId") depositId: string) {
    return this.adminService.approveDeposit(depositId);
  }

  @Patch("deposits/:depositId/reject")
  rejectDeposit(@Param("depositId") depositId: string, @Body() body: { reason?: string }) {
    return this.adminService.rejectDeposit(depositId, body.reason ?? "");
  }
}
