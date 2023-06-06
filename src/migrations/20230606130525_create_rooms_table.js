/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('rooms', (table) => {
    table.increments('room_id').primary();
    table.string('room_number', 20).unique();
    table.string('room_type', 50);
    table.string('description', 200);
    table.string('amenities', 200);
    table.integer('price_per_night', 2);
    table.boolean('is_available').defaultTo(false);
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
  return knex.schema.dropTable('rooms');
};
