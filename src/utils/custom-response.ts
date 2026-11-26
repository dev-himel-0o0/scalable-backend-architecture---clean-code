import type { Response } from "express";

type TCustomResponse<T> = {
  statusCode: number;
  message: string;
  data?: T | undefined;
};

const customResponse = <T>(res: Response, data: TCustomResponse<T>) => {
  return res.status(data.statusCode).json({
    success: true,
    message: data.message,
    ...(data.data === undefined ? {} : { data: data.data }),
  });
};

export default customResponse;
