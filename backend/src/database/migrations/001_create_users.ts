import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').nullable();
    table.string('last_name').nullable();
    table.integer('credits').defaultTo(5).notNullable();
    table.boolean('is_verified').defaultTo(false);
    table.string('verification_token').nullable();
    table.timestamp('email_verified_at').nullable();
    table.timestamps(true, true);
    
    table.index(['email']);
    table.index(['verification_token']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
