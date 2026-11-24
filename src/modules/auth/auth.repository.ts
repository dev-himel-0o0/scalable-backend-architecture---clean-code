import { pool } from "../../db";
import type { IAuth } from "./auth.interface";

const findByEmail = async (email: string) =>
  await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);

const findAll = async () => {};

const findById = async (id: string) => {};

const update = async (id: string, payload: IAuth) => {};

const deleteById = async (id: string) => {};

export const authRepository = {
  findByEmail,
  findAll,
  findById,
  update,
  deleteById,
};
