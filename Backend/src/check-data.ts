import { AppDataSource } from './database/data-source';
import { TeamMember } from './entities/TeamMember';

async function checkTeamMembers() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connected');

        const repo = AppDataSource.getRepository(TeamMember);
        const members = await repo.find();

        console.log(`Found ${members.length} team members:`);
        members.forEach(m => {
            console.log(`ID: ${m.id}, Name: ${m.first_name_en} ${m.last_name_en}`);
            console.log(`  Photo: ${m.photo}`);
            console.log(`  ID Front: ${m.national_id_front}`);
            console.log(`  ID Back: ${m.national_id_back}`);
            console.log(`  Medical: ${m.medical_report}`);
            console.log(`  Proof: ${m.proof}`);
            console.log('-------------------');
        });

        await AppDataSource.destroy();
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

checkTeamMembers();
