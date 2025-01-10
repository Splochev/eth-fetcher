import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByUsername } from "../models/userModel";
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET: string = process.env.JWT_SECRET || (() => {
  throw new Error("JWT_SECRET is not defined in the environment variables");
})();

export const authenticate = async (username: string, password: string) => {
  const user = await findUserByUsername(username);
  if (!user) throw new Error("Invalid credentials");

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) throw new Error("Invalid credentials");

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });
  return { token };
};
