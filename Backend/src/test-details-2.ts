import { AppDataSource } from './database/data-source';
import { TeamMemberService } from './services/TeamMemberService';

async function test() {
    await AppDataSource.initialize();
    const service = new TeamMemberService();
    const details = await service.getTeamMemberDetails(2);
    console.log('DETAILS_START');
    console.log(JSON.stringify(details, null, 2));
    console.log('DETAILS_END');
    await AppDataSource.destroy();
}
test();
