#!/usr/bin/env tsx
/**
 * Script to switch Prisma schema between SQLite (local) and PostgreSQL (production)
 * 
 * Usage:
 *   npm run db:switch:local    - Switch to SQLite for local development
 *   npm run db:switch:prod     - Switch to PostgreSQL for production
 */

import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma')

function switchDatabase(provider: 'sqlite' | 'postgresql') {
  const schema = readFileSync(schemaPath, 'utf-8')
  
  // Replace the datasource provider
  const updatedSchema = schema.replace(
    /datasource db \{[^}]*provider\s*=\s*["'](sqlite|postgresql)["'][^}]*\}/s,
    `datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}`
  )
  
  writeFileSync(schemaPath, updatedSchema, 'utf-8')
  console.log(`✅ Switched Prisma schema to ${provider}`)
  console.log(`   Run 'npm run db:generate' to regenerate Prisma Client`)
}

const provider = process.argv[2] as 'sqlite' | 'postgresql'

if (provider === 'sqlite' || provider === 'postgresql') {
  switchDatabase(provider)
} else {
  console.error('Usage: tsx scripts/switch-db.ts [sqlite|postgresql]')
  process.exit(1)
}

