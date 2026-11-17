import { NextResponse } from 'next/server';

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

export function getCorsHeaders(req) {
  const origin = req ? req.headers.get('origin') : null;
  // If request origin matches allowed origin or in dev, reflect origin
  const allowed = (origin && (origin === allowedOrigin || origin.startsWith('http://localhost:')))
    ? origin
    : allowedOrigin;

  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  };
}

export function handleOptions(req) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

export function apiSuccess(data, status = 200, headers = {}) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    {
      status,
      headers: {
        ...getCorsHeaders(),
        ...headers,
      },
    }
  );
}

export function apiError(message = 'Something went wrong', status = 500, errors = null, headers = {}) {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(errors ? { errors } : {}),
    },
    {
      status,
      headers: {
        ...getCorsHeaders(),
        ...headers,
      },
    }
  );
}
