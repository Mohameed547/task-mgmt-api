# Task Management Application - Backend API

Production-ready TypeScript Express backend foundation for the Task Management Application with Mongoose & MongoDB database configuration, User data model, User Registration, and User Login with JWT Authentication.

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript (Strict Mode)
- **Database**: MongoDB / Mongoose
- **Authentication Security**: bcryptjs & JSON Web Tokens (JWT)
- **Testing**: Jest & Supertest
- **Logging**: Morgan

## Project Architecture

```text
task-mgmt-api/
├── src/
│   ├── config/          # Application, MongoDB database, & JWT environment configuration
│   ├── controllers/     # Thin route handlers (auth.controller, health.controller)
│   ├── middleware/      # Error handling, request logger, 404, & validateBody middleware
│   ├── models/          # Mongoose database models (User model)
│   ├── routes/          # Express route definitions & modular routing (auth.routes, health.routes)
│   ├── schemas/         # Validation schemas (auth.schema: register & login validation)
│   ├── services/        # Reusable business logic layer (auth.service)
│   ├── types/           # Custom TypeScript interfaces & type aliases (IUser, JwtPayload, ApiResponse)
│   ├── utils/           # Utility functions (ApiError, ApiResponse, asyncHandler, jwt, logger)
│   ├── app.ts           # Express application configuration & middleware stack
│   └── server.ts        # Application entry point & graceful shutdown handling
├── tests/               # Unit and integration test suites (database, User model, JWT, auth & health APIs)
├── .env.example         # Example environment variables template
├── .gitignore           # Git ignore configuration
├── jest.config.ts       # Jest testing configuration
├── package.json         # Dependencies & npm scripts
└── tsconfig.json        # TypeScript compiler options (strict mode)
```

## Environment Variables

| Variable | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | `Number` | `5000` | HTTP Server Port |
| `NODE_ENV` | `String` | `development` | Runtime environment (`development`, `production`, `test`) |
| `MONGODB_URI` | `String` | `mongodb://localhost:27017/task_management_db` | MongoDB database connection URI |
| `CORS_ORIGIN` | `String` | `http://localhost:3000` | Allowed CORS origins |
| `JWT_SECRET` | `String` | `default_jwt_secret_key_...` | Secret key used to sign & verify JWT tokens |
| `JWT_EXPIRES_IN` | `String` | `1d` | Token expiration duration (e.g. `1d`, `7d`, `1h`) |

---

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

### 2. User Registration Endpoint

- **Endpoint**: `POST /api/auth/register`
- **Description**: Registers a new user account with validated input and bcrypt password hashing.

### 3. User Login Endpoint

- **Endpoint**: `POST /api/auth/login`
- **Description**: Authenticates user credentials with `bcrypt.compare` and returns a signed JWT token.
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Login successful",
    "data": {
      "user": {
        "_id": "607f1f77bcf86cd799439011",
        "name": "John Doe",
        "email": "john@example.com",
        "createdAt": "2026-08-24T00:00:00.000Z",
        "updatedAt": "2026-08-24T00:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error Responses**:
  - **400 Bad Request** (Invalid input format or missing email/password):
    ```json
    {
      "status": "fail",
      "statusCode": 400,
      "message": "Validation Error",
      "errors": ["Please provide a valid email address"]
    }
    ```
  - **401 Unauthorized** (Invalid email or incorrect password):
    ```json
    {
      "status": "fail",
      "statusCode": 401,
      "message": "Invalid email or password"
    }
    ```

---

## Available Scripts

- `npm run dev`: Starts development server with hot-reloading (`tsx`).
- `npm run build`: Compiles TypeScript to `dist/`.
- `npm run start`: Runs production build.
- `npm test`: Runs complete Jest test suite.
- `npm run type-check`: Verifies TypeScript strict typing.
