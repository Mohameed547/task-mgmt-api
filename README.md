# Task Management Application - Backend API

Production-ready TypeScript Express backend foundation for the Task Management Application with Mongoose & MongoDB database configuration and User data model.

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript (Strict Mode)
- **Database**: MongoDB / Mongoose
- **Testing**: Jest & Supertest
- **Logging**: Morgan

## Project Architecture

```text
task-mgmt-api/
├── src/
│   ├── config/          # Application & MongoDB database configuration
│   ├── controllers/     # Route handlers & controller logic
│   ├── middleware/      # Centralized error handling, request logging, & route protection
│   ├── models/          # Mongoose database models & schemas (User model)
│   ├── routes/          # Express route definitions & modular routing
│   ├── schemas/         # Validation schemas
│   ├── services/        # Reusable business logic layer
│   ├── types/           # Custom TypeScript interfaces & type aliases (IUser, ApiResponse)
│   ├── utils/           # Utility functions (ApiError, ApiResponse, asyncHandler, logger)
│   ├── app.ts           # Express application configuration & middleware stack
│   └── server.ts        # Application entry point & graceful shutdown handling
├── tests/               # Unit and integration test suites (database, User model & API endpoints)
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
| `password` | `String` | `required`, `select: false` | Password hash (hidden by default) |
| `createdAt` | `Date` | Auto-generated via `timestamps: true` | Record creation timestamp |
| `updatedAt` | `Date` | Auto-generated via `timestamps: true` | Record update timestamp |

**Security & Normalization Features**:
- Email addresses are automatically trimmed and lowercased upon assignment.
- Passwords have `select: false` set in Mongoose schema and are automatically stripped out during JSON serialization (`toJSON` / `toObject` transforms).

## MongoDB Setup Instructions

1. **Install MongoDB**:
   Ensure MongoDB Community Server is installed locally or obtain a remote MongoDB connection string (e.g. MongoDB Atlas).

2. **Configure Connection String**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Set `MONGODB_URI` to your database URI:
   ```env
   MONGODB_URI=mongodb://localhost:27017/task_management_db
   ```

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
- **Description**: Returns current server status, uptime, environment, and MongoDB database connection state.
- **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Server is healthy",
    "data": {
      "uptime": 12.345,
      "timestamp": "2026-08-23T19:35:00.000Z",
      "environment": "development",
      "database": "connected"
    }
  }
  ```
