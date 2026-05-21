import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  const exists = await knex.schema.hasTable('bookings');
  if (exists) return;

  await knex.schema.createTable('bookings', (table) => {
    table.increments('id').primary();
    table.string('user_name', 100).notNullable();
    table.time('slot_time').notNullable();
    table.time('slot_end_time').notNullable();
    table.date('date').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('bookings');
}
