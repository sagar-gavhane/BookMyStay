/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  const isUserTableExists = await knex.schema.hasTable('users');
  const isRoomsTableExists = await knex.schema.hasTable('rooms');

  if (!isUserTableExists || !isRoomsTableExists) {
    return knex;
  }

  return knex.schema.createTable('bookings', (table) => {
    table.increments('booking_id').primary();
    table.integer('user_id').unsigned();
    table.integer('room_id').unsigned();
    table.foreign('user_id').references('users.user_id');
    table.foreign('room_id').references('rooms.room_id');
    table.datetime('check_in_date').defaultTo(knex.fn.now());
    table.datetime('check_out_date');
    table.integer('total_guests');
    table.integer('total_price');
    table.boolean('is_cancelled');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .defaultTo(knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'));
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable('bookings');
};
