import { AppDataSource } from '../database/data-source';

async function finalCheck() {
    try {
        await AppDataSource.initialize();

        console.log('--- TABLE: team_member_teams ---');
        const teamsCols = await AppDataSource.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'team_member_teams';
        `);
        console.log(JSON.stringify(teamsCols, null, 2));

        console.log('\n--- TABLE: team_member_details ---');
        const detailsCols = await AppDataSource.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'team_member_details';
        `);
        console.log(JSON.stringify(detailsCols, null, 2));

        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error:', error);
    }
}

finalCheck();
