import type { IUser } from "./user.interface";
import { userRepository } from "./user.repository";

const createUser = async (payload: IUser) => await userRepository.create(payload);

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
