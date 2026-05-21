import { Knex } from 'knex';

/**
 * For databases created with the older migration (timestamp slot_time, no end/date).
 */
export async function up(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('bookings');
  if (!hasTable) return;

  const hasDate = await knex.schema.hasColumn('bookings', 'date');
  if (!hasDate) {
    await knex.schema.alterTable('bookings', (table) => {
      table.date('date').notNullable().defaultTo(knex.fn.now());
    });
    await knex.raw('ALTER TABLE bookings ALTER COLUMN date DROP DEFAULT');
  }

  const hasEnd = await knex.schema.hasColumn('bookings', 'slot_end_time');
  if (!hasEnd) {
    await knex.schema.alterTable('bookings', (table) => {
      table.time('slot_end_time').notNullable().defaultTo('23:59:59');
    });
    await knex.raw('ALTER TABLE bookings ALTER COLUMN slot_end_time DROP DEFAULT');
  }

  await knex.raw(`
    ALTER TABLE bookings
    ALTER COLUMN slot_time TYPE time USING (slot_time::time);
  `);

  await knex.raw(`
    ALTER TABLE bookings
    ALTER COLUMN slot_end_time TYPE time USING (slot_end_time::time);
  `);
}

export async function down(knex: Knex): Promise<void> {
  const hasTable = await knex.schema.hasTable('bookings');
  if (!hasTable) return;

  await knex.raw(`
    ALTER TABLE bookings
    ALTER COLUMN slot_time TYPE timestamp USING (slot_time::timestamp);
  `);
  await knex.raw(`
    ALTER TABLE bookings
    ALTER COLUMN slot_end_time TYPE timestamp USING (slot_end_time::timestamp);
  `);
}
