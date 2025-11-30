# Setup Instructions

## Step 1: Install Node.js

You need to install Node.js (version 18 or higher) to run this application.

### macOS (using Homebrew):
```bash
brew install node
```

### Or download from:
Visit https://nodejs.org/ and download the LTS version for macOS.

### Verify installation:
```bash
node --version
npm --version
```

## Step 2: Install Dependencies

Once Node.js is installed, run:

```bash
npm install
```

## Step 3: Set Up Database

```bash
npm run db:push
npm run db:generate
```

## Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000

## Troubleshooting

If you get errors:
1. Make sure Node.js 18+ is installed
2. Delete `node_modules` and `package-lock.json` and run `npm install` again
3. Make sure the `.env` file exists in the project root
4. Check that port 3000 is not already in use



