# Task Management Application - Backend API

Production-ready TypeScript Express backend foundation for the Task Management Application with Mongoose & MongoDB database configuration, User data model, Task data model, User Registration, User Login with JWT Authentication, Authentication Middleware, and Task CRUD APIs.

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
│   ├── controllers/     # Thin route handlers (auth.controller, task.controller, health.controller)
│   ├── middleware/      # Error handling, request logger, 404, validateBody, & authenticate middleware
│   ├── models/          # Mongoose database models (User model & Task model)
│   ├── routes/          # Express route definitions & modular routing (auth.routes, task.routes, health.routes)
│   ├── schemas/         # Validation schemas (auth.schema & task.schema)
│   ├── services/        # Reusable business logic layer (auth.service & task.service)
│   ├── types/           # Custom TypeScript interfaces & type aliases (IUser, ITask, JwtPayload, AuthenticatedRequest)
│   ├── utils/           # Utility functions (ApiError, ApiResponse, asyncHandler, jwt, logger)
│   ├── app.ts           # Express application configuration & middleware stack
│   └── server.ts        # Application entry point & graceful shutdown handling
├── tests/               # Unit and integration test suites (database, User & Task models, JWT, middleware, Auth & Task APIs)
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

---

## API Documentation

### Auth Endpoints

- `POST /api/auth/register` - Registers a new user account.
- `POST /api/auth/login` - Authenticates user credentials and returns JWT token.
- `GET /api/auth/me` - Returns authenticated user profile. (Requires `Authorization: Bearer <TOKEN>`)

### Task Endpoints (All Protected - Require `Authorization: Bearer <TOKEN>`)

All task endpoints enforce strict multi-tenant isolation. Users can only create, view, update, and delete their own tasks.

#### 1. Create Task

- **Endpoint**: `POST /api/tasks`
- **Request Body**:
  ```json
  {
    "title": "Build Frontend UI",
    "description": "Implement React UI components",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2026-12-31T23:59:59.000Z"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "message": "Task created successfully",
    "data": {
      "_id": "607f1f77bcf86cd799439011",
      "title": "Build Frontend UI",
      "description": "Implement React UI components",
      "status": "TODO",
      "priority": "HIGH",
      "dueDate": "2026-12-31T23:59:59.000Z",
      "user": "507f1f77bcf86cd799439012",
      "createdAt": "2026-08-24T00:00:00.000Z",
      "updatedAt": "2026-08-24T00:00:00.000Z"
    }
  }
  ```

#### 2. List Authenticated User's Tasks

- **Endpoint**: `GET /api/tasks`
- **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Tasks retrieved successfully",
    "data": [...]
  }
  ```

#### 3. Get Single Task by ID

- **Endpoint**: `GET /api/tasks/:id`
- **Success Response (200 OK)**: Returns the matching task if owned by user.
- **Error Response (404 Not Found)**: Returned if task does not exist or belongs to another user.

#### 4. Update Task

- **Endpoint**: `PATCH /api/tasks/:id`
- **Request Body**: Partial update object (`title`, `description`, `status`, `priority`, `dueDate`).
- **Success Response (200 OK)**: Returns updated task object.
- **Error Response (404 Not Found)**: Returned if task does not exist or belongs to another user.

#### 5. Delete Task

- **Endpoint**: `DELETE /api/tasks/:id`
- **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Task deleted successfully"
  }
  ```
- **Error Response (404 Not Found)**: Returned if task does not exist or belongs to another user.

---

## Available Scripts

- `npm run dev`: Starts development server with hot-reloading (`tsx`).
- `npm run build`: Compiles TypeScript to `dist/`.
- `npm run start`: Runs production build.
- `npm test`: Runs complete Jest test suite.
- `npm run type-check`: Verifies TypeScript strict typing.
