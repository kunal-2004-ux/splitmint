# SplitMint Frontend

A production-grade Next.js 14 frontend for SplitMint - an AI-powered expense splitting application.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **Framer Motion** for animations
- **Lucide React** for icons

## Design System

### Color Palette
- **Base**: Zinc (neutral palette)
- **Accent**: Emerald green
- **Mode**: Dark mode by default

### Design Principles
- Large spacing for calm, uncluttered layout
- Modern startup aesthetic
- No gradients - clean and minimal
- Smooth animations with Framer Motion

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with dark mode
│   ├── page.tsx            # Landing page
│   ├── dashboard/
│   │   └── page.tsx        # Dashboard page
│   └── globals.css         # Design system tokens
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── badge.tsx
│   └── container.tsx       # Layout container
├── lib/
│   └── utils.ts            # Utility functions
└── tailwind.config.ts      # Tailwind configuration
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Build

```bash
npm run build
npm start
```

## Features

### Landing Page
- Hero section with product branding
- Feature showcase with cards
- Smooth scroll animations
- Call-to-action buttons
- Responsive design

### Dashboard
- Stats overview cards
- Group listings with balances
- Clean, data-focused layout
- Navigation between pages

## Design System Components

### Button
Multiple variants: default, outline, ghost, secondary, destructive, link

### Card
Structured content with header, title, description, content, and footer

### Input
Styled form inputs with focus states

### Badge
Labels and tags with variant styles

### Container
Responsive container with max-width and padding

## Customization

### Colors
Edit `app/globals.css` to modify the color scheme. All colors use CSS variables for easy theming.

### Typography
The project uses Inter font from Google Fonts. Change in `app/layout.tsx`.

### Spacing
Tailwind's default spacing scale is used. Modify `tailwind.config.ts` for custom values.

## Notes

- No backend integration yet
- No authentication implemented
- Focus on UI/UX polish and clean code
- All data is currently placeholder/mock data
