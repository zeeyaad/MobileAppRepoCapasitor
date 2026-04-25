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

        console.log('--- LATEST TEAM MEMBERS RAW ---');
        latest.forEach(m => {
            console.log(`ID: ${m.id}`);
            console.log(`Photo RAW: ${JSON.stringify(m.photo)}`);
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await AppDataSource.destroy();
    }
}

checkIds();
