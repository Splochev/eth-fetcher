import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('users_transactions', (table) => {
        table.integer('user_id').unsigned().notNullable();
        table.integer('transaction_id').unsigned().notNullable();
        table.foreign('user_id').references('users.id').onDelete('CASCADE');
        table.foreign('transaction_id').references('transactions.id').onDelete('CASCADE');
        table.unique(['user_id', 'transaction_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('users_transactions');
}

