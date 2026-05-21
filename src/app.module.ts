import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { typeOrmAsyncConfig } from './config/typeorm.config';
import { AppController } from './controllers/app.controller';
import { AppService } from './services/app.service';
import { BookingController } from './controllers/booking.controller';
import { BookingService } from './services/booking.service';
import { RequestLogger } from './middlewares/logger.middleware';
import { BookingEntity } from './models/booking.entity';
import { JobProcessorService } from './services/booking-worker.service';
import { BookingQueueEntity } from './models/booking-queue.entity';
import { AuthMiddleware } from './middlewares/auth.middlewar';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserEntity } from './models/users.entity';
import { AuthAdminMiddleware } from './middlewares/auth-admin.middleware';
import { RoutePaths } from './routes/route-paths';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    TypeOrmModule.forFeature([BookingEntity, BookingQueueEntity, UserEntity]),
  ],
  controllers: [AppController, BookingController, AuthController],
  providers: [AppService, BookingService, JobProcessorService, AuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLogger).forRoutes('*');
    // Auth controller is public; all other controllers require a valid JWT
    consumer.apply(AuthMiddleware).forRoutes(AppController, BookingController);
    consumer.apply(AuthAdminMiddleware).forRoutes({
      path: RoutePaths.bookings,
      method: RequestMethod.GET,
    });
  }
}
