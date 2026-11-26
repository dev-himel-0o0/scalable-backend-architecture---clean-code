import type { Request, Response } from "express";
import { AppError } from "../../utils/app-error";
import customResponse from "../../utils/custom-response";
import { profileService } from "./profile.service";

const createProfile = async (req: Request, res: Response) => {
  const result = await profileService.createProfile(req.body);

  if (!result) {
    throw new AppError(404, "USER_NOT_FOUND", "User not exists!");
  }

  return customResponse(res, {
    statusCode: 201,
    message: "Profile created successfully!",
    data: result.rows[0],
  });
};

export const profileController = { createProfile };
