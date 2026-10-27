import { ZodError } from 'zod';
import { ERROR_CODES } from '../constants/gameRules.js';

export class AppError extends Error {
  constructor(message, statusCode = 500, code = ERROR_CODES.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let errorCode = err.code || ERROR_CODES.INTERNAL_SERVER_ERROR;
  let message = err.message || 'An unexpected internal error occurred.';

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = err.errors.map((e) => e.message).join('; ');
  }

  // Handle Mongoose CastError (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 404;
    errorCode = ERROR_CODES.CASE_NOT_FOUND;
    message = `Resource not found with identifier: ${err.value}`;
  }

  // Log error safely in server console (without leaking secrets)
  if (statusCode >= 500) {
    console.error(`[AI-MYSTERY-ROOM SERVER ERROR] ${errorCode}: ${err.message}`);
  }

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: message,
    },
  });
}
