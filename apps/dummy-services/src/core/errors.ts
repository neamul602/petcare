/** One error shape for all five Dummy APIs: { error: { code, message, details? } }. */
import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

export function errorBody(code: string, message: string, details?: unknown) {
  return { error: { code, message, ...(details === undefined ? {} : { details }) } };
}

export function registerErrorHandling(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ApiError) {
      return reply.code(error.status).send(errorBody(error.code, error.message, error.details));
    }
    if (error instanceof ZodError) {
      return reply
        .code(400)
        .send(errorBody('invalid_request', 'The request is not valid', error.issues));
    }
    const failure = error as { code?: string; statusCode?: number; message?: string };
    if (failure.code === 'FST_REQ_FILE_TOO_LARGE') {
      return reply.code(413).send(errorBody('photo_too_large', 'Photos can be at most 5 MB'));
    }
    const status = failure.statusCode;
    if (status && status >= 400 && status < 500) {
      return reply.code(status).send(errorBody('bad_request', failure.message ?? 'Bad request'));
    }
    app.log.error(error);
    return reply
      .code(500)
      .send(errorBody('internal_error', 'The training service failed unexpectedly'));
  });

  app.setNotFoundHandler((request, reply) =>
    reply
      .code(404)
      .send(errorBody('not_found', `No training endpoint for ${request.method} ${request.url}`)),
  );
}
