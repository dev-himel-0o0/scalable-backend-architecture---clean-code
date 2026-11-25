import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { TRole } from "../types";

const authToken =
  (...roles: TRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      const decodeToken = jwt.verify(
        token as string,
        config.jwtSecret,
      ) as JwtPayload;
      const userExists = await pool.query(
        `SELECT * FROM users WHERE email=$1`,
        [decodeToken.email],
      );

      if (!token)
        return res.status(401).json({
          success: false,
          message: "Unauthorized access!",
        });

      if (!userExists.rowCount)
        return res.status(404).json({
          success: false,
          message: "User not found!",
        });

      if (!userExists.rows[0].is_active)
        return res.status(403).json({
          success: false,
          message: "Forbidden access!",
        });

      if (roles.length && !roles.includes(userExists.rows[0].role))
        return res.status(401).json({
          success: false,
          message: "Unauthorized access!",
        });

      req.user = decodeToken;

      next();
    } catch (error) {
      next(error);
    }
  };

export default authToken;
