import type { BookingStatus } from '../enums/booking-status.enum';

export interface Booking {
  id: string;
  bookingJobId?: number;
  userName: string;
  /** `HH:MM:SS` */
  slotTime: string;
  /** `HH:MM:SS` */
  slotEndTime: string;
  /** `YYYY-MM-DD` */
  dateRange: string;
  status: BookingStatus;
  createdAt: Date;
}
