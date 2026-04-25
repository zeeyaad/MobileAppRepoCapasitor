import { AppDataSource } from './database/data-source';
import { TeamMember } from './entities/TeamMember';

async function checkIds() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        const repo = AppDataSource.getRepository(TeamMember);
        const latest = await repo.find({
            order: { id: 'DESC' },
            take: 5
        });

        console.log('--- LATEST TEAM MEMBERS ---');
        latest.forEach(m => {
            console.log(`ID (Primary): ${m.id}, Name: ${m.first_name_en} ${m.last_name_en}, Status: ${m.status}`);
            console.log(`Photo Path in DB: "${m.photo}"`);
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

checkIds();
