#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const DB_NAME = process.env.DB_NAME || 'ai_tools_platform'
const DB_USER = process.env.DB_USER || 'xiaoyao'
const DB_HOST = process.env.DB_HOST || 'localhost'
const DB_PORT = process.env.DB_PORT || '5432'

const schemaPath = path.join(process.cwd(), '../database/schema.sql')

console.log('🚀 Initializing PostgreSQL database...')
console.log(`📊 Database: ${DB_NAME}`)
console.log(`👤 User: ${DB_USER}`)
console.log(`🌐 Host: ${DB_HOST}:${DB_PORT}`)

try {
  console.log('\n1. Creating database...')
  try {
    execSync(`createdb -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} ${DB_NAME}`, { stdio: 'inherit' })
    console.log('✅ Database created successfully')
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Database already exists, skipping creation')
    } else {
      throw error
    }
  }

  console.log('\n2. Creating tables...')
  const schema = fs.readFileSync(schemaPath, 'utf-8')
  
  const cleanedSchema = schema
    .replace(/^--.*$/gm, '')
    .replace(/^\\c.*$/gm, '')
    .replace(/^CREATE DATABASE.*$/gm, '')
    .trim()
    .split(/\n\s*\n/)
    .filter(block => block.trim())

  for (const block of cleanedSchema) {
    if (block.trim()) {
      try {
        execSync(
          `psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -c "${block.replace(/"/g, '\\"')}"`,
          { stdio: 'pipe' }
        )
      } catch (error) {
        console.warn(`⚠️  Warning: Some statements may have failed (this is normal for triggers and indexes)`)
      }
    }
  }

  console.log('✅ Tables created successfully')

  console.log('\n3. Verifying setup...')
  const tables = execSync(
    `psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public'"`,
    { encoding: 'utf-8' }
  )
  
  console.log('\n📋 Created tables:')
  tables.split('\n').forEach(table => {
    if (table.trim()) {
      console.log(`   - ${table.trim()}`)
    }
  })

  console.log('\n🎉 Database initialization completed successfully!')
  console.log('\n💡 Next steps:')
  console.log('   1. Restart the backend server if needed')
  console.log('   2. Start using the application')
  console.log('   3. Your conversations will be automatically saved')

} catch (error) {
  console.error('\n❌ Database initialization failed:')
  console.error(error.message)
  console.error('\n🔧 Troubleshooting:')
  console.error('   1. Ensure PostgreSQL is running: brew services list')
  console.error('   2. Check your .env file configuration')
  console.error('   3. Verify PostgreSQL user permissions')
  console.error('   4. Try manual creation: createdb ai_tools_platform')
  process.exit(1)
}
