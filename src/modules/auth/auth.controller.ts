import type { Request, Response } from "express";
import { DatabaseError } from "pg";
import { authService } from "./auth.service";

const logInUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.logInUser(req.body);
    const { refreshToken } = result;

    res.cookie("refreshToken", refreshToken, {
      secure: false,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      domain: "localhost",
    });

    res.status(201).json({
      success: true,
      message: "User logged in successfully!",
      data: result,
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

const getAuths = async (req: Request, res: Response) => {};

const getAuthById = async (req: Request, res: Response) => {};

const updateAuth = async (req: Request, res: Response) => {};

const deleteAuth = async (req: Request, res: Response) => {};

export const authController = {
  logInUser,
  getAuths,
  getAuthById,
  updateAuth,
  deleteAuth,
};
