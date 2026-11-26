import type { ErrorRequestHandler } from "express";
import { DatabaseError } from "pg";
import { AppError } from "../utils/app-error";

type TErrorResponse = {
  statusCode: number;
  code: string;
  message: string;
};

const unavailableDatabaseCodes = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "EHOSTUNREACH",
  "ENOTFOUND",
  "ETIMEDOUT",
]);

const isErrorWithCode = (
  error: unknown,
): error is Error & { code: string } =>
  error instanceof Error &&
  "code" in error &&
  typeof error.code === "string";

const isMalformedJson = (error: unknown) =>
  error instanceof SyntaxError &&
  "type" in error &&
  error.type === "entity.parse.failed";

const getDatabaseErrorResponse = (error: DatabaseError): TErrorResponse => {
  if (error.code === "23505") {
    return {
      statusCode: 409,
      code: "RESOURCE_CONFLICT",
      message: "A record with the provided unique value already exists.",
    };
  }

  if (error.code === "23503") {
    return {
      statusCode: 409,
      code: "RESOURCE_CONFLICT",
      message: "The request conflicts with related data.",
    };
  }

  if (
    error.code?.startsWith("08") ||
    ["57P01", "57P02", "57P03"].includes(error.code ?? "")
  ) {
    return {
      statusCode: 503,
      code: "DATABASE_UNAVAILABLE",
      message: "The database is temporarily unavailable.",
    };
  }

  if (
    error.code?.startsWith("22") ||
    error.code === "23502" ||
    error.code === "23514"
  ) {
    return {
      statusCode: 400,
      code: "INVALID_REQUEST",
      message: "The request contains invalid data.",
    };
  }

  if (error.code?.startsWith("23")) {
    return {
      statusCode: 409,
      code: "RESOURCE_CONFLICT",
      message: "The request conflicts with existing data.",
    };
  }

  return {
    statusCode: 500,
    code: "DATABASE_ERROR",
    message: "A database error occurred.",
  };
};

const getErrorResponse = (error: unknown): TErrorResponse => {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
    };
  }

  if (error instanceof DatabaseError) {
    return getDatabaseErrorResponse(error);
  }

  if (
    error instanceof Error &&
    ["JsonWebTokenError", "NotBeforeError", "TokenExpiredError"].includes(
      error.name,
    )
  ) {
    return {
      statusCode: 401,
      code: "UNAUTHORIZED",
      message: "The authentication token is invalid or expired.",
    };
  }

  if (isMalformedJson(error)) {
    return {
      statusCode: 400,
      code: "INVALID_JSON",
      message: "The request body contains invalid JSON.",
    };
  }

  if (isErrorWithCode(error) && unavailableDatabaseCodes.has(error.code)) {
    return {
      statusCode: 503,
      code: "DATABASE_UNAVAILABLE",
      message: "The database is temporarily unavailable.",
    };
  }

  return {
    statusCode: 500,
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred.",
  };
};

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const errorResponse = getErrorResponse(err);
  const isDatabaseFailure =
    err instanceof DatabaseError ||
    (isErrorWithCode(err) && unavailableDatabaseCodes.has(err.code));

  if (errorResponse.statusCode >= 500 || isDatabaseFailure) {
    console.error("API request failed", {
      method: req.method,
      path: req.originalUrl,
      error: err,
    });
  }

  res.status(errorResponse.statusCode).json({
    success: false,
    message: errorResponse.message,
    error: { code: errorResponse.code },
  });
};

export default globalErrorHandler;
