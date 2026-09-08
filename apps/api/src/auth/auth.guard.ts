import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { TokenService } from "./token.service";
import type { AuthUser } from "./auth.types";

type AuthenticatedRequest = { headers: { authorization?: string }; user?: AuthUser };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(TokenService) private readonly tokenService: TokenService,@Inject(PrismaService) private readonly prisma: PrismaService) {}
  async canActivate(context: ExecutionContext) {
    const request=context.switchToHttp().getRequest<AuthenticatedRequest>(); const authorization=request.headers.authorization;
    if(!authorization?.startsWith("Bearer ")) throw new UnauthorizedException("Authentication required");
    const payload=this.tokenService.verifyToken(authorization.slice("Bearer ".length).trim()); if(!payload) throw new UnauthorizedException("Invalid access token");
    const user=await this.prisma.user.findUnique({where:{id:payload.sub},select:{id:true,name:true,email:true,phoneNumber:true,status:true}});
    if(!user||user.status!=="ACTIVE") throw new UnauthorizedException("User account is not active"); request.user=user; return true;
  }
}
