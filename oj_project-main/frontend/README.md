# CodeJudge - Frontend

This is the frontend component of the CodeJudge online judge platform. It's built with React and Vite, providing a modern and responsive user interface for interacting with the platform.

## Features

- **User Authentication**
  - Secure login/register with hCaptcha protection
  - JWT-based authentication with HTTP-only cookies
  - Role-based UI elements

- **Problem Management**
  - Browse and search problems
  - Filter by difficulty and tags
  - Rich problem display with Markdown support
  - Problem creation and editing for Problemsetters and Admins

- **Code Submission**
  - Monaco Editor with syntax highlighting
  - Support for multiple programming languages
  - Custom input testing
  - Submission history viewing

- **AI-Powered Features**
  - AI code review with Google Gemini integration

## Tech Stack

- **React** - UI library
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Monaco Editor** - Code editor
- **hCaptcha** - Bot prevention

## Project Structure

```
frontend/
├── public/           # Static assets
├── src/
│   ├── components/   # Reusable UI components
│   ├── contexts/     # React context providers
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility libraries
│   ├── pages/        # Page components
│   ├── utils/        # Utility functions
│   ├── App.jsx       # Main application component
│   ├── main.jsx      # Application entry point
│   └── index.css     # Global styles
├── .env              # Environment variables
├── index.html        # HTML template
├── package.json      # Dependencies and scripts
└── vite.config.js    # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js v18 or later
- npm or bun

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```
4. Create a `.env` file with the following variables:
   ```
   VITE_BACKEND_URL=http://localhost:8000/api/v1
   VITE_COMPILER_URL=http://localhost:8080
   VITE_HCAPTCHA_KEY=your_hcaptcha_site_key
   ```
5. Start the development server:
   ```bash
   npm run dev
   # or
   bun run dev
   ```

## Building for Production

```bash
npm run build
# or
bun run build
```

The built files will be in the `dist` directory, ready to be deployed to any static hosting service.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Required |
| --- | --- | --- |
| `VITE_BACKEND_URL` | URL of the backend API | Yes |
| `VITE_COMPILER_URL` | URL of the compiler service | Yes |
| `VITE_HCAPTCHA_KEY` | hCaptcha site key | Yes |

## Component Documentation

### Auth Components
- `login.jsx` - Login form with hCaptcha integration
- `register.jsx` - Registration form with hCaptcha integration

### Problem Components
- `create-problem.jsx` - Form for creating new problems
- `edit-problem.jsx` - Form for editing existing problems
- `problem-detail.jsx` - Detailed view of a problem with code submission
- `problems.jsx` - List of all problems with search and filter

### User Components
- `profile.jsx` - User profile page
- `edit-profile.jsx` - Form for editing user profile

### Submission Components
- `SubmissionHistory.jsx` - Displays user's submission history
- `SubmissionsPage.jsx` - Page for viewing all submissions

### UI Components
- `Header.jsx` - Application header with navigation
- `Toast.jsx` - Toast notification system
- `Modal.jsx` - Reusable modal dialog
- `AIReview.jsx` - Component for AI code review

## Auth Context

The `AuthContext` provides authentication-related functionality throughout the application:

```jsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  // Use auth context
}
```

## License

This project is licensed under the MIT License.
