import type { ErrorRequestHandler } from 'express';
import { Prisma } from '../../generated/prisma/client.js';
import { ApiError } from '../utils/api-error.js';

type DatabaseError = {
  code?: unknown;
};

const isProduction = process.env.NODE_ENV === 'production';

const isDatabaseError = (error: unknown): error is DatabaseError => {
  return typeof error === 'object' && error !== null && 'code' in error;
};

const getDevelopmentDetails = (error: unknown): { stack?: string } => {
  if (!isProduction && error instanceof Error && error.stack) {
    return { stack: error.stack };
  }

  return {};
};

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _request,
  response,
  next,
) => {
  void next;

  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
      data: error.data,
      errors: error.errors,
      ...getDevelopmentDetails(error),
    });
    return;
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    response.status(409).json({
      success: false,
      message: 'A record with the same unique value already exists.',
      data: null,
      errors: [],
    });
    return;
  }

  if (isDatabaseError(error) && error.code === '23505') {
    response.status(409).json({
      success: false,
      message: 'A record with the same unique value already exists.',
      data: null,
      errors: [],
    });
    return;
  }

  console.error(error);
  const message =
    !isProduction && error instanceof Error
      ? error.message
      : 'Internal server error.';

  response.status(500).json({
    success: false,
    message,
    data: null,
    errors: [],
    ...getDevelopmentDetails(error),
  });
};
