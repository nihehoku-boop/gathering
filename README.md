# Gathering - Collection Management Website

A modern, full-featured web application for tracking and managing your collections. Whether you collect comic books, trading cards, vintage toys, or any other items, Gathering helps you catalog, track progress, and manage your collections with ease.

## Features

- **User Authentication**: Simple email-based authentication system
- **Collection Management**: Create, view, and manage multiple collections
- **Item Cataloguing**: Add items to collections with names and numbers
- **Bulk Import**: Add hundreds of items at once using:
  - Numbered series generator (e.g., "LTB #1" to "LTB #550")
  - CSV import for structured data
  - Manual list paste
- **Progress Tracking**: Visual progress bars showing collection completion
- **Select/Deselect Items**: Easily mark items as owned or not owned
- **Custom Templates**: Define custom fields for your collections
- **Drag & Drop**: Reorder collections and custom fields
- **Beautiful UI**: Modern, responsive design with Tailwind CSS
- **Real-time Updates**: Instant feedback when updating your collections

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Prisma** - Database ORM
- **SQLite** - Local development database
- **PostgreSQL** - Production database (Vercel Postgres)
- **NextAuth.js** - Authentication
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **Cloudinary** - Image hosting

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set:
- `DATABASE_URL="file:./dev.db"` (SQLite database for local)
- `NEXTAUTH_URL="http://localhost:3000"`
- `NEXTAUTH_SECRET` (generate a random string)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (optional, for image uploads)
- `RESEND_API_KEY` (required for email functionality - see EMAIL_SETUP.md)
- `RESEND_FROM_EMAIL` (optional, defaults to onboarding@resend.dev)

3. Set up the database:
```bash
npm run db:push
npm run db:generate
```

4. Seed recommended collections (optional):
```bash
npm run seed:recommended
```

5. Set yourself as admin (replace with your email):
```bash
npm run set-admin your-email@example.com
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Switching

For local development, use SQLite. For production (Vercel), use PostgreSQL.

```bash
# Switch to SQLite (local development)
npm run db:switch:local

# Switch to PostgreSQL (production)
npm run db:switch:prod
```

After switching, run:
```bash
npm run db:generate
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to Vercel.

Quick steps:
1. Push code to GitHub
2. Connect to Vercel
3. Set up Vercel Postgres
4. Configure environment variables
5. Deploy!

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:generate` - Generate Prisma Client
- `npm run db:switch:local` - Switch to SQLite
- `npm run db:switch:prod` - Switch to PostgreSQL
- `npm run seed:recommended` - Seed recommended collections
- `npm run set-admin <email>` - Set user as admin

## Project Structure

```
gathering/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/             # Authentication pages
│   └── ...               # Other pages
├── components/           # React components
├── lib/                  # Utility functions
├── prisma/               # Database schema
├── public/               # Static assets
└── scripts/             # Utility scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
