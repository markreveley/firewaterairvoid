#!/usr/bin/env node

// Simple migration script to apply recurrence fields migration
// Run with: node apply-migration.js

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read Supabase credentials from environment or .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
  console.error('You can find these in your .env file or Supabase dashboard');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('Applying recurrence fields migration...');

    const migrationSQL = readFileSync(
      join(__dirname, 'supabase/migrations/20251103224411_add_recurrence_fields.sql'),
      'utf-8'
    );

    // Note: This requires service role key for DDL operations
    // If using anon key, you'll need to run this in Supabase SQL Editor instead
    console.log('\nMigration SQL:');
    console.log(migrationSQL);
    console.log('\n⚠️  Please copy the SQL above and run it in your Supabase SQL Editor');
    console.log('   (Dashboard → SQL Editor → New Query → Paste → Run)');
    console.log('\nAlternatively, if you have the service role key, update this script to use it.\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

applyMigration();
