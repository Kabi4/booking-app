import { BookingJobStatus } from '@/enums/booking-job-status.enum';
import { BookingStatus } from '@/enums/booking-status.enum';
import logger from '@/logger/logger';
import { BookingQueueEntity } from '@/models/booking-queue.entity';
import { BookingEntity } from '@/models/booking.entity';
import { bookingQueueConnection } from '@/queue/BookingQueue';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, Worker } from 'bullmq';
import * as moment from 'moment';
import { Repository } from 'typeorm';

type BookingJobPayload = { bookingId: string; user_name: string };

type ClaimedJob = {
  id: string;
  retry_count: number;
  created_at: Date | string;
  booking: { id: string };
};

@Injectable()
export class JobProcessorService implements OnModuleInit, OnModuleDestroy {
  private worker?: Worker<BookingJobPayload>;

  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
  ) {}

  onModuleInit() {
    this.worker = new Worker<BookingJobPayload>(
      'bookingQueue',
      async (job) => {
        await this.processJob(job);
      },
      { connection: bookingQueueConnection, concurrency: 5 },
    );

    this.worker.on('completed', (job) => {
      logger.info(
        { jobId: job.id, bookingId: job.data.bookingId, attempt: job.attemptsMade, status: "Completed" },
        'Completed job',
      );
    });

    this.worker.on('failed', (job, err) => {
      logger.error(
        { jobId: job?.id, bookingId: job?.data?.bookingId, attempt: job?.attemptsMade, error: err, status: "Failed" },
        'Failed job',
      );
    });
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }

  async processJob(jobData: Job<BookingJobPayload>) {
    const claim: { job: ClaimedJob | null } = { job: null };

    try {
      await this.bookingRepository.manager.transaction(async (manager) => {
        const { bookingId, user_name } = jobData.data;

        // const result = await manager.query(
        //   `
        //   SELECT
        //     j.*,
        //     json_build_object(
        //       'id', b.id,
        //       'user_name', b.user_name,
        //       'slot_time', b.slot_time,
        //       'slot_end_time', b.slot_end_time,
        //       'date', b.date,
        //       'status', b.status,
        //       'created_at', b.created_at
        //     ) AS booking
        //   FROM booking_jobs j
        //   INNER JOIN bookings b ON b.id = j.booking_id
        //   WHERE j.id = $1 AND j.status = $2
        //   FOR UPDATE OF j
        //   `,
        //   [jobId, BookingJobStatus.Pending],
        // );

        // if (result.length === 0) {
        //   return;
        // }

        // const job = result[0] as ClaimedJob;
        // claim.job = job;

        // console.log(`Processing job ${job.id}`);

        // const modulo = moment(job.created_at).valueOf() % 2;

        // if (modulo === 1) {
        //   throw new Error('Simulated processing failure');
        // }

        await new Promise((resolve) => setTimeout(resolve, 2000));

        if (Math.random() > 0.5) {
          throw new Error('Simulated processing failure');
        }

        await manager.query(
          `
          UPDATE bookings
          SET status = $1
          WHERE id = $2 AND status = $3
          `,
          [BookingStatus.Confirmed, bookingId, BookingStatus.Pending],
        );

        // await manager.query(
        //   `
        //   UPDATE booking_jobs
        //   SET status = $1, updated_at = NOW(), processed_at = NOW()
        //   WHERE id = $2
        //   `,
        //   [BookingJobStatus.Completed, jobid],
        // );

      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      const failedJob = claim.job;
      if (!failedJob) {
        throw error;
      }

      // const retries = failedJob.retry_count + 1;

      // if (retries >= 3) {
      //   await this.bookingRepository.query(
      //     `
      //     UPDATE booking_jobs
      //     SET
      //       status = $1,
      //       failed_at = NOW(),
      //       error_message = $2,
      //       retry_count = $3,
      //       updated_at = NOW()
      //     WHERE id = $4
      //     `,
      //     [BookingJobStatus.Failed, message, retries, failedJob.id],
      //   );
      // } else {
      //   await this.bookingRepository.query(
      //     `
      //     UPDATE booking_jobs
      //     SET retry_count = $1, updated_at = NOW()
      //     WHERE id = $2
      //     `,
      //     [retries, failedJob.id],
      //   );
      // }

      throw error;
    }
  }
}
