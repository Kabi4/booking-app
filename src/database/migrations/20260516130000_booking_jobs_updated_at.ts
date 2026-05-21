import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('booking_jobs');
  if (!exists) return;

  const hasUpdatedAt = await knex.schema.hasColumn('booking_jobs', 'updated_at');
  if (!hasUpdatedAt) {
    await knex.schema.alterTable('booking_jobs', (table) => {
      table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('booking_jobs');
  if (!exists) return;

  const hasUpdatedAt = await knex.schema.hasColumn('booking_jobs', 'updated_at');
  if (hasUpdatedAt) {
    await knex.schema.alterTable('booking_jobs', (table) => {
      table.dropColumn('updated_at');
    });
  }
}
