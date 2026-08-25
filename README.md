# Task Management API

Production-ready TypeScript Express RESTful API backend for the Task Management Application. Built with Node.js, Express, MongoDB (Mongoose), JWT authentication, Multer, and Cloudinary for file attachments.

---

## Overview

The **Task Management API** provides a secure, robust, and scalable backend foundation for managing tasks, users, authentication, and file attachments. It operates as the backend service layer of a full-stack Task Management application, maintaining full separation of concerns from the frontend interface.

### Main Responsibilities:
* User registration and authentication via JWT.
* User-specific multi-tenant task ownership and isolation.
* Task CRUD operations (Create, Read, Update, Delete).
* Server-side pagination, search, and status/priority filtering.
* Request validation, error handling, and security sanitization.
* Optional file attachment upload via `multipart/form-data` with Cloudinary storage and failure cleanup.

---

## Key Features

| Feature | Description | Status |
| :--- | :--- | :--- |
| **User Registration** | New user signup with password hashing | ✅ Implemented |
| **User Login** | Secure credential verification and JWT token issuance | ✅ Implemented |
| **JWT Authentication** | Bearer token authentication middleware for protected routes | ✅ Implemented |
| **User Task Ownership** | Strict multi-tenant task isolation per user | ✅ Implemented |
| **Task CRUD** | Full lifecycle operations for task records | ✅ Implemented |
| **Task Status & Priority** | Enforced enum state management (`TODO`, `IN_PROGRESS`, `DONE` / `LOW`, `MEDIUM`, `HIGH`) | ✅ Implemented |
| **Server-Side Pagination** | Paginated task listings (`page`, `limit`) | ✅ Implemented |
| **Search & Filtering** | Regex search on title and filtering by status/priority | ✅ Implemented |
| **Backend Validation** | Strict request schema validation with field constraints | ✅ Implemented |
| **Password Hashing** | Secure password hashing using `bcryptjs` (10 salt rounds) | ✅ Implemented |
| **File Attachments** | Single file attachment per task via `multipart/form-data` | ✅ Implemented |
| **Cloudinary Storage** | Buffer streaming file upload to Cloudinary with automatic cleanup on failure | ✅ Implemented |
| **Error Handling** | Standardized JSON error response format with HTTP status codes | ✅ Implemented |
| **Automated Testing** | 17 test suites containing 128 unit and integration tests passing | ✅ Implemented |

---

## Tech Stack

| Technology | Purpose | Version |
| :--- | :--- | :--- |
| **Node.js** | JavaScript Runtime Environment | `v18+` |
| **Express.js** | Fast, unopinionated web framework for Node.js | `^4.21.2` |
| **TypeScript** | Type-safe JavaScript superset with strict typing | `^5.7.3` |
| **MongoDB** | NoSQL document database | Community / Atlas |
| **Mongoose** | Object Data Modeling (ODM) library for MongoDB | `^8.10.1` |
| **JSON Web Token (JWT)** | Stateless user session authentication | `^9.0.3` |
| **bcryptjs** | Password hashing algorithm | `^3.0.3` |
| **Multer** | Middleware for handling `multipart/form-data` file uploads | `^2.2.0` |
| **Cloudinary** | Cloud image and file management SDK | `^2.10.1` |
| **Jest & Supertest** | Testing framework & HTTP assertion library | `^29.7.0` / `^7.0.0` |
| **Morgan** | HTTP request logger middleware | `^1.10.0` |
| **Helmet** | Security HTTP headers middleware | `^8.3.0` |
| **express-rate-limit** | Rate limiting middleware for brute-force protection | `^8.6.2` |
| **dotenv** | Environment variable management | `^16.4.7` |
| **cors** | Cross-Origin Resource Sharing middleware | `^2.8.5` |

---

## Architecture

The backend adheres to a layered architecture separating routing, HTTP controllers, business services, data models, and utility modules.

