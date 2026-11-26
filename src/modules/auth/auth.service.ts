import bcrypt from "bcrypt";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";
import { pool } from "../../db";
import { AppError } from "../../utils/app-error";
import type { IAuth, IJwtPayload } from "./auth.interface";
import { authRepository } from "./auth.repository";

const logInUser = async (payload: IAuth) => {
  const { email, password } = payload;
  const result = await authRepository.findByEmail(email);
  const user = result.rows[0];

  if (!user) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid credentials!");
  }

  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid credentials!");
  }
  if (!user.is_active) {
    throw new AppError(
      403,
      "USER_INACTIVE",
      "This user account is inactive.",
    );
  }

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

  const { password: _password, ...publicUser } = user;

  return { accessToken, refreshToken, user: publicUser };
};

const generateAccessToken = async (token: string) => {
  if (!token) {
    throw new AppError(401, "UNAUTHORIZED", "Unauthorized access!");
  }

  const decodeToken = jwt.verify(
    token,
    config.refreshTokenSecret,
  ) as JwtPayload;

  const userExists = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    decodeToken.email,
  ]);
  const user = userExists.rows[0];

  if (!user) {
    throw new AppError(401, "UNAUTHORIZED", "Unauthorized access!");
  }
  if (!user.is_active) {
    throw new AppError(
      403,
      "USER_INACTIVE",
      "This user account is inactive.",
    );
  }

  const jwtPayload: IJwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
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
