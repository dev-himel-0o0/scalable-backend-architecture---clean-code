import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { TRole } from "../types";
import { AppError } from "../utils/app-error";

const authToken =
  (...roles: TRole[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    if (!token)
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized access!");

    const decodeToken = jwt.verify(token, config.jwtSecret) as JwtPayload;

    const userExists = await pool.query(
      `SELECT * FROM users WHERE email=$1`,
      [decodeToken.email],
    );
    const user = userExists.rows[0];

    if (!user)
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized access!");
    if (!user.is_active)
      throw new AppError(
        403,
        "USER_INACTIVE",
        "This user account is inactive.",
      );
    if (roles.length && !roles.includes(user.role))
      throw new AppError(403, "FORBIDDEN", "Forbidden access!");

    req.user = decodeToken;
    next();
  };

export default authToken;
