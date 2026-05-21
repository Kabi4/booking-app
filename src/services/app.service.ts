import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly dataSource: DataSource) {}

  async getHealth() {
    try {
      await this.dataSource.query('SELECT 1');
      this.logger.log(
        'Health check: PostgreSQL pool responded OK (SELECT 1)',
      );
      return {
        status: 'ok',
        service: 'booking-system',
        database: { connected: true },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Health check: database ping failed — ${message}`);
      throw new ServiceUnavailableException({
        status: 'error',
        service: 'booking-system',
        database: { connected: false, message },
      });
    }
  }
}
