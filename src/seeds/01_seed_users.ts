import { Knex } from "knex";
import bcrypt from "bcrypt";

export async function seed(knex: Knex): Promise<void> {
    const users = [
        { username: 'alice', password: 'alice' },
        { username: 'bob', password: 'bob' },
        { username: 'carol', password: 'carol' },
        { username: 'dave', password: 'dave' }
    ]

    for (const user of users) {
        user.password = await bcrypt.hash(user.password, 10);
    }

    await knex('users').insert(users).onConflict('username').ignore();
};
