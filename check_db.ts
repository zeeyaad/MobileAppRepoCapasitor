import { AppDataSource } from './Backend/src/database/data-source';
import { TeamMember } from './Backend/src/entities/TeamMember';

async function checkData() {
    try {
        await AppDataSource.initialize();
        const repo = AppDataSource.getRepository(TeamMember);
        const members = await repo.find();
        console.log('--- ALL TEAM MEMBERS ---');
        members.forEach(m => {
            console.log(`Member ID: ${m.id}`);
            console.log(`- Photo: ${m.photo}`);
            console.log(`- Medical: ${m.medical_report}`);
            console.log(`- ID Front: ${m.national_id_front}`);
            console.log(`- ID Back: ${m.national_id_back}`);
            console.log(`- Proof: ${m.proof}`);
            console.log('------------------------');
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
