import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('bookings', 'booking_job_id');
  if (!hasColumn) {
    await knex.schema.alterTable('bookings', (table) => {
      table
        .integer('booking_job_id')
        .nullable()
        .unique()
        .references('id')
        .inTable('booking_jobs')
        .onDelete('SET NULL');
    });
  }

  await knex.raw(`
    UPDATE bookings b
    SET booking_job_id = j.id
    FROM booking_jobs j
    WHERE j.booking_id = b.id
      AND b.booking_job_id IS NULL
  `);
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('bookings', 'booking_job_id');
  if (!hasColumn) return;

  await knex.schema.alterTable('bookings', (table) => {
    table.dropColumn('booking_job_id');
  });
}
