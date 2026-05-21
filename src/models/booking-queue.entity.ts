import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookingJobStatus } from '../enums/booking-job-status.enum';
import { BookingEntity } from './booking.entity';

@Entity('booking_jobs')
export class BookingQueueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => BookingEntity, (booking) => booking.bookingJob)
  @JoinColumn({ name: 'booking_id' })
  booking: BookingEntity;

  @Column({ name: 'status', type: 'varchar', length: 32, default: BookingJobStatus.Pending })
  status: BookingJobStatus;

  @Column({ name: 'retry_count', type: 'int', default: 0 })
  retryCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
