import { pool } from "../../db";
import type { IUser } from "./user.interface";

const create = async (payload: IUser) => {
  const { name, age, email, password } = payload;
  return await pool.query(
    `
      INSERT INTO users (
        name,
        age,
        email,
        password
      ) VALUES ($1, $2, $3, $4) RETURNING *
    `,
    [name, age, email, password],
  );
};

const findAll = async () => await pool.query(`SELECT * FROM users`);

const findById = async (id: string) =>
  await pool.query(`SELECT * FROM users WHERE id=$1`, [id]);

const update = async (id: string, payload: IUser) => {
  const { name, age, password, is_active } = payload;
  return await pool.query(
    `
      UPDATE users SET
      name = COALESCE($1, name),
      age = COALESCE($2, age),
      password = COALESCE($3, password),
      is_active = COALESCE($4, is_active),
      updated_at = NOW()
      WHERE id=$5 RETURNING *
    `,
    [name ?? null, age ?? null, password ?? null, is_active ?? null, id],
  );
};

const deleteById = async (id: string) =>
  await pool.query(`DELETE FROM users WHERE id=$1`, [id]);

export const userRepository = {
  create,
  findAll,
  findById,
  update,
  deleteById,
};
