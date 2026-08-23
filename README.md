# Task Management Application - Backend API

Production-ready TypeScript Express backend foundation for the Task Management Application with Mongoose & MongoDB database configuration, User data model, and User Registration API.

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript (Strict Mode)
- **Database**: MongoDB / Mongoose
- **Authentication Security**: bcryptjs (Password Hashing)
- **Testing**: Jest & Supertest
- **Logging**: Morgan

## Project Architecture

```text
task-mgmt-api/
├── src/
│   ├── config/          # Application & MongoDB database configuration
│   ├── controllers/     # Route handlers (auth.controller, health.controller)
│   ├── middleware/      # Centralized error handling, request logger, 404 & validator middleware
│   ├── models/          # Mongoose database models & schemas (User model)
│   ├── routes/          # Express route definitions & modular routing (auth.routes, health.routes)
│   ├── schemas/         # Validation schemas (auth.schema)
│   ├── services/        # Business logic layer (auth.service)
│   ├── types/           # Custom TypeScript interfaces & type aliases (IUser, ApiResponse)
│   ├── utils/           # Utility functions (ApiError, ApiResponse, asyncHandler, logger)
│   ├── app.ts           # Express application configuration & middleware stack
│   └── server.ts        # Application entry point & graceful shutdown handling
├── tests/               # Unit and integration test suites (database, User model, auth & health APIs)
├── .env.example         # Example environment variables template
├── .gitignore           # Git ignore configuration
├── jest.config.ts       # Jest testing configuration
├── package.json         # Dependencies & npm scripts
└── tsconfig.json        # TypeScript compiler options (strict mode)
```

## Data Models

### User Model (`User`)

| Field | Type | Modifiers / Rules | Description |
| :--- | :--- | :--- | :--- |
| `name` | `String` | `required`, `trim`, `minlength: 2`, `maxlength: 50` | Full name of the user |
| `email` | `String` | `required`, `unique`, `lowercase`, `trim`, `index` | Normalized unique email address |
| `password` | `String` | `required`, `select: false` | Hashed password string (hidden by default) |
| `createdAt` | `Date` | Auto-generated via `timestamps: true` | Record creation timestamp |
| `updatedAt` | `Date` | Auto-generated via `timestamps: true` | Record update timestamp |

---

## API Documentation

### 1. Health Check Endpoint

- **Endpoint**: `GET /api/health`
- **Description**: Returns current server status, uptime, environment, and MongoDB database connection state.
- **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Server is healthy",
    "data": {
      "uptime": 12.345,
      "timestamp": "2026-08-24T00:00:00.000Z",
      "environment": "development",
      "database": "connected"
    }
  }
  ```

### 2. User Registration Endpoint

- **Endpoint**: `POST /api/auth/register`
- **Description**: Registers a new user account with validated input and bcrypt password hashing.
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "message": "User registered successfully",
    "data": {
      "_id": "607f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2026-08-24T00:00:00.000Z",
      "updatedAt": "2026-08-24T00:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - **400 Bad Request** (Invalid input format or missing fields):
    ```json
    {
      "status": "fail",
      "statusCode": 400,
      "message": "Validation Error",
      "errors": ["Password must be at least 6 characters long"]
    }
    ```
  - **409 Conflict** (Email already exists):
    ```json
    {
      "status": "fail",
      "statusCode": 409,
      "message": "User with this email already exists"
    }
    ```

---

## MongoDB Setup Instructions

1. **Configure Connection String**:
   Create `.env` from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Set `MONGODB_URI` to your database URI.

2. **Available Scripts**:
   - `npm run dev`: Starts development server with hot-reloading (`tsx`).
   - `npm run build`: Compiles TypeScript to `dist/`.
   - `npm run start`: Runs production build.
   - `npm test`: Runs complete Jest test suite.
   - `npm run type-check`: Verifies TypeScript strict typing.
