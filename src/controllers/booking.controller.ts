import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { BookingService } from '../services/booking.service';
import { RoutePaths } from '../routes/route-paths';
import { BookingEntity } from '@/models/booking.entity';

/** `HH:MM:SS` (seconds optional in input; DB normalizes). */
export type TimeString = string;

@Controller(RoutePaths.bookings)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get()
  list() {
    return this.bookingService.findAll();
  }

  @Get(':id')
  get(@Param('id', ParseUUIDPipe) id: string) {
    // Get booking with booking job
    return this.bookingService.findOne(id, {
      relations: ['bookingJob'],
    });
  }

  @Post()
  create(
    @Body()
    body: {
      userName: string;
      slotTime: TimeString;
      slotEndTime: TimeString;
      /** ISO date `YYYY-MM-DD`. */
      dateRange: string;
    },
  ) {
    return this.bookingService.create(
      body.userName,
      body.slotTime,
      body.slotEndTime,
      body.dateRange,
    );
  }

  /** Declared before `@Patch(':id')` so `cancel/...` is not captured as an id. */
  @Patch('cancel/:id')
  cancel(@Param('id', ParseUUIDPipe) id: string) {
    return this.bookingService.cancelBooking(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: Partial<BookingEntity>,
  ) {
    return this.bookingService.update(id, body);
  }
}
