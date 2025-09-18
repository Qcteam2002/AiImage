import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('image_processes', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('model_image_url').notNullable();
    table.string('product_image_url').notNullable();
    table.string('result_image_url').nullable();
    table.string('status').defaultTo('processing'); // processing, completed, failed
    table.text('error_message').nullable();
    table.json('metadata').nullable(); // store additional processing info
    table.timestamps(true, true);
    
    table.index(['user_id']);
    table.index(['status']);
    table.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('image_processes');
}
