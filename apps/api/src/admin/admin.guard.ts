import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers: { [key: string]: string | undefined } }>();
    const configuredKey = process.env.ADMIN_API_KEY;

    if (!configuredKey) {
      throw new UnauthorizedException("Admin API is not configured");
    }

    const suppliedKey = request.headers["x-admin-key"];
    if (!suppliedKey || suppliedKey !== configuredKey) {
      throw new UnauthorizedException("Admin authentication required");
    }

    return true;
  }
}
