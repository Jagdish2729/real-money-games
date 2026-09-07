import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { CurrentUser } from "./current-user.decorator";
import type { AuthUser } from "./auth.types";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post("request-otp")
  requestOtp(@Body() body: { phoneNumber?: string }) {
    if (!body.phoneNumber || !/^\+?91\d{10}$/.test(body.phoneNumber.trim())) {
      throw new BadRequestException("A valid Indian mobile number is required");
    }

    return this.authService.requestOtp(body.phoneNumber);
  }

  @Post("verify-otp")
  verifyOtp(@Body() body: { phoneNumber?: string; code?: string }) {
    if (!body.phoneNumber || !/^\+?91\d{10}$/.test(body.phoneNumber.trim())) {
      throw new BadRequestException("A valid Indian mobile number is required");
    }

    if (!body.code || !/^\d{6}$/.test(body.code)) {
      throw new BadRequestException("A 6-digit OTP is required");
    }

    return this.authService.verifyOtp(body.phoneNumber, body.code);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return { user };
  }
}
