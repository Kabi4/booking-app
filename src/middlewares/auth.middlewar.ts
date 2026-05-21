import { AuthService } from "@/services/auth.service";
import { NextFunction } from "express";
import { NestMiddleware, Injectable, UnauthorizedException } from "@nestjs/common";
import logger from "@/logger/logger";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly authService: AuthService) {}

  async use(req: any, res: Response, next: NextFunction) {
    const token = req.headers['authorization'] as string;
    logger.info({ token }, 'Auth middleware');
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    const user:any = await this.authService.verifyToken(token);
    const userDetails = await this.authService.getUserDetails(user.userId);
    (req as any).user = userDetails;
    next();
  }
}