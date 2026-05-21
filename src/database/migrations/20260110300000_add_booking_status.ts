import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  const hasColumn = await knex.schema.hasColumn('bookings', 'status');
  if (!hasColumn) {
    await knex.schema.alterTable('bookings', (table) => {
      table
        .specificType('status', 'booking_status')
        .notNullable()
        .defaultTo('confirmed');
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  const hasColumn = await knex.schema.hasColumn('bookings', 'status');
  if (hasColumn) {
    await knex.schema.alterTable('bookings', (table) => {
      table.dropColumn('status');
    });
  }
  await knex.raw('DROP TYPE IF EXISTS booking_status');
}