```text
Client Request
  ↓
Routes (Express Routers)
  ↓
Middleware (Auth, Validation, Upload, Error Logger)
  ↓
Controllers (HTTP Handling & Status Responses)
  ↓
Services (Business Logic Layer)
  ↓
Models (Mongoose Schemas & MongoDB Operations)
  ↓
MongoDB Database / Cloudinary Storage
```

### Layer Responsibilities:

* **Routes (`src/routes`)**: Define endpoint URI paths, HTTP methods, and attach appropriate middleware chains.
* **Middleware (`src/middleware`)**: Handle authentication token verification, input validation, file upload processing (`multer`), and error catching.
* **Controllers (`src/controllers`)**: Parse incoming HTTP request parameters, call service functions, and format standardized JSON HTTP responses.
* **Services (`src/services`)**: Encapsulate all business logic, database queries, and transaction rollbacks.
* **Models (`src/models`)**: Define MongoDB Mongoose schemas, indexes, and TypeScript document interfaces.
* **Schemas (`src/schemas`)**: Request payload and query parameter validation functions.
* **Utils (`src/utils`)**: Helper utilities including JWT handling, Cloudinary stream uploading, `ApiError` class, and logging.

---

## Project Structure

```text
task-mgmt-api/
├── src/
│   ├── config/
│   │   ├── database.ts           # MongoDB Mongoose connection handler
│   │   └── env.ts                # Environment variable loader & typed configuration
│   ├── controllers/
│   │   ├── auth.controller.ts    # User register, login, & me profile controllers
│   │   ├── health.controller.ts  # API health check controller
│   │   └── task.controller.ts    # Task CRUD & attachment controllers
│   ├── middleware/
│   │   ├── authenticate.ts       # JWT Bearer token authentication middleware
│   │   ├── errorHandler.ts       # Global centralized error handling middleware
│   │   ├── notFoundHandler.ts    # 404 Route Not Found middleware
│   │   ├── requestLogger.ts      # HTTP request logging middleware
│   │   ├── upload.ts             # Multer in-memory upload middleware & file filter
│   │   └── validate.ts           # Schema validation runner middleware
│   ├── models/
│   │   ├── index.ts              # Central models export
│   │   ├── task.model.ts         # Task Mongoose schema & index definition
│   │   └── user.model.ts         # User Mongoose schema & password hash hook
│   ├── routes/
│   │   ├── auth.routes.ts        # Authentication endpoints routing
│   │   ├── health.routes.ts      # Health check endpoint routing
│   │   ├── index.ts              # API root router combining modules
│   │   └── task.routes.ts        # Task management endpoints routing
│   ├── schemas/
│   │   ├── auth.schema.ts        # Auth request payload validation schemas
│   │   ├── index.ts              # Schemas export module
│   │   └── task.schema.ts        # Task payload & query validation schemas
│   ├── services/
│   │   ├── auth.service.ts       # User authentication business logic
│   │   ├── index.ts              # Services export module
│   │   └── task.service.ts       # Task database CRUD & pagination business logic
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces (User, Task, Express request)
│   ├── utils/
│   │   ├── ApiError.ts           # Custom operational error class
│   │   ├── ApiResponse.ts        # Standardized API response builder helper
│   │   ├── asyncHandler.ts       # Async error wrapper for Express handlers
│   │   ├── cloudinary.ts         # Cloudinary stream upload & deletion helpers
│   │   ├── jwt.ts                # JWT sign & verify utility functions
│   │   └── logger.ts             # Console logger utility
│   ├── app.ts                    # Express app setup & middleware pipeline
│   └── server.ts                 # Server entry point & graceful shutdown
├── tests/                        # Automated unit & integration test suites
│   ├── apiResponse.test.ts
│   ├── auth.login.test.ts
│   ├── auth.me.test.ts
│   ├── auth.middleware.test.ts
│   ├── auth.register.test.ts
│   ├── auth.schema.test.ts
│   ├── auth.service.test.ts
│   ├── database.test.ts
│   ├── errorHandler.test.ts
│   ├── health.test.ts
│   ├── jwt.utils.test.ts
│   ├── task.api.test.ts
│   ├── task.attachment.test.ts
│   ├── task.model.test.ts
│   ├── task.schema.test.ts
│   ├── task.service.test.ts
│   └── user.model.test.ts
├── .env.example                  # Environment configuration template
├── .gitignore                    # Git version control exclusions
├── jest.config.ts                # Jest testing runner configuration
├── package.json                  # Dependencies & npm script definitions
└── tsconfig.json                 # TypeScript strict compiler configuration
```

