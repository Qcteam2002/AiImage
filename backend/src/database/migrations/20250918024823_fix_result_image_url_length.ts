import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('image_processes', (table) => {
    // Change result_image_url from VARCHAR(255) to TEXT to handle base64 data URLs
    table.text('result_image_url').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('image_processes', (table) => {
    // Revert back to VARCHAR(255) - WARNING: This may cause data loss
    table.string('result_image_url', 255).alter();
  });
}

