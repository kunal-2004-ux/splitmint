# SplitMint

Smart expense splitting with AI - A full-stack fintech application for managing shared expenses.

## Project Structure

```
splitmint/
├── backend/          # Node.js + Express + Prisma backend
└── frontend/         # Next.js 14 frontend
```

## Backend

**Tech Stack:**
- Node.js + Express + TypeScript
- Prisma ORM + PostgreSQL
- Google Gemini AI integration
- JWT authentication

**Features:**
- User authentication and authorization
- Group management with participants
- Expense tracking and splitting
- AI-powered expense drafting from natural language
- AI-generated group summaries
- Real-time balance calculations

[Backend README](./backend/README.md)

## Frontend

**Tech Stack:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Framer Motion animations

**Features:**
- Modern dark mode design
- Landing page with hero and features
- Dashboard with stats and group listings
- Clean, production-grade UI

[Frontend README](./frontend/README.md)

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Google Gemini API key

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd splitmint
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database and API credentials
npx prisma migrate dev
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

The backend will run on `http://localhost:3000` and the frontend on `http://localhost:3001`.

## Documentation

- [Backend API Documentation](./backend/README.md)
- [Frontend Design System](./frontend/README.md)

## License

MIT
