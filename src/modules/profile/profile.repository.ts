import { pool } from "../../db";
import type { IProfile } from "./profile.interface";

const userExists = async (userId: number) => {
  const result = await pool.query(`SELECT 1 FROM users WHERE id=$1`, [userId]);
  return (result.rowCount ?? 0) > 0;
};

const create = async (payload: IProfile) => {
  const { user_id, bio, address, phone, gender } = payload;
  return await pool.query(
    `
      INSERT INTO profile (
        user_id,
        bio,
        address,
        phone,
        gender
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *
    `,
    [user_id, bio, address, phone, gender],
  );
};

export const profileRepository = {
  userExists,
  create,
};
