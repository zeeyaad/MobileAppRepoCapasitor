import { AppDataSource } from './database/data-source';
const { TeamMember } = require('./entities/TeamMember');

async function check() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(TeamMember);
    const all = await repo.find();
    const fs = require('fs');
    fs.writeFileSync('db_members.json', JSON.stringify(all, null, 2));
    await AppDataSource.destroy();
}
check();
