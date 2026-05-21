import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookingStatus } from '../enums/booking-status.enum';
import { BookingQueueEntity } from './booking-queue.entity';

@Entity('bookings')
export class BookingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_name', type: 'varchar', length: 100 })
  userName: string;

  /** Stored as PostgreSQL TIME — values like `14:30:00` (HH:MM:SS). */
  @Column({ name: 'slot_time', type: 'time' })
  slotTime: string;

  /** Stored as PostgreSQL TIME — values like `15:00:00` (HH:MM:SS). */
  @Column({ name: 'slot_end_time', type: 'time' })
  slotEndTime: string;

  @Column({ name: 'date', type: 'date' })
  dateRange: string;

  @OneToOne(() => BookingQueueEntity, (job) => job.booking)
  bookingJob?: BookingQueueEntity;

  @Column({
    name: 'status',
    type: 'enum',
    enum: BookingStatus,
    enumName: 'booking_status',
    default: BookingStatus.Confirmed,
  })
  status: BookingStatus;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
