import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { TokenService } from "./token.service";
import type { AuthUser } from "./auth.types";

type AuthenticatedRequest = {
  headers: { authorization?: string };
  user?: AuthUser;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(TokenService) private readonly tokenService: TokenService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Authentication required");
    }

    const token = authorization.slice("Bearer ".length).trim();
    const payload = this.tokenService.verifyToken(token);
    if (!payload) {
      throw new UnauthorizedException("Invalid access token");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, phoneNumber: true, status: true },
    });

    if (!user || user.status !== "ACTIVE") {
      throw new UnauthorizedException("User account is not active");
    }

    request.user = user;
    return true;
  }
}
