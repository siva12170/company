# CodeJudge - Backend API

This is the backend component of the CodeJudge online judge platform. It's built with Express.js and MongoDB, providing a RESTful API for the frontend application.

## Features

- **Authentication System**
  - JWT-based authentication with refresh tokens
  - Role-based access control (User, Problemsetter, Admin)
  - hCaptcha integration for bot prevention
  - Secure password hashing with bcrypt

- **Problem Management**
  - Create, read, update, and delete operations for coding problems
  - Support for multiple test cases with visibility options
  - Pagination, filtering, and searching

- **User Management**
  - User registration and authentication
  - Profile management with avatar upload
  - Role-based permissions

- **Submission Processing**
  - Handling code submissions
  - Interfacing with compiler service
  - Submission history and statistics

- **Security Features**
  - Input validation
  - Rate limiting
  - Protected routes
  - HTTP-only cookies for tokens

## Tech Stack

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM (Object Document Mapper)
- **JWT** - Authentication
- **Multer** - File upload handling
- **Cloudinary** - Cloud storage for avatars
- **hCaptcha** - Bot prevention

## Project Structure

```
backend/
├── src/
│   ├── controllers/   # Request handlers
│   ├── db/            # Database connection setup
│   ├── middleware/    # Custom middleware
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── uploads/       # File upload directory
│   ├── utils/         # Utility functions
│   ├── app.js         # Express app configuration
│   └── index.js       # Server entry point
├── .env               # Environment variables
├── package.json       # Dependencies and scripts
└── public/            # Public assets
```

## Getting Started

### Prerequisites

- Node.js v18 or later
- MongoDB
- npm or bun

### Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```
4. Create a `.env` file with the following variables:
   ```
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/codejudge
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_EXPIRY=10d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   HCAPTCHA_SECRET_KEY=your_hcaptcha_secret
   ```
5. Start the development server:
   ```bash
   npm run dev
   # or
   bun run dev
   ```

## API Endpoints

### Authentication Routes

- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login user and return tokens
- `POST /api/v1/users/logout` - Logout user
- `GET /api/v1/users/me` - Get current user's profile

### Problem Routes

- `GET /api/v1/problems` - Get all problems (with pagination)
- `GET /api/v1/problems/:id` - Get a single problem by ID
- `POST /api/v1/problems/create` - Create a new problem (Problemsetter/Admin)
- `PUT /api/v1/problems/:id` - Update a problem (Problemsetter/Admin)
- `DELETE /api/v1/problems/:id` - Delete a problem (Problemsetter/Admin)
- `GET /api/v1/problems/my-problems` - Get problems created by current user (Problemsetter/Admin)

### Submission Routes

- `POST /api/v1/submissions/submit` - Submit a solution
- `GET /api/v1/submissions` - Get all submissions by current user
- `GET /api/v1/submissions/:id` - Get a single submission by ID
- `GET /api/v1/submissions/problem/:problemId` - Get submissions for a specific problem
- `GET /api/v1/submissions/stats` - Get submission statistics for current user

### User Routes

- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `POST /api/v1/users/avatar` - Upload user avatar

### Health Check Route

- `GET /api/v1/healthcheck` - Check API status

## Middleware

### Authentication Middleware

- `verifyJWT` - Verifies JWT and attaches user to request
- `isAdmin` - Ensures user has Admin role
- `isProblemsetterOrAdmin` - Ensures user has Problemsetter or Admin role

### Upload Middleware

- `upload` - Handles file uploads

## Models

### User Model

- Username, email, password (hashed), fullName, avatar, role
- Methods for token generation and password verification

### Problem Model

- Title, description, difficulty, time limit, memory limit, tags
- Author reference, test cases, creation/update timestamps

### Submission Model

- User reference, problem reference, code, language
- Verdict, execution time, memory usage, test case results
- Creation timestamp

## Error Handling

The API uses a consistent error handling approach with the `ApiError` class.

## License

This project is licensed under the MIT License.
