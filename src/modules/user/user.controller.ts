import type { Request, Response } from "express";
import customResponse from "../../utils/custom-response";
import { userService } from "./user.service";

const createUser = async (req: Request, res: Response) => {
  const result = await userService.createUser(req.body);

  return customResponse(res, {
    statusCode: 201,
    message: "User created successfully!",
    data: result.rows[0],
  });
};

const getUsers = async (req: Request, res: Response) => {
  const result = await userService.getUsers();

  if (!result.rowCount) {
    return customResponse(res, {
      statusCode: 404,
      message: "Users list is empty!",
      data: result.rows,
    });
  }

  return customResponse(res, {
    statusCode: 200,
    message: "Users fetched successfully!",
    data: result.rows,
  });
};

const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.getUserById(id as string);

  return customResponse(res, {
    statusCode: 200,
    message: "User fetched successfully!",
    data: result.rows[0],
  });
};

const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.updateUser(id as string, req.body);

  return customResponse(res, {
    statusCode: 200,
    message: "User updated successfully!",
    data: result.rows[0],
  });
};

const deleteUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userService.deleteUserById(id as string);

  if (!result.rowCount) {
    return customResponse(res, {
      statusCode: 404,
      message: "User not found!",
    });
  }

  return customResponse(res, {
    statusCode: 200,
    message: "User deleted successfully!",
  });
};

export const userController = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUserById,
};
