import { Context, Next } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';

import { AreaServiceResponse } from '../services/areaService';

export interface ErrorResponse {
  error: string;
  message?: string;
  timestamp: string;
  path: string;
}

// Global error handler middleware
export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error('Unhandled error:', error);

    const errorResponse: ErrorResponse = {
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString(),
      path: c.req.path,
    };

    return c.json(errorResponse, 500);
  }
};

// Service response handler middleware
export const handleServiceResponse = <T>(serviceResponse: AreaServiceResponse<T>) => {
  return (c: Context) => {
    if (
      serviceResponse.success &&
      serviceResponse.data !== null &&
      serviceResponse.data !== undefined
    ) {
      return c.json(serviceResponse.data, serviceResponse.status as ContentfulStatusCode);
    } else {
      const errorResponse: ErrorResponse = {
        error: serviceResponse.error || 'Unknown error',
        timestamp: new Date().toISOString(),
        path: c.req.path,
      };

      return c.json(errorResponse, serviceResponse.status as ContentfulStatusCode);
    }
  };
};

// Validation middleware for required parameters
export const validateParam = (paramName: string) => {
  return async (c: Context, next: Next) => {
    const param = c.req.param(paramName);

    if (!param) {
      const errorResponse: ErrorResponse = {
        error: 'Validation Error',
        message: `Parameter '${paramName}' is required`,
        timestamp: new Date().toISOString(),
        path: c.req.path,
      };

      return c.json(errorResponse, 400);
    }

    await next();
  };
};

// Validation middleware for required query parameters
export const validateQuery = (queryName: string, required: boolean = true) => {
  return async (c: Context, next: Next) => {
    const queryValue = c.req.query(queryName);

    if (required && !queryValue) {
      const errorResponse: ErrorResponse = {
        error: 'Validation Error',
        message: `Query parameter '${queryName}' is required`,
        timestamp: new Date().toISOString(),
        path: c.req.path,
      };

      return c.json(errorResponse, 400);
    }

    await next();
  };
};

// Request logging middleware
export const requestLogger = async (c: Context, next: Next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const query = c.req.query();

  console.log(
    `[${new Date().toISOString()}] ${method} ${path}`,
    Object.keys(query).length > 0 ? query : ''
  );

  await next();

  const duration = Date.now() - start;
  console.log(`[${new Date().toISOString()}] ${method} ${path} - ${c.res.status} (${duration}ms)`);
};

// Rate limiting middleware (simple in-memory version)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (maxRequests: number = 100, windowMs: number = 60000) => {
  return async (c: Context, next: Next) => {
    const clientIP = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;

    const key = `${clientIP}:${windowStart}`;
    const current = requestCounts.get(key) || { count: 0, resetTime: windowStart + windowMs };

    if (now > current.resetTime) {
      // Reset window
      current.count = 0;
      current.resetTime = windowStart + windowMs;
    }

    current.count++;
    requestCounts.set(key, current);

    // Clean old entries
    for (const [k, v] of requestCounts.entries()) {
      if (now > v.resetTime) {
        requestCounts.delete(k);
      }
    }

    if (current.count > maxRequests) {
      const errorResponse: ErrorResponse = {
        error: 'Rate Limit Exceeded',
        message: `Too many requests. Limit: ${maxRequests} per ${windowMs / 1000}s`,
        timestamp: new Date().toISOString(),
        path: c.req.path,
      };

      return c.json(errorResponse, 429);
    }

    c.res.headers.set('X-RateLimit-Limit', maxRequests.toString());
    c.res.headers.set('X-RateLimit-Remaining', (maxRequests - current.count).toString());
    c.res.headers.set('X-RateLimit-Reset', current.resetTime.toString());

    await next();
  };
};
