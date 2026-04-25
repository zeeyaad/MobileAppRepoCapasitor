import { AppDataSource } from '../database/data-source';

async function fixTeamTable() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');

        console.log('Checking team_member_teams table...');

        // Check if table exists
        const tableCheck = await AppDataSource.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE  table_schema = 'public'
                AND    table_name   = 'team_member_teams'
            );
        `);

        if (!tableCheck[0].exists) {
            console.log('Table team_member_teams does not exist. Creating it...');
            await AppDataSource.query(`
                CREATE TABLE team_member_teams (
                    id SERIAL PRIMARY KEY,
                    member_id INTEGER NOT NULL,
                    team_name VARCHAR(100) NOT NULL,
                    start_date DATE,
                    end_date DATE,
                    status VARCHAR(20) DEFAULT 'pending',
                    price DECIMAL(10, 2) DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            console.log('✅ Table created');
        } else {
            console.log('Table exists, checking columns...');

            // Add member_id if missing
            await AppDataSource.query(`
                ALTER TABLE team_member_teams 
                ADD COLUMN IF NOT EXISTS member_id INTEGER;
            `);

            // Add team_name if missing
            await AppDataSource.query(`
                ALTER TABLE team_member_teams 
                ADD COLUMN IF NOT EXISTS team_name VARCHAR(100);
            `);

            // Add start_date if missing
            await AppDataSource.query(`
                ALTER TABLE team_member_teams 
                ADD COLUMN IF NOT EXISTS start_date DATE;
            `);

            // Add end_date if missing
            await AppDataSource.query(`
                ALTER TABLE team_member_teams 
                ADD COLUMN IF NOT EXISTS end_date DATE;
            `);

            // Add status if missing
            await AppDataSource.query(`
                ALTER TABLE team_member_teams 
                ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
            `);

            // Add price if missing
            await AppDataSource.query(`
                ALTER TABLE team_member_teams 
                ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 0;
            `);

            // Add created_at if missing
            await AppDataSource.query(`
                ALTER TABLE team_member_teams 
                ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
            `);

            console.log('✅ Columns checked/added');
        }

        await AppDataSource.destroy();
    } catch (error) {
        console.error('❌ Error fixing table:', error);
    }
}

fixTeamTable();
