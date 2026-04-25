import { AppDataSource } from './database/data-source';
import { TeamMember } from './entities/TeamMember';

async function listMembers() {
    try {
        await AppDataSource.initialize();
        const members = await AppDataSource.getRepository(TeamMember).find({
            order: { id: 'DESC' },
            take: 5
        });
        console.log('--- CLEAN LIST ---');
        members.forEach(m => {
            console.log(`ID: ${m.id}, Name: ${m.first_name_en} ${m.last_name_en}, Photo: ${m.photo}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await AppDataSource.destroy();
    }
}
listMembers();
