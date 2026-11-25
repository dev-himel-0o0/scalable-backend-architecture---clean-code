import type { NextFunction, Request, Response } from "express";

const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const error = err instanceof Error ? err : new Error(String(err));

  console.error(error.stack);

  res.status(500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
};

export default globalErrorHandler;
