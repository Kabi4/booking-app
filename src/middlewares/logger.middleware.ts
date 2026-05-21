import logger from '@/logger/logger';
import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLogger implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl } = req;

    res.on('finish', () => {
      logger.info(
        { method, originalUrl, statusCode: res.statusCode, durationMs: Date.now() - start },
        'HTTP request',
      );
    });

    next();
  }
}
