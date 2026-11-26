import { pool } from "../../db";
import type { IUser } from "./user.interface";

const create = async (payload: IUser) => {
  const { name, age, email, password, role } = payload;
  const result = await pool.query(
    `
      INSERT INTO users (
        name,
        age,
        email,
        password,
        role
      ) VALUES ($1, $2, $3, $4, COALESCE($5, 'user'))
      RETURNING id, name, age, email, role, is_active, created_at, updated_at
    `,
    [name, age, email, password, role],
  );

  return result;
};

const findAll = async () =>
  await pool.query(
    `SELECT id, name, age, email, role, is_active, created_at, updated_at FROM users`,
  );

const findById = async (id: string) =>
  await pool.query(
    `SELECT id, name, age, email, role, is_active, created_at, updated_at FROM users WHERE id=$1`,
    [id],
  );

const update = async (id: string, payload: IUser) => {
  const { name, age, password, role, is_active } = payload;
  return await pool.query(
    `
      UPDATE users SET
      name = COALESCE($1, name),
      age = COALESCE($2, age),
      password = COALESCE($3, password),
      role = COALESCE($4, role),
      is_active = COALESCE($5, is_active),
      updated_at = NOW()
      WHERE id=$6
      RETURNING id, name, age, email, role, is_active, created_at, updated_at
    `,
    [
      name ?? null,
      age ?? null,
      password ?? null,
      role ?? null,
      is_active ?? null,
      id,
    ],
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
