import logger from "@/logger/logger";
import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction } from "express";

@Injectable()
export class AuthAdminMiddleware implements NestMiddleware {
  async use(req: any, res: Response, next: NextFunction) {
    logger.info({ user: (req as any).user }, 'Auth admin middleware');
    const user = (req as any).user;
    if ((user as any).role !== 'admin') {
      throw new UnauthorizedException('Unauthorized to access this resource');
    }
    next();
  }
}   