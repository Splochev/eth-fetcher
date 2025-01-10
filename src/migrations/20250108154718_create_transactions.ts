import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('transactions', table => {
        table.increments('id').primary();
        table.text('transactionHash').unique().notNullable().index();
        table.integer('transactionStatus').notNullable();
        table.text('blockHash').nullable();
        table.integer('blockNumber').nullable();
        table.text('from').notNullable();
        table.text('to').nullable();
        table.text('contractAddress').nullable();
        table.integer('logsCount').notNullable();
        table.text('input').notNullable();
        table.text('value').notNullable();
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('transactions');
}

