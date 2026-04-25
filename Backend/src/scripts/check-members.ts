
import { AppDataSource } from '../database/data-source';
import { TeamMember } from '../entities/TeamMember';
import * as fs from 'fs';

async function checkTeamMembers() {
    try {
        await AppDataSource.initialize();
        const repo = AppDataSource.getRepository(TeamMember);
        const members = await repo.find();
        let out = '--- DB CHECK START ---\n';
        out += `Total Team Members: ${members.length}\n`;
        members.forEach(m => {
            out += `ID: ${m.id}, NationalID: ${m.national_id}, Name: ${m.first_name_ar} ${m.last_name_ar}, CreatedAt: ${m.created_at}\n`;
        });
        out += '--- DB CHECK END ---\n';
        fs.writeFileSync('db-check-id.txt', out);
        console.log('Output written to db-check-id.txt');
        await AppDataSource.destroy();
    } catch (err) {
        console.error(err);
    }
}

checkTeamMembers();
