import { AppDataSource } from './database/data-source';
import { TeamMember } from './entities/TeamMember';

async function checkTeamMembers() {
    try {
        await AppDataSource.initialize();
        const repo = AppDataSource.getRepository(TeamMember);
        const members = await repo.find();

        const result = members.map(m => ({
            id: m.id,
            name: `${m.first_name_en} ${m.last_name_en}`,
            photos: {
                photo: m.photo,
                id_front: m.national_id_front,
                id_back: m.national_id_back,
                report: m.medical_report,
                proof: m.proof
            }
        }));

        console.log(JSON.stringify(result, null, 2));
        await AppDataSource.destroy();
    } catch (err) {
        process.exit(1);
    }
}

checkTeamMembers();
