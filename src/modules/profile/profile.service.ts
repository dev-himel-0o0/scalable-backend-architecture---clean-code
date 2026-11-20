import { pool } from "../../db";

const createProfile = async (payload: any) => {
  const { user_id, bio, address, phone, gender } = payload;
  const user = await pool.query(`SELECT * FROM users WHERE id=$1`, [user_id]);

  if (!user.rowCount) null;

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

export const profileService = { createProfile };
