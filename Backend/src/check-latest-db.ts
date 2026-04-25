import { AppDataSource } from './database/data-source';
import { TeamMember } from './entities/TeamMember';

async function checkLatest() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(TeamMember);
    const latest = await repo.find({
        order: { id: 'DESC' },
        take: 5
    });

    console.log('--- LATEST TEAM MEMBERS ---');
    latest.forEach(m => {
        console.log(`ID: ${m.id}`);
        console.log(`Photo: ${m.photo}`);
        console.log(`ID Front: ${m.national_id_front}`);
        console.log(`ID Back: ${m.national_id_back}`);
        console.log(`Medical: ${m.medical_report}`);
        console.log(`Proof: ${m.proof}`);
        console.log('---------------------------');
    });
    await AppDataSource.destroy();
}

checkLatest().catch(console.error);
