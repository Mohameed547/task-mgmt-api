# Task Management Application - Backend API

Production-ready TypeScript Express backend foundation for the Task Management Application with MongoDB/Mongoose integration.

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript (Strict Mode)
- **Database**: MongoDB / Mongoose
- **Testing**: Jest & Supertest
- **Logging**: Morgan

## Project Architecture

```text
backend/
├── src/
│   ├── config/          # Application & Database environment configurations
│   ├── controllers/     # Route handlers & controller logic
│   ├── middleware/      # Centralized error handling, request logging, & route protection
│   ├── models/          # Mongoose database models & schemas
│   ├── routes/          # Express route definitions & modular routing
│   ├── schemas/         # Validation schemas (e.g. Zod / Joi / custom)
│   ├── services/        # Reusable business logic layer
│   ├── types/           # Custom TypeScript interfaces & type aliases
│   ├── utils/           # Utility functions (ApiError, ApiResponse, asyncHandler, logger)
│   ├── app.ts           # Express application configuration & middleware stack
│   └── server.ts        # Application entry point & graceful shutdown handling
├── tests/               # Unit and integration test suites
├── .env.example         # Example environment variables template
├── .gitignore           # Git ignore configuration
├── jest.config.ts       # Jest testing configuration
├── package.json         # Dependencies & npm scripts
└── tsconfig.json        # TypeScript compiler options (strict mode)
```

## Setup & Installation

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Adjust environment variables as needed:
   - `PORT`: Server port (default `5000`)
   - `NODE_ENV`: Environment mode (`development` | `production` | `test`)
   - `MONGODB_URI`: MongoDB connection string
   - `CORS_ORIGIN`: Allowed frontend origin (default `http://localhost:3000`)

## Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `dev` | `npm run dev` | Starts server in watch mode using `tsx` for fast development reload |
| `build` | `npm run build` | Cleans `dist/` directory and compiles TypeScript to JavaScript |
| `start` | `npm run start` | Runs the compiled JavaScript application from `dist/server.js` |
| `type-check` | `npm run type-check` | Runs TypeScript compiler check without emitting files |
| `test` | `npm run test` | Runs the Jest test suite |
| `test:watch` | `npm run test:watch` | Runs Jest in watch mode |

## API Documentation

### Health Check Endpoint

- **Endpoint**: `GET /api/health`
- **Description**: Returns current server status, uptime, and timestamp.
- **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Server is healthy",
    "data": {
      "uptime": 12.345,
      "timestamp": "2026-08-23T19:35:00.000Z",
      "environment": "development"
    }
  }
  ```

## Error Handling Architecture

Centralized error handling is implemented using a custom `ApiError` class extending `Error`. All asynchronous route controllers are wrapped with `asyncHandler` to pass unexpected errors to the global `errorHandler` middleware.

Example JSON error response:
```json
{
  "status": "fail",
  "statusCode": 400,
  "message": "Bad request test error",
  "errors": ["Invalid parameter"]
}
```
