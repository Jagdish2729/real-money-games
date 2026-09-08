import { BadRequestException, Body, Controller, Get, Inject, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "./auth.guard";
import { CurrentUser } from "./current-user.decorator";
import type { AuthUser } from "./auth.types";

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() body: { name?: string; email?: string; phoneNumber?: string; password?: string }) {
    return this.authService.register(body);
  }

  @Post("login")
  login(@Body() body: { phoneNumber?: string; password?: string }) {
    if (!body.phoneNumber || !body.password) throw new BadRequestException("Mobile number and password are required");
    return this.authService.login(body.phoneNumber, body.password);
  }

  @Post("forgot-password")
  forgotPassword(@Body() body: { email?: string }) {
    if (!body.email) throw new BadRequestException("Email is required");
    return this.authService.forgotPassword(body.email);
  }

  @Post("reset-password")
  resetPassword(@Body() body: { token?: string; password?: string }) {
    if (!body.token || !body.password) throw new BadRequestException("Reset token and password are required");
    return this.authService.resetPassword(body.token, body.password);
  }

  @Get("me")
  @UseGuards(AuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return { user };
  }
}
