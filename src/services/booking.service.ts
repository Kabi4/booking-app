import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOneOptions, Repository } from 'typeorm';
import { BookingStatus } from '../enums/booking-status.enum';
import { BookingEntity } from '../models/booking.entity';
import { bookingQueue } from '@/queue/BookingQueue';

/** Normalize to `HH:MM:SS` so comparisons match PostgreSQL `time` and overlap logic is reliable. */
function toTimeWithSeconds(t: string): string {
  const [h = '00', m = '00', s = '00'] = t.trim().split(':');
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`;
}

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookings: Repository<BookingEntity>,
  ) {}

  findAll(): Promise<BookingEntity[]> {
    return this.bookings.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(
    id: string,
    options?: Pick<FindOneOptions<BookingEntity>, 'relations'>,
  ): Promise<BookingEntity> {
    const booking = await this.bookings.findOne({ where: { id }, relations: ['bookingJob'] });
    if (!booking) {
      throw new NotFoundException(`Booking ${id} not found`);
    }
    return booking;
  }

  /**
   * Serialize mutations that touch a calendar day so two concurrent requests cannot both pass
   * overlap checks before either inserts (check-then-act race). Lock is released on commit/rollback.
   */
  private async acquireBookingDayLocks(manager: EntityManager, dates: Iterable<string>): Promise<void> {
    const sorted = [...new Set(dates)].sort();
    for (const d of sorted) {
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1::text))', [`booking-slot:${d}`]);
    }
  }

  /** Overlap iff existing.start < new.end AND existing.end > new.start. */
  private async hasTimeOverlap(repo: Repository<BookingEntity>, data: Partial<BookingEntity>): Promise<boolean> {
    const { slotTime, slotEndTime, dateRange } = data;

    if (!slotTime || !slotEndTime || !dateRange) {
      return false;
    }

    const allowedStatus = [BookingStatus.Confirmed, BookingStatus.Pending];
    const start = toTimeWithSeconds(slotTime);
    const end = toTimeWithSeconds(slotEndTime);

    const qb = repo
      .createQueryBuilder('b')
      .where('b.date = :date', { date: dateRange })
      .andWhere('b.status IN (:...statuses)', { statuses: allowedStatus })
      .andWhere('b.slot_time < CAST(:end AS time)', { end })
      .andWhere('b.slot_end_time > CAST(:start AS time)', { start });

    if (data.id) {
      qb.andWhere('b.id != :excludeId', { excludeId: data.id });
    }

    return (await qb.getCount()) > 0;
  }

  validateBookingData(data: Partial<BookingEntity>): void {
    const { userName, slotTime, slotEndTime, dateRange } = data;
   // Add valdiations
    if (!userName) {
      throw new BadRequestException('User name is required');
    }
    if (!slotTime) {
      throw new BadRequestException('Slot time is required');
    }
    if (!slotEndTime) {
      throw new BadRequestException('Slot end time is required');
    }
    if (!dateRange) {
      throw new BadRequestException('Date range is required');
    }


    // Slot time format and timings validation
    if (!/^\d{2}:\d{2}$/.test(slotTime)) {
      throw new BadRequestException('Invalid slot time format. Use HH:MM format');
    }
    if (!/^\d{2}:\d{2}$/.test(slotEndTime)) {
      throw new BadRequestException('Invalid slot end time format. Use HH:MM format');
    }
    if (slotTime >= slotEndTime) {
      throw new BadRequestException('Slot end time must be after slot time');
    }

    // Date range validation
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateRange)) {
      throw new BadRequestException('Invalid date range format. Use YYYY-MM-DD format');
    }
    if (new Date(dateRange) < new Date()) {
      throw new BadRequestException('Date range must be in the future');
    }
  }

  async create(
    userName: string,
    slotTime: string,
    slotEndTime: string,
    dateRange: string,
  ): Promise<BookingEntity> {
    this.validateBookingData({
      userName,
      slotTime,
      slotEndTime,
      dateRange,
    });

    return this.bookings.manager.transaction(async (manager) => {
      await this.acquireBookingDayLocks(manager, [dateRange]);
      const repo = manager.getRepository(BookingEntity);

      if (await this.hasTimeOverlap(repo, { slotTime, slotEndTime, dateRange })) {
        throw new BadRequestException('This time slot is already booked.');
      }

      const booking = repo.create({
        userName,
        slotTime,
        slotEndTime,
        dateRange,
        status: BookingStatus.Pending,
      });

      
      const savedBooking = await repo.save(booking);

      // const queueRepo = manager.getRepository(BookingQueueEntity);
      // await queueRepo.save(
      //   queueRepo.create({
      //     booking: { id: savedBooking.id },
      //     status: BookingJobStatus.Pending,
      //   }),
      // );

      await bookingQueue.add("booking", {
        bookingId: savedBooking.id,
        user_name: userName,
      }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        }
      });

      return savedBooking;
    });
  }

  async update(id: string, data: Partial<BookingEntity>): Promise<BookingEntity> {
    const { id: _omitId, ...patch } = data;
    this.validateBookingData(patch);

    return this.bookings.manager.transaction(async (manager) => {
      const repo = manager.getRepository(BookingEntity);
      const existing = await repo.findOne({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Booking ${id} not found`);
      }

      const dates = [existing.dateRange, patch.dateRange].filter((d): d is string => Boolean(d));
      await this.acquireBookingDayLocks(manager, dates);

      if (await this.hasTimeOverlap(repo, { ...patch, id })) {
        throw new BadRequestException('This time slot is already booked.');
      }

      await repo.update(id, patch);
      const updated = await repo.findOne({ where: { id } });
      if (!updated) {
        throw new NotFoundException(`Booking ${id} not found`);
      }
      return updated;
    });
  }

  async cancelBooking(id: string): Promise<BookingEntity> {
    return this.bookings
      .update(id, { status: BookingStatus.Cancelled })
      .then(() => this.findOne(id, { relations: ['bookingJob'] }));
  }
}
