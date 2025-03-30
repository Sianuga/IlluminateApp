# Office Engagement Platform

A gamified employee engagement system with daily check-ins, point rewards, and benefit redemption features.

## Features

🎯 **Core Functionality**
- Daily check-in system with progressive rewards
- Streak maintenance with bonus multipliers
- Randomized daily prizes (1-50 points)
- Friday bonus points
- Benefit redemption system with unique codes
- News feed integration

📱 **Key Components**
- Interactive dashboard with points display
- Hamburger menu for future navigation
- Three-panel bottom navigation (Dashboard, Redeemed, History)
- Responsive design optimized for mobile
- Animated modals for user feedback
- Local storage persistence

🔄 **Daily System Mechanics**
- Base points: 10/day
- Streak bonus: 5 points/day multiplier
- Daily drop: 5-20 random points
- Friday bonus: +10 points
- Daily prize lock/unlock mechanism
- Midnight reset timer

## Installation

1. Clone repository:
```bash
git clone https://github.com/Sianuga/IlluminateApp
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

## Technologies

- Frontend: Next.js 15 (App Router)
- State Management: React Context API
- Styling: CSS Modules
- Type Safety: TypeScript
- Persistence: Browser LocalStorage
- Icons: SVG illustrations

## Architecture

/src
├── /app
│   └── page.tsx        # Main dashboard
├── /lib
│   └── GameContext.ts  # State management
├── /styles
│   └── globals.css     # Global styles
└── /types
    └── Benefit.ts      # Type definitions

### License

MIT License - see LICENSE for details.
