import { AppDataSource } from './database/data-source';
import { TeamMember } from './entities/TeamMember';
import { TeamMemberTeam } from './entities/TeamMemberTeam';

async function check() {
    await AppDataSource.initialize();
    const members = await AppDataSource.getRepository(TeamMember).find();
    console.log(`TOTAL MEMBERS: ${members.length}`);
    for (const m of members) {
        const joined = await AppDataSource.getRepository(TeamMemberTeam).find({
            where: { team_member_id: m.id },
            relations: ['team', 'team.sport']
        });
        console.log(`Member ID: ${m.id}, Name: ${m.first_name_ar} ${m.last_name_ar}, Status: ${m.status}, Joined: ${joined.length}`);
        joined.forEach(j => console.log(`  - Team: ${j.team.name_ar}, Sport: ${j.team.sport?.name_ar}, Status: ${j.status}`));
    }
    await AppDataSource.destroy();
}

check().catch(console.error);
