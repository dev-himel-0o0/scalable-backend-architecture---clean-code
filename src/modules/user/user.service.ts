import bcrypt from "bcrypt";
import type { IUser } from "./user.interface";
import { userRepository } from "./user.repository";

const createUser = async (payload: IUser) => {
  const { password } = payload;
  const hashedPassword = await bcrypt.hash(password, 10);
  return await userRepository.create({ ...payload, password: hashedPassword });
};

const getUsers = async () => await userRepository.findAll();

const getUserById = async (id: string) => await userRepository.findById(id);

const updateUser = async (id: string, payload: IUser) =>
  await userRepository.update(id, payload);

const deleteUserById = async (id: string) =>
  await userRepository.deleteById(id);

export const userService = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUserById,
};
