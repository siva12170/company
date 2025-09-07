# CodeJudge - Online Judge Platform

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Platform](https://img.shields.io/badge/platform-Web-brightgreen.svg)
![Node](https://img.shields.io/badge/node-v22-green.svg)

CodeJudge is a modern, full-featured online judge platform for competitive programming. The application allows users to solve coding problems, submit solutions in various programming languages, and get instant feedback on their submissions.

## 🌟 Features

- **User Authentication & Authorization**
  - Secure login/registration with hCaptcha protection
  - Role-based access control (User, Problemsetter, Admin)
  - JWT-based authentication with HTTP-only cookies

- **Problem Management**
  - Create, edit, and manage coding problems (Problemsetters & Admins)
  - Support for multiple test cases with visible/hidden options
  - Rich problem descriptions with Markdown support
  - Custom time and memory limits

- **Code Submission & Evaluation**
  - Support for multiple programming languages (C, C++, Java, Python)
  - Real-time code execution and testing
  - Detailed submission feedback
  - Submission history tracking

- **AI-Powered Features**
  - AI code review for submissions
  - Smart suggestions and optimization tips

- **Modern UI/UX**
  - Responsive design for all devices
  - Real-time feedback
  - Monaco code editor with syntax highlighting
  - Dark/light mode support

## 🏗️ Architecture

The application follows a microservices architecture with three main components:

### Frontend (React/Vite)

- Modern React application with Hooks and Context API
- Built with Vite for fast development and optimized production builds
- TailwindCSS for styling
- Monaco Editor for code editing capabilities
- Protected routes with role-based access control

### Backend API (Express/MongoDB)

- RESTful API built with Express.js
- MongoDB database with Mongoose ORM
- JWT-based authentication
- Role-based middleware for route protection
- File upload handling for user avatars

### Compiler Service (Express/Node.js)

- Isolated service for secure code execution
- Multi-language support (C, C++, Java, Python)
- Resource limiting and sandboxing
- Google Gemini AI integration for code review

## 🛠️ Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Monaco Editor, React Router
- **Backend**: Express.js, MongoDB, Mongoose, JWT
- **Compiler**: Node.js, Docker
- **DevOps**: Docker, AWS EC2

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or later
- MongoDB
- Bun (optional, for faster package management)

### Installation & Setup

#### Clone the Repository

```bash
git clone https://github.com/jaindevshrut/oj_project.git
cd oj_project
```

#### Frontend Setup

```bash
cd frontend
npm install
# Configure environment variables
cp .env.example .env
# Edit .env file with your settings
npm run dev
```

#### Backend Setup

```bash
cd backend
npm install
# Configure environment variables
cp .env.example .env
# Edit .env file with your MongoDB connection string and other settings
npm run dev
```

#### Compiler Service Setup

```bash
cd compiler
npm install
# Configure environment variables
cp .env.example .env
# Edit .env file with your settings
npm run dev
```

Alternatively, you can use Docker:

```bash
cd compiler
docker build -t oj-compiler .
docker run -p 8080:8080 oj-compiler
```

### Environment Variables

#### Frontend (.env)
```
VITE_BACKEND_URL=<backend_api_url>
VITE_COMPILER_URL=<compiler_service_url>
VITE_HCAPTCHA_KEY=<hcaptcha_site_key>
```

#### Backend (.env)
```
MONGODB_URI=<mongodb_connection_string>
PORT=8000
ACCESS_TOKEN_SECRET=<jwt_secret>
REFRESH_TOKEN_SECRET=<refresh_token_secret>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=<cloudinary_name>
CLOUDINARY_API_KEY=<cloudinary_key>
CLOUDINARY_API_SECRET=<cloudinary_secret>
HCAPTCHA_SECRET_KEY=<hcaptcha_secret>
```

#### Compiler (.env)
```
PORT=8080
CORS_ORIGIN=<allowed_origins>
JWT_SECRET=<jwt_secret>
GEMINI_API_KEY=<google_gemini_api_key>
```

## 📝 API Documentation

The API follows RESTful principles and uses JSON for data exchange.

### Authentication Endpoints

- `POST /api/v1/users/register` - Register a new user
- `POST /api/v1/users/login` - Login and get authentication tokens
- `POST /api/v1/users/logout` - Logout and invalidate tokens
- `GET /api/v1/users/me` - Get current user information

### Problem Endpoints

- `GET /api/v1/problems` - List all problems
- `GET /api/v1/problems/:id` - Get a specific problem
- `POST /api/v1/problems/create` - Create a new problem (Problemsetter/Admin)
- `PUT /api/v1/problems/:id` - Update a problem (Problemsetter/Admin)
- `DELETE /api/v1/problems/:id` - Delete a problem (Problemsetter/Admin)
- `GET /api/v1/problems/my-problems` - List user's created problems (Problemsetter/Admin)

### Submission Endpoints

- `POST /api/v1/submissions/submit` - Submit a solution
- `GET /api/v1/submissions` - Get user's submissions
- `GET /api/v1/submissions/:id` - Get a specific submission
- `GET /api/v1/submissions/problem/:problemId` - Get submissions for a specific problem

### Compiler Endpoints

- `POST /run` - Run code with custom input
- `POST /review` - Get AI review for code

## 👥 User Roles & Permissions

1. **User**
   - Solve problems
   - View submission history
   - Update profile

2. **Problemsetter**
   - All User permissions
   - Create and manage problems
   - Create test cases

3. **Admin**
   - All Problemsetter permissions
   - User management
   - System-wide configuration

## 🧪 Testing

Run tests with:

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🚢 Deployment

### Frontend Deployment

The frontend can be built for production:

```bash
cd frontend
npm run build
```

This creates a `dist` folder that can be served by any static file server.

### Backend & Compiler Deployment

Both services can be deployed using Docker or directly on a server with Node.js installed.

## 🔒 Security Features

- HTTP-only cookies for JWT storage
- hCaptcha integration for bot prevention
- Secure code execution in isolated environments
- Input validation and sanitization
- Rate limiting for API endpoints

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Monaco Editor](https://github.com/microsoft/monaco-editor)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Gemini AI](https://ai.google.dev/)
