import type { RequestHandler } from 'express';

export const asyncCatch = (requestHandler: RequestHandler): RequestHandler => {
  return (request, response, next) => {
    Promise.resolve(requestHandler(request, response, next)).catch(next);
  };
};
