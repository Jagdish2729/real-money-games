import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AuthUser } from "./auth.types";

type RequestWithUser = { user?: AuthUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return request.user!;
  },
);
