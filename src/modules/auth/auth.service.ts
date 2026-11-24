import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../../config";
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
    expiresIn: "1d",
  });

  return { accessToken, user };
};

const getAuths = async () => {};

const getAuthById = async (id: string) => {};

const updateAuth = async (id: string, payload: IAuth) => {};

const deleteAuth = async (id: string) => {};

export const authService = {
  logInUser,
  getAuths,
  getAuthById,
  updateAuth,
  deleteAuth,
};
