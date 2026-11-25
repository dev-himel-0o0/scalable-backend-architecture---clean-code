import type { Response } from "express";

type TCustomResponse<T> = {
  statusCode: number;
  message: string;
  success: boolean;
  data?: T;
  error?: unknown;
};

const customResponse = <T>(res: Response, data: TCustomResponse<T>) => {
  return res.status(data.statusCode).json({
    message: data.message,
    success: data.success,
    data: data.data,
    error: data.error,
  });
};

export default customResponse;
