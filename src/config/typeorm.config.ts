import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { BookingEntity } from '../models/booking.entity';
import configuration from './configuration';
import { BookingQueueEntity } from '@/models/booking-queue.entity';
import { UserEntity } from '@/models/users.entity';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const db = config.getOrThrow<ReturnType<typeof configuration>['database']>(
      'database',
    );
    return {
      type: 'postgres' as const,
      host: db.host,
      port: db.port,
      username: db.username,
      password: db.password,
      database: db.name,
      entities: [BookingEntity, BookingQueueEntity, UserEntity],
      synchronize: db.synchronize,
      logging: db.logging,
    };
  },
};
