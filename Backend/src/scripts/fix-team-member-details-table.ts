import { AppDataSource } from '../database/data-source';

async function fixDetailsTable() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');

        console.log('Checking team_member_details table...');

        // Check if table exists
        const tableCheck = await AppDataSource.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE  table_schema = 'public'
                AND    table_name   = 'team_member_details'
            );
        `);

        if (!tableCheck[0].exists) {
            console.log('Table team_member_details does not exist. Creating it...');
            await AppDataSource.query(`
                CREATE TABLE team_member_details (
                    id SERIAL PRIMARY KEY,
                    member_id INTEGER UNIQUE NOT NULL,
                    position VARCHAR(50) DEFAULT 'player',
                    status VARCHAR(50) DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log('✅ Table created');
        } else {
            console.log('Table exists, checking columns...');

            // Add member_id if missing
            await AppDataSource.query(`
                ALTER TABLE team_member_details 
                ADD COLUMN IF NOT EXISTS member_id INTEGER UNIQUE;
            `);

            // Ensure not null if we want to be strict, but let's just make sure it exists

            // Add other columns if missing (unlikely if table exists, but let's be safe)
            await AppDataSource.query(`
                ALTER TABLE team_member_details 
                ADD COLUMN IF NOT EXISTS position VARCHAR(50) DEFAULT 'player';
            `);

            await AppDataSource.query(`
                ALTER TABLE team_member_details 
                ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';
            `);

            await AppDataSource.query(`
                ALTER TABLE team_member_details 
                ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            `);

            await AppDataSource.query(`
                ALTER TABLE team_member_details 
                ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            `);

            console.log('✅ Columns checked/added');
        }

        await AppDataSource.destroy();
    } catch (error) {
        console.error('❌ Error fixing table:', error);
    }
}

fixDetailsTable();
