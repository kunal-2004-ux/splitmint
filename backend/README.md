# SplitMint Backend

Production-ready backend for SplitMint expense-splitting application.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt

## Features

- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Secure password hashing
- ✅ Layered architecture (routes → controllers → services → repositories)
- ✅ Centralized error handling
- ✅ Request validation
- ✅ Health check endpoint

## Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server bootstrap
├── config/                # Configuration files
│   ├── index.ts          # Environment config
│   └── database.ts       # Prisma client
├── routes/                # API routes
│   └── auth.routes.ts
├── controllers/           # Request handlers
│   └── auth.controller.ts
├── services/              # Business logic
│   └── auth.service.ts
├── repositories/          # Data access layer
│   └── user.repository.ts
├── middlewares/           # Express middlewares
│   ├── auth.ts           # JWT authentication
│   ├── validate.ts       # Request validation
│   └── errorHandler.ts   # Error handling
└── utils/                 # Utility functions
    └── errors.ts         # Custom error classes
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update `DATABASE_URL` with your PostgreSQL connection string:

```
DATABASE_URL="postgresql://user:password@localhost:5432/splitmint?schema=public"
```

### 3. Setup Database

Generate Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-16T03:56:34.000Z"
}
```

### Authentication

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "createdAt": "2024-01-16T03:56:34.000Z"
    },
    "token": "jwt-token"
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "createdAt": "2024-01-16T03:56:34.000Z"
    },
    "token": "jwt-token"
  }
}
```

#### Get Profile (Protected)

```http
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "createdAt": "2024-01-16T03:56:34.000Z"
    }
  }
}
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## Security Features

- Passwords are hashed using bcrypt with 10 salt rounds
- JWT tokens for stateless authentication
- Password hashes are never exposed in API responses
- Input validation on all endpoints
- Centralized error handling prevents information leakage

## Next Steps

This scaffold is ready for implementing business logic:

- Groups management
- Expense tracking
- Balance calculations
- Settlement logic

## License

ISC
