import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  interface Row {
    data_type: string;
  }
  const result = (await knex.raw(
    `
    SELECT data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'bookings'
      AND column_name = 'id'
  `,
  )) as { rows: Row[] };

  const col = result.rows[0];
  if (!col || col.data_type === 'uuid') {
    return;
  }

  await knex.raw(`
    ALTER TABLE bookings ADD COLUMN id_new uuid NOT NULL DEFAULT gen_random_uuid();
    ALTER TABLE bookings DROP CONSTRAINT bookings_pkey;
    ALTER TABLE bookings DROP COLUMN id CASCADE;
    ALTER TABLE bookings RENAME COLUMN id_new TO id;
    ALTER TABLE bookings ALTER COLUMN id SET DEFAULT gen_random_uuid();
    ALTER TABLE bookings ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);
  `);

  await knex.raw('DROP SEQUENCE IF EXISTS bookings_id_seq CASCADE');
}

export async function down(): Promise<void> {
  throw new Error('bookings_id_to_uuid is irreversible (UUIDs cannot be mapped back to serial integers).');
}
