# TeamMind — AI-Powered Team Knowledge Hub

A full-stack Next.js 15 web application that serves as an AI-assisted team knowledge platform with secure data filtering and collaborative features.

## Features

- **Authentication & Team Membership**: Email/password authentication with NextAuth.js, supporting three hardcoded teams (A-Team, B-Team, C-Team)
- **Knowledge Cards**: Create, edit, and manage knowledge cards with AI-powered enrichment
- **AI Integration**: Automatic generation of summaries, tags, and related card suggestions using OpenAI
- **Collaborative Features**: 
  - Like/unlike cards with optimistic UI updates
  - Comment on cards
- **Access Control**: 
  - PUBLIC cards visible to all users
  - PRIVATE cards visible only to members of the creator's team
- **Dashboard View**: Global view showing all PUBLIC cards with search and tag filtering
- **Team View**: Grouped view by teams with appropriate access control

## Tech Stack

- **Framework**: Next.js 15 (App Router + Server Actions)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (beta)
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI API
- **State Management**: React hooks (useTransition, optimistic updates)

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- OpenAI API key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd teammind
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/teammind?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OpenAI
OPENAI_API_KEY="your-openai-api-key-here"
```

**Note**: Generate a secure `NEXTAUTH_SECRET` using:
```bash
openssl rand -base64 32
```

### 4. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed teams (A-Team, B-Team, C-Team)
npm run db:seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture Overview

### Server Actions Structure

The application uses Next.js Server Actions for all data mutations:

- **`lib/actions/auth.ts`**: User authentication (signup)
- **`lib/actions/cards.ts`**: Knowledge card CRUD operations with AI enrichment
- **`lib/actions/likes.ts`**: Like/unlike functionality
- **`lib/actions/comments.ts`**: Comment creation and retrieval

### Access Control Logic

The application implements sophisticated access control for knowledge cards:

#### Dashboard (`/dashboard`)
- **Display Logic**: Shows only cards where `access = 'PUBLIC'`
- **Search & Filtering**: Supports text search and tag-based filtering
- **All Users**: Can view all public cards regardless of team membership

#### Team View (`/team`)
- **User's Own Team**: 
  - Shows ALL cards (both PUBLIC and PRIVATE) created by team members
  - PRIVATE cards are clearly marked with a lock icon 🔒
  - Displays total card count (visible + private)
- **Other Teams**: 
  - Shows ONLY PUBLIC cards
  - Does not reveal private cards or exact counts

This implementation ensures:
1. Privacy: Teams can keep sensitive information private
2. Transparency: Teams can see their complete knowledge base
3. Collaboration: Public knowledge is shared across teams

### Data Models

- **User**: Stores user credentials and team membership
- **Team**: Hardcoded teams (A-Team, B-Team, C-Team)
- **KnowledgeCard**: Core knowledge storage with AI-generated metadata
- **Like**: Prevents double-liking (unique constraint on userId + cardId)
- **Comment**: User comments on cards

### AI Integration

When a card is created or updated:
1. **Summary Generation**: Creates a 2-3 sentence summary
2. **Tag Suggestion**: Suggests 3-5 relevant tags
3. **Related Cards**: Identifies up to 3 related cards based on content similarity
4. **Fallback**: Provides default values if AI API fails

### Optimistic UI Updates

All collaborative actions (liking, commenting) use:
- React's `useTransition` hook for pending states
- Optimistic updates for instant UI feedback
- Automatic reversion on error

## Project Structure

```
teammind/
├── app/
│   ├── api/auth/[...nextauth]/    # NextAuth route handlers
│   ├── dashboard/                  # Dashboard page
│   ├── team/                       # Team view page
│   ├── login/                      # Login page
│   ├── signup/                     # Signup page
│   └── layout.tsx                  # Root layout
├── components/
│   ├── Card.tsx                    # Knowledge card component
│   ├── CreateCardForm.tsx          # Card creation form
│   ├── DashboardFilters.tsx        # Search and tag filters
│   ├── Navbar.tsx                  # Navigation bar
│   └── SessionProvider.tsx         # NextAuth session provider
├── lib/
│   ├── actions/                    # Server actions
│   │   ├── auth.ts
│   │   ├── cards.ts
│   │   ├── comments.ts
│   │   └── likes.ts
│   ├── ai.ts                       # OpenAI integration
│   ├── auth.ts                     # NextAuth configuration
│   └── prisma.ts                   # Prisma client singleton
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── seed.ts                     # Database seed script
└── types/
    └── next-auth.d.ts              # NextAuth type definitions
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables in Vercel dashboard
4. Set up PostgreSQL database (Vercel Postgres or external provider)
5. Run migrations: `npx prisma migrate deploy` (or use `prisma db push` for development)
6. Seed teams: `npm run db:seed`

### Database Migration

For production, use Prisma migrations:

```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```

## Reflection: Most Challenging Feature

### Data Filtering/Access Control

The most challenging aspect was implementing the nuanced access control logic in the Team View. The requirement that user's own team shows all cards (including private ones) while other teams show only public cards required careful query construction and clear UI indicators.

**Solution Approach:**
1. Implemented conditional WHERE clauses in Prisma queries based on team membership
2. Used separate count queries to show total vs. visible counts
3. Added visual indicators (lock icons) for private cards
4. Ensured the logic is consistent across all data fetching points

This feature required deep understanding of:
- Prisma query building
- Server-side authentication state
- Client-side UI state management
- Edge cases (empty teams, all-private teams, etc.)

The complexity came from ensuring that the filtering logic was both secure (server-side enforced) and user-friendly (clear visual feedback).

## License

MIT

## Author

Built as part of a full-stack development assessment.
