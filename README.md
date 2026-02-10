# TaskFlow - Task Management Application

A full-stack, production-ready task management application built with modern web technologies.

## Tech Stack

### Frontend
- **Next.js 16** (App Router, TypeScript)
- **React 19** with Server Components
- **Tailwind CSS v4** for styling
- **Axios** with interceptors for API communication
- **React Hook Form + Zod** for form validation
- **TanStack React Query** for server state management
- **react-hot-toast** for notifications

### Backend
- **Node.js + Express 5** (TypeScript)
- **PostgreSQL** with **Prisma ORM**
- **JWT** authentication (access + refresh tokens)
- **bcrypt** for password hashing
- **express-validator** for request validation
- **helmet + cors + rate-limiting** for security
- **Winston** for logging

## Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- **PostgreSQL** v14 or higher (local or cloud)

## Setup Instructions

### 1. PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE taskapp;"
```

**Option B: Cloud (e.g., Supabase, Neon, Railway)**
Get your connection string from your provider.

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment file and fill in your values
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT secrets

# Run database migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

The backend will start at **http://localhost:5000**.

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.local.example .env.local

# Start development server
npm run dev
```

The frontend will start at **http://localhost:3000**.

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/taskapp"
JWT_ACCESS_SECRET=your-256-bit-secret-here
JWT_REFRESH_SECRET=your-different-256-bit-secret-here
CLIENT_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Invalidate session |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get current user (protected) |
| PUT | `/api/user/profile` | Update profile (protected) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create task (protected) |
| GET | `/api/tasks` | List tasks with pagination/filters (protected) |
| GET | `/api/tasks/:id` | Get single task (protected) |
| PUT | `/api/tasks/:id` | Update task (protected) |
| DELETE | `/api/tasks/:id` | Delete task (protected) |

### Task Query Parameters
- `status` - Filter by status: `pending`, `in-progress`, `completed`
- `priority` - Filter by priority: `low`, `medium`, `high`
- `search` - Search title and description (case-insensitive)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 50)
- `sort` - Sort field with `-` prefix for descending (e.g., `-createdAt`)

## Project Structure

```
backend/
├── prisma/schema.prisma    # Database schema
├── src/
│   ├── config/             # Database & environment config
│   ├── controllers/        # Route handlers
│   ├── middleware/          # Auth, error handling, validation
│   ├── routes/             # API route definitions
│   ├── utils/              # JWT, logger, async handler
│   ├── types/              # TypeScript declarations
│   ├── app.ts              # Express app setup
│   └── server.ts           # Entry point

frontend/
├── src/
│   ├── app/                # Next.js pages (App Router)
│   │   ├── (auth)/         # Login & Register pages
│   │   └── (dashboard)/    # Dashboard & Profile pages
│   ├── components/         # React components
│   │   ├── auth/           # Auth forms & guards
│   │   ├── dashboard/      # Task CRUD components
│   │   ├── layout/         # Navbar
│   │   └── ui/             # Button, Input, Modal
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # API client, auth helpers, query client
│   ├── types/              # TypeScript interfaces
│   └── utils/              # Validation schemas, constants
```

## Features

- User registration and login with JWT authentication
- Refresh token rotation with httpOnly cookies
- Full CRUD task management
- Task filtering by status, priority, and search
- Paginated task listing
- User profile management
- Rate limiting on auth routes
- Input validation on both client and server
- Responsive UI with Tailwind CSS
- Toast notifications for user feedback
- Protected routes with automatic token refresh

## Production Deployment

### Backend
- Deploy on **Railway**, **Render**, or **AWS EC2/ECS**
- Use **PostgreSQL** managed service (Supabase, Neon, AWS RDS)
- Set `NODE_ENV=production` for security headers and minimal logging

### Frontend
- Deploy on **Vercel** (recommended for Next.js)
- Set `NEXT_PUBLIC_API_URL` to your production backend URL

### Security Checklist
- [ ] Change JWT secrets to strong random values
- [ ] Use HTTPS in production
- [ ] Set proper CORS origins
- [ ] Enable rate limiting
- [ ] Use connection pooling for PostgreSQL
