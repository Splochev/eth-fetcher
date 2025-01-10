import knex from "knex";
import config from "../knexfile";
const db = knex(config.development);

export const insertUser = async (user: { username: string; password: string }) => {
  const userObj = await db('users').insert(user).onConflict('username').ignore().returning('id');
  return userObj[0].id;
};

export const findUserByUsername = async (username: string) => {
  return db("users").where({ username }).first();
};

export const findUserById = async (id: number) => {
  return db("users").where({ id }).first();
};
