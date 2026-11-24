import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const authToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  const decodeToken = jwt.verify(
    token as string,
    config.jwtSecret,
  ) as JwtPayload;
  const userExists = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    decodeToken.email,
  ]);

  if (!token)
    res.status(401).json({
      success: false,
      message: "Unauthorized access!",
    });

  if (!userExists.rowCount)
    res.status(404).json({
      success: false,
      message: "User not found!",
    });

  if (!userExists.rows[0].is_active)
    res.status(403).json({
      success: false,
      message: "Forbidden access!",
    });

  req.user = decodeToken;

  next();
};

export default authToken;
