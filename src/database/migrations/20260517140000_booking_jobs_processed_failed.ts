import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('booking_jobs');
  if (!exists) return;

  const hasProcessedAt = await knex.schema.hasColumn('booking_jobs', 'processed_at');
  if (!hasProcessedAt) {
    await knex.schema.alterTable('booking_jobs', (table) => {
      table.timestamp('processed_at');
    });
  }

  const hasFailedAt = await knex.schema.hasColumn('booking_jobs', 'failed_at');
  if (!hasFailedAt) {
    await knex.schema.alterTable('booking_jobs', (table) => {
      table.timestamp('failed_at');
    });
  }

  const hasErrorMessage = await knex.schema.hasColumn('booking_jobs', 'error_message');
  if (!hasErrorMessage) {
    await knex.schema.alterTable('booking_jobs', (table) => {
      table.text('error_message');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('booking_jobs');
  if (!exists) return;

  const hasProcessedAt = await knex.schema.hasColumn('booking_jobs', 'processed_at');
  if (hasProcessedAt) {
    await knex.schema.alterTable('booking_jobs', (table) => {
      table.dropColumn('processed_at');
    });
  }

  const hasFailedAt = await knex.schema.hasColumn('booking_jobs', 'failed_at');
  if (hasFailedAt) {
    await knex.schema.alterTable('booking_jobs', (table) => {
      table.dropColumn('failed_at');
    });
  }

  const hasErrorMessage = await knex.schema.hasColumn('booking_jobs', 'error_message');
  if (hasErrorMessage) {
    await knex.schema.alterTable('booking_jobs', (table) => {
      table.dropColumn('error_message');
    });
  }
}
