# SplitMint

**SplitMint** is a modern, sophisticated, and AI-powered expense splitting application. It combines a professional light-themed user interface with intelligent features like natural language expense drafting and automated group summaries to make managing shared finances effortless and elegant.

![Landing Page](file:///d:/splitmint/frontend/public/landing-screenshot.png) *(Note: Placeholder for actual screenshot)*

## 🚀 Features

### ✨ MintSense AI
- **Natural Language Drafting**: Record expenses by simply typing "Lunch at Joe's for 1500 with Alice and Bob".
- **Intelligent Summaries**: Generate human-readable AI summaries of group spending patterns and outstanding balances.
- **Confidence Scoring**: Smart validation of AI-drafted data to ensure accuracy.

### 🎨 Professional UI/UX
- **Sophisticated Light Theme**: A clean, airy, and modern aesthetic with vibrant accents and premium typography.
- **Fluid Animations**: Experimental use of Framer Motion for smooth transitions and interactive micro-animations.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewing.

### 📊 Core Management
- **Dynamic Ledger**: Real-time balance calculations and settlement suggestions.
- **Group Management**: Easily create groups and manage participants without requiring them to sign up.
- **Expense History**: Comprehensive list of transactions with advanced filtering by participant, amount, and date.

---

## 🏗️ Project Structure

```text
splitmint/
├── backend/          # Node.js + Express + Prisma + Gemini AI
└── frontend/         # Next.js 14 + Tailwind v4 + shadcn/ui
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: React Context API
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **AI Engine**: [Google Gemini Pro](https://ai.google.dev/)
- **Authentication**: JWT + bcrypt

---

## 🚥 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL instance (or Supabase)
- Google Gemini API Key

### Installation

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
   # Update DATABASE_URL and GEMINI_API_KEY in .env
   npx prisma migrate dev
   npm run dev
   ```
   *Backend runs on `http://localhost:3001`*

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env.local
   # Ensure NEXT_PUBLIC_API_URL=http://localhost:3001
   npm run dev
   ```
   *Frontend runs on `http://localhost:3000`*

---

## 🔑 Environment Variables

### Backend (`/backend/.env`)
| Variable | Description |
| :--- | :--- |
| `PORT` | Set to `3001` |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `GEMINI_API_KEY` | API key from Google AI Studio |

### Frontend (`/frontend/.env.local`)
| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Set to `http://localhost:3001` |

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
