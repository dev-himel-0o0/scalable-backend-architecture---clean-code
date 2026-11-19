import type { Request, Response } from "express";
import { DatabaseError } from "pg";
import { userService } from "./user.service";

const createUser = async (req: Request, res: Response) => {
  try {
    const result = await userService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully!",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message:
        error instanceof DatabaseError
          ? error.message
          : "Internal Server Error!",
      error: error,
    });
  }
};

const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await userService.getUsers();

    if (!result.rowCount) {
      res.status(404).json({
        success: false,
        message: "Users list is empty!",
        data: result.rows,
      });
    }

    res.status(200).json({
      success: true,
      message: "Users fetched successfully!",
      data: result.rows,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message:
        error instanceof DatabaseError
          ? error.message
          : "Internal Server Error!",
      error: error,
    });
  }
};

const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await userService.getUserById(id as string);

    res.status(200).json({
      success: true,
      message: "User fetched successfully!",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message:
        error instanceof DatabaseError
          ? error.message
          : "Internal Server Error!",
      error: error,
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await userService.updateUser(id as string, req.body);

    res.status(201).json({
      success: true,
      message: "User updated successfully!",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message:
        error instanceof DatabaseError
          ? error.message
          : "Internal Server Error!",
      error: error,
    });
  }
};

const deleteUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await userService.deleteUserById(id as string);

    if (!result.rowCount) {
      res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully!",
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message:
        error instanceof DatabaseError
          ? error.message
          : "Internal Server Error!",
      error: error,
    });
  }
};

export const userController = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUserById,
};
