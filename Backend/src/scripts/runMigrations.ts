// Migration runner script
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:wxgdY75MzZVWcDSc@db.mnpdqpguszjgnpzvhotr.supabase.co:5432/postgres';

async function runMigrations() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    // Migration 1: Create payments table
    console.log('\n📝 Running migration 1: create_payments_table.sql');
    const migration1Path = path.join(__dirname, '../../migrations/create_payments_table.sql');
    const migration1SQL = fs.readFileSync(migration1Path, 'utf-8');
    await client.query(migration1SQL);
    console.log('✅ Migration 1 completed: Payments table created');

    // Migration 2: Update team subscription payment flow
    console.log('\n📝 Running migration 2: add_team_subscription_payment_flow_v2.sql');
    const migration2Path = path.join(__dirname, '../../migrations/add_team_subscription_payment_flow_v2.sql');
    const migration2SQL = fs.readFileSync(migration2Path, 'utf-8');
    await client.query(migration2SQL);
    console.log('✅ Migration 2 completed: Team subscription payment flow updated');

    console.log('\n🎉 All migrations completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  ✅ payments table created');
    console.log('  ✅ teams.approval_required added');
    console.log('  ✅ teams.subscription_price added');
    console.log('  ✅ member_teams.payment_id added');
    console.log('  ✅ team_member_teams.payment_id added');
    console.log('  ✅ Foreign key constraints added');
    console.log('  ✅ Indexes created for performance');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run migrations
runMigrations()
  .then(() => {
    console.log('\n✨ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration script failed:', error);
    process.exit(1);
  });