---

## Prerequisites

Ensure the following dependencies are installed on your environment before running the application:

* **Node.js**: `v18.0.0` or higher
* **npm**: `v9.0.0` or higher
* **MongoDB**: A running local MongoDB daemon (`mongodb://localhost:27017`) or a remote MongoDB Atlas URI.
* **Cloudinary Account**: Cloud name, API Key, and API Secret credentials for file upload functionality.

---

## Installation

1. Clone the repository and navigate to the API directory:
   ```bash
   cd task-mgmt-api
   ```

2. Install backend npm dependencies:
   ```bash
   npm install
   ```

---

## Environment Variables

Create a `.env` file in the root of `task-mgmt-api` based on `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Mongoose / MongoDB)
MONGODB_URI=mongodb://localhost:27017/task_management_db

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_should_be_long_and_secure
JWT_EXPIRES_IN=1d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Configuration Parameters:

| Variable | Type | Description |
| :--- | :--- | :--- |
| `PORT` | `Number` | HTTP server port (Default: `5000`) |
| `NODE_ENV` | `String` | Runtime mode (`development`, `production`, `test`) |
| `MONGODB_URI` | `String` | MongoDB connection URI string |
| `CORS_ORIGIN` | `String` | Allowed frontend origin for CORS |
| `JWT_SECRET` | `String` | Secret key for signing JSON Web Tokens |
| `JWT_EXPIRES_IN` | `String` | Expiration window for JWT tokens (e.g. `1d`) |
| `CLOUDINARY_CLOUD_NAME` | `String` | Cloudinary cloud account identifier |
| `CLOUDINARY_API_KEY` | `String` | Cloudinary API access key |
| `CLOUDINARY_API_SECRET` | `String` | Cloudinary API access secret |

---

## Running the Application

### Development Mode
Runs the backend API using `tsx` with instant hot-reloading:
```bash
npm run dev
```

### Production Build & Execution
Compile TypeScript code to JavaScript in `dist/` and start the server:
```bash
npm run build
npm start
```

### Type Checking
Verify TypeScript types strictly without emitting JavaScript:
```bash
npm run type-check
```

---

## API Documentation

All request and response bodies use JSON formatting unless transferring files via `multipart/form-data`.

---

### Health Endpoint

#### `GET /api/health`
Checks backend service availability and database connectivity.
* **Authentication**: None required.
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Health check successful",
    "data": {
      "uptime": 124.5,
      "timestamp": "2026-08-25T11:00:00.000Z",
      "database": "connected"
    }
  }
  ```

---

### Authentication Endpoints

#### 1. Register User
* **Endpoint**: `POST /api/auth/register`
* **Authentication**: None required.
* **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
* **Validation Rules**:
  - `name`: String, required, 2-50 characters.
  - `email`: Valid email format, required, unique.
  - `password`: String, required, minimum 6 characters.
* **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "60d5ecb8b5c9c21234567890",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "createdAt": "2026-08-25T11:00:00.000Z"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
* **Common Errors**: `400 Bad Request` (validation failure), `409 Conflict` (email already exists).

