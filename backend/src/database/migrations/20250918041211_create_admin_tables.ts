import type { Knex } from "knex";
import bcrypt from 'bcryptjs';

export async function up(knex: Knex): Promise<void> {
  // Create admin_users table
  await knex.schema.createTable('admin_users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('username').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('email').unique().notNullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create user_usage_logs table for tracking usage
  await knex.schema.createTable('user_usage_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('action_type').notNullable(); // 'image_optimization', 'virtual_tryon', 'product_processing'
    table.integer('credits_used').notNullable();
    table.jsonb('metadata').defaultTo('{}'); // Store additional info like image size, processing time, etc.
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Add is_blocked column to users table
  await knex.schema.alterTable('users', (table) => {
    table.boolean('is_blocked').defaultTo(false);
    table.timestamp('blocked_at').nullable();
    table.string('block_reason').nullable();
  });

  // Create index for better performance
  await knex.schema.alterTable('user_usage_logs', (table) => {
    table.index(['user_id', 'created_at']);
    table.index(['action_type', 'created_at']);
  });

  // Insert default admin user
  const adminPasswordHash = await bcrypt.hash('123123', 10);
  
  await knex('admin_users').insert({
    username: 'admin',
    password_hash: adminPasswordHash,
    email: 'admin@example.com',
    is_active: true
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('user_usage_logs');
  await knex.schema.dropTable('admin_users');
  
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('is_blocked');
    table.dropColumn('blocked_at');
    table.dropColumn('block_reason');
  });
}

