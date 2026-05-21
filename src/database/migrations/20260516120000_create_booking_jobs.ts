import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('booking_jobs');
  if (exists) return;

  await knex.schema.createTable('booking_jobs', (table) => {
    table.increments('id').primary();
    table.uuid('booking_id').notNullable().references('id').inTable('bookings').onDelete('CASCADE');
    table.string('status', 32).notNullable().defaultTo('pending');
    table.integer('retry_count').notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['status', 'created_at']);
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('booking_jobs');
}
