import type { Request, Response } from "express";
import customResponse from "../../utils/custom-response";
import { authService } from "./auth.service";

const logInUser = async (req: Request, res: Response) => {
  const result = await authService.logInUser(req.body);
  const { refreshToken } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    domain: "localhost",
  });

  return customResponse(res, {
    statusCode: 200,
    message: "User logged in successfully!",
    data: result,
  });
};

const generateToken = async (req: Request, res: Response) => {
  const result = await authService.generateAccessToken(
    req.cookies.refreshToken,
  );

  return customResponse(res, {
    statusCode: 200,
    message: "Access token generated successfully!",
    data: result,
  });
};

const getAuths = async (req: Request, res: Response) => {};

const getAuthById = async (req: Request, res: Response) => {};

const updateAuth = async (req: Request, res: Response) => {};

const deleteAuth = async (req: Request, res: Response) => {};

export const authController = {
  logInUser,
  generateToken,
  getAuths,
  getAuthById,
  updateAuth,
  deleteAuth,
};
