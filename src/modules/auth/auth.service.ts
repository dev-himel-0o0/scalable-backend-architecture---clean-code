import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";
import { pool } from "../../db";
import type { IAuth, IJwtPayload } from "./auth.interface";
import { authRepository } from "./auth.repository";

const logInUser = async (payload: IAuth) => {
  const { email, password } = payload;
  const result = await authRepository.findByEmail(email);
  const user = result.rows[0];

  if (!user) throw new Error("Invalid credentials!");

  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) throw new Error("Invalid credentials!");
  if (!user.is_active) throw new Error("User deactivate!");

  const jwtPayload: IJwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwtSecret, {
    expiresIn: "300000",
  });

  const refreshToken = jwt.sign(jwtPayload, config.refreshTokenSecret, {
    expiresIn: "1d",
  });

  return { accessToken, refreshToken, user };
};

const generateAccessToken = async (token: string) => {
  const decodeToken = jwt.verify(
    token,
    config.refreshTokenSecret,
  ) as JwtPayload;

  const userExists = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    decodeToken.email,
  ]);

  if (!token) throw new Error("Unauthorized access!");
  if (!userExists.rowCount) throw new Error("User not found!");
  if (!userExists.rows[0].is_active) throw new Error("Forbidden access!");

  const jwtPayload: IJwtPayload = {
    id: userExists.rows[0].id,
    name: userExists.rows[0].name,
    email: userExists.rows[0].email,
    role: userExists.rows[0].role,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwtSecret, {
    expiresIn: "300000",
  });

  return { accessToken };
};

const getAuths = async () => {};

const getAuthById = async (id: string) => {};

const updateAuth = async (id: string, payload: IAuth) => {};

const deleteAuth = async (id: string) => {};

export const authService = {
  logInUser,
  generateAccessToken,
  getAuths,
  getAuthById,
  updateAuth,
  deleteAuth,
};
