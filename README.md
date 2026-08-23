# Task Management Application - Backend API

Production-ready TypeScript Express backend foundation for the Task Management Application with Mongoose & MongoDB database configuration, User data model, Task data model, User Registration, User Login with JWT Authentication, and Authentication Middleware.

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
│   ├── middleware/      # Error handling, request logger, 404, validateBody, & authenticate middleware
│   ├── models/          # Mongoose database models (User model & Task model)
│   ├── routes/          # Express route definitions & modular routing (auth.routes, health.routes)
│   ├── schemas/         # Validation schemas (auth.schema: register & login validation)
│   ├── services/        # Reusable business logic layer (auth.service)
│   ├── types/           # Custom TypeScript interfaces & type aliases (IUser, ITask, JwtPayload, AuthenticatedRequest)
│   ├── utils/           # Utility functions (ApiError, ApiResponse, asyncHandler, jwt, logger)
│   ├── app.ts           # Express application configuration & middleware stack
│   └── server.ts        # Application entry point & graceful shutdown handling
├── tests/               # Unit and integration test suites (database, User & Task models, JWT, middleware & auth APIs)
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

### 1. User Model (`User`)

| Field | Type | Modifiers / Rules | Description |
| :--- | :--- | :--- | :--- |
| `name` | `String` | `required`, `trim`, `minlength: 2`, `maxlength: 50` | Full name of the user |
| `email` | `String` | `required`, `unique`, `lowercase`, `trim`, `index` | Normalized unique email address |
| `password` | `String` | `required`, `select: false` | Hashed password string (hidden by default) |
| `createdAt` | `Date` | Auto-generated via `timestamps: true` | Record creation timestamp |
| `updatedAt` | `Date` | Auto-generated via `timestamps: true` | Record update timestamp |

### 2. Task Model (`Task`)

| Field | Type | Modifiers / Rules | Description |
| :--- | :--- | :--- | :--- |
| `title` | `String` | `required`, `trim`, `maxlength: 100`, `index` | Task title |
| `description` | `String` | `trim`, `maxlength: 1000` | Detailed task description |
| `status` | `Enum` | `TODO`, `IN_PROGRESS`, `DONE` (Default: `TODO`, `index`) | Current task status |
| `priority` | `Enum` | `LOW`, `MEDIUM`, `HIGH` (Default: `MEDIUM`, `index`) | Task priority level |
| `dueDate` | `Date` | Optional completion target date | Task deadline |
| `user` | `ObjectId` | `required`, `ref: 'User'`, `index` | User reference ownership |
| `createdAt` | `Date` | Auto-generated via `timestamps: true` | Record creation timestamp |
| `updatedAt` | `Date` | Auto-generated via `timestamps: true` | Record update timestamp |

**Task Performance Indexes**:
- Single field indexes: `user`, `title`, `status`, `priority`.
- Compound indexes: `{ user: 1, status: 1 }`, `{ user: 1, priority: 1 }`, `{ user: 1, title: 1 }`.

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

### 4. Authenticated User Profile Endpoint (Protected)

- **Endpoint**: `GET /api/auth/me`
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Description**: Returns the authenticated user's profile information.

---

## Available Scripts

- `npm run dev`: Starts development server with hot-reloading (`tsx`).
- `npm run build`: Compiles TypeScript to `dist/`.
- `npm run start`: Runs production build.
- `npm test`: Runs complete Jest test suite.
- `npm run type-check`: Verifies TypeScript strict typing.