#### 2. Login User
* **Endpoint**: `POST /api/auth/login`
* **Authentication**: None required.
* **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "Password123!"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Login successful",
    "data": {
      "user": {
        "id": "60d5ecb8b5c9c21234567890",
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
* **Common Errors**: `401 Unauthorized` (invalid email or password).

#### 3. Get Authenticated Profile
* **Endpoint**: `GET /api/auth/me`
* **Authentication**: Required (`Authorization: Bearer <TOKEN>`).
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "User profile fetched successfully",
    "data": {
      "id": "60d5ecb8b5c9c21234567890",
      "name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
  ```

---

### Task API Endpoints

All task endpoints require an `Authorization: Bearer <TOKEN>` header.

#### 1. Create Task
* **Endpoint**: `POST /api/tasks`
* **Content-Type**: `application/json` OR `multipart/form-data`
* **Request Fields**:
  - `title` (string, required, max 100 chars)
  - `description` (string, optional, max 1000 chars)
  - `status` (enum, optional: `TODO`, `IN_PROGRESS`, `DONE` - Default: `TODO`)
  - `priority` (enum, optional: `LOW`, `MEDIUM`, `HIGH` - Default: `MEDIUM`)
  - `dueDate` (ISO date string, optional)
  - `attachment` (file, optional - PDF, PNG, JPG, JPEG, DOC, DOCX, max 5 MB)
* **Success Response (201 Created)**:
  ```json
  {
    "status": "success",
    "message": "Task created successfully",
    "data": {
      "_id": "6a8ceb9e0243c99fa7b47743",
      "title": "Setup CI/CD Pipeline",
      "description": "Configure GitHub Actions workflow",
      "status": "TODO",
      "priority": "HIGH",
      "dueDate": "2026-12-31T23:59:59.000Z",
      "attachment": {
        "fileName": "pipeline-spec.pdf",
        "fileUrl": "https://res.cloudinary.com/demo/raw/upload/v1234/task-manager/attachments/spec.pdf",
        "publicId": "task-manager/attachments/spec_1234",
        "mimeType": "application/pdf",
        "fileSize": 245678
      },
      "user": "60d5ecb8b5c9c21234567890",
      "createdAt": "2026-08-25T11:00:00.000Z",
      "updatedAt": "2026-08-25T11:00:00.000Z"
    }
  }
  ```

#### 2. Get Paginated Tasks & Search
* **Endpoint**: `GET /api/tasks`
* **Query Parameters**:
  - `page` (number, optional, default: `1`)
  - `limit` (number, optional, default: `9`)
  - `search` (string, optional - searches task title case-insensitively)
  - `status` (enum, optional: `TODO`, `IN_PROGRESS`, `DONE`)
  - `priority` (enum, optional: `LOW`, `MEDIUM`, `HIGH`)
* **Example Requests**:
  - `GET /api/tasks?page=1&limit=9`
  - `GET /api/tasks?search=pipeline&status=TODO`
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Tasks retrieved successfully",
    "data": {
      "tasks": [ /* Task items array */ ],
      "pagination": {
        "page": 1,
        "limit": 9,
        "total": 15,
        "totalPages": 2
      }
    }
  }
  ```

#### 3. Get Task by ID
* **Endpoint**: `GET /api/tasks/:id`
* **Success Response (200 OK)**: Returns the matching task object.
* **Common Errors**: `400 Bad Request` (invalid ObjectId format), `404 Not Found` (task does not exist or belongs to another user).

#### 4. Update Task
* **Endpoint**: `PATCH /api/tasks/:id`
* **Content-Type**: `application/json` OR `multipart/form-data`
* **Request Fields**: Optional partial updates for `title`, `description`, `status`, `priority`, `dueDate`, or `attachment`.
* **Success Response (200 OK)**: Returns the updated task object.

#### 5. Delete Task
* **Endpoint**: `DELETE /api/tasks/:id`
* **Success Response (200 OK)**:
  ```json
  {
    "status": "success",
    "message": "Task deleted successfully"
  }
  ```

---

## Task Ownership & Authorization

To ensure multi-tenant security, task authorization is strictly enforced at the database query level:

1. The `authenticate` middleware extracts the JWT token from the `Authorization: Bearer <TOKEN>` header, verifies its signature, and attaches `req.user = { userId, email }` to the Express request object.
2. All service methods in `task.service.ts` enforce task ownership by filtering every MongoDB query with `{ user: userId }`:
   - `getUserTasks`: Queries `Task.find({ user: userId, ...filters })`.
   - `getTaskById`: Queries `Task.findOne({ _id: taskId, user: userId })`.
   - `updateTask`: Queries `Task.findOneAndUpdate({ _id: taskId, user: userId }, ...)` .
   - `deleteTask`: Queries `Task.findOneAndDelete({ _id: taskId, user: userId })`.
3. If a user attempts to view, update, or delete a task belonging to a different user, the database query yields `null` and returns a generic `404 Not Found` response to prevent user enumeration.

---

## Validation

Backend validation is enforced using schema-based middleware prior to controller execution:

* **Authentication Validation (`auth.schema.ts`)**:
  - Validates `email` with standard email format regex and lowercase normalization.
  - Validates `password` minimum length (6 characters).
  - Validates `name` character length (2 to 50 characters).
* **Task Validation (`task.schema.ts`)**:
  - `title`: Trimmed string, required on create, 1 to 100 characters.
  - `description`: Trimmed string, optional, maximum 1000 characters.
  - `status`: Allowed enum values (`TODO`, `IN_PROGRESS`, `DONE`).
  - `priority`: Allowed enum values (`LOW`, `MEDIUM`, `HIGH`).
  - `dueDate`: Valid ISO 8601 date format.

---

## Authentication & Security

* **JWT Stateless Authentication**: Uses signed JSON Web Tokens containing `userId` and `email`. Tokens expire based on `JWT_EXPIRES_IN`.
* **Password Hashing**: Uses `bcryptjs` with 10 salt rounds. Passwords are never stored in plaintext and are set to `select: false` in the Mongoose schema.
* **Regex Injection Prevention**: Search queries escape regex special syntax characters (`-[\]{}()*+?.,\\^$|#`) before constructing MongoDB `$regex` filters.
* **CORS Protection**: Restricted to configured origins (`CORS_ORIGIN`).
* **Input Trimming**: Automatically trims whitespace from title, description, name, and email fields.

---

## Task Attachments

The task attachment pipeline supports optional file uploads per task:

```text
Client (multipart/form-data)
  ↓
Multer Middleware (MemoryStorage buffer)
  ↓
Validation (MIME type & 5 MB size check)
  ↓
Cloudinary Upload Stream
  ↓
Task Document Saved to MongoDB
```

### Technical Specs:
* **Optional**: Tasks can be created and updated with or without an attachment.
* **Single File Limit**: Accepts 1 attachment per task.
* **Allowed Extensions**: `.pdf`, `.png`, `.jpg`, `.jpeg`, `.doc`, `.docx`.
* **Allowed MIME Types**: `application/pdf`, `image/png`, `image/jpeg`, `image/jpg`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
* **Maximum File Size**: 5 MB ($5 \times 1024 \times 1024 = 5,242,880\text{ bytes}$).
* **In-Memory Streaming**: Files are buffered in memory via `multer.memoryStorage()` and piped directly to Cloudinary using `cloudinary.uploader.upload_stream`.
* **Failure Cleanup**: If MongoDB creation or update fails after Cloudinary upload succeeds, the backend executes an automatic cleanup deletion request (`deleteFromCloudinary`) to prevent orphaned assets.

---

## Error Handling

All operational errors inherit from the custom `ApiError` class.

### Centralized Error Handler (`errorHandler.ts`):
Returns a consistent JSON error format:

```json
{
  "status": "fail",
  "message": "Validation Error",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### Standard HTTP Error Status Codes:
* `400 Bad Request`: Validation failure or invalid ObjectId syntax.
* `401 Unauthorized`: Missing or invalid JWT bearer token / invalid credentials.
* `404 Not Found`: Endpoint or task record not found.
* `409 Conflict`: Unique constraint violation (e.g. email already registered).
* `500 Internal Server Error`: Unexpected server exception or Cloudinary upload failure.

---

## API Response Format

Successful responses follow a standardized JSON structure produced by `ApiResponseHelper`:

```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": {}
}
```

---

## Testing

The backend includes a complete unit and integration test suite using **Jest** and **Supertest**.

### Running Tests
Execute the full test suite in-band:
```bash
npm test
```

Execute tests in watch mode:
```bash
npm run test:watch
```

### Test Coverage Summary:
* **Total Test Suites**: 17 passed
* **Total Tests**: 128 passed
* **Major Coverage Areas**:
  - `auth.register.test.ts`, `auth.login.test.ts`, `auth.me.test.ts` (Authentication API flows)
  - `auth.service.test.ts`, `auth.schema.test.ts`, `auth.middleware.test.ts` (Auth logic & JWT validation)
  - `task.api.test.ts`, `task.service.test.ts`, `task.schema.test.ts` (Task CRUD, pagination, filtering, ownership)
  - `task.attachment.test.ts` (Multer upload, Cloudinary mock, metadata validation, rollback cleanup)
  - `database.test.ts`, `errorHandler.test.ts`, `health.test.ts`, `user.model.test.ts`, `task.model.test.ts`

---

## Production Build

To build and verify production JavaScript output:

```bash
# 1. Type-check TypeScript codebase
npm run type-check

# 2. Build JavaScript distribution in dist/
npm run build

# 3. Start production node server
npm start
```

---

## Known Limitations

1. **Single Attachment Limit**: Each task supports a maximum of 1 file attachment.
2. **File Size Limit**: Maximum allowable attachment size is fixed to 5 MB per file.
3. **MIME Restrictions**: Restricted strictly to standard documents (`PDF`, `DOC`, `DOCX`) and web images (`PNG`, `JPG`, `JPEG`).

---

## AI-Assisted Development Disclosure

AI-assisted development tools were used during the implementation for development assistance, code suggestions, architectural refinement, documentation support, debugging assistance, and test-generation ideas. All generated or suggested code was reviewed, adapted, tested, and integrated manually. The candidate is able to explain the implemented architecture, technical decisions, and functionality during the technical review.

---

## Assessment Requirements Mapping

| Assessment Requirement | Implementation Status | Verified In Code |
| :--- | :--- | :--- |
| **User Registration & Login** | ✅ Implemented | `auth.controller.ts`, `auth.service.ts` |
| **JWT Authentication** | ✅ Implemented | `authenticate.ts`, `jwt.ts` |
| **Protected API Endpoints** | ✅ Implemented | `task.routes.ts` |
| **User Task Ownership** | ✅ Implemented | `task.service.ts` (Multi-tenant filter) |
| **Task CRUD Operations** | ✅ Implemented | `task.controller.ts`, `task.service.ts` |
| **Search & Filtering** | ✅ Implemented | `task.service.ts` (`$regex`, `status`, `priority`) |
| **Server-Side Pagination** | ✅ Implemented | `task.service.ts` (`skip`, `limit`, `totalPages`) |
| **Backend Input Validation** | ✅ Implemented | `validate.ts`, `task.schema.ts`, `auth.schema.ts` |
| **Password Hashing** | ✅ Implemented | `user.model.ts` (`bcryptjs` hook) |
| **Task Attachments (Cloudinary)** | ✅ Implemented | `upload.ts`, `cloudinary.ts`, `task.controller.ts` |
| **Automated Tests** | ✅ Implemented | 17 Test Suites, 128 Tests Passing |

---

## Author

**Mohamed Zohair**
