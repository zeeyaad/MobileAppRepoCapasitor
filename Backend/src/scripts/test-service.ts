
import { AppDataSource } from '../database/data-source';
import { TeamMemberService } from '../services/TeamMemberService';
import * as fs from 'fs';

async function testService() {
    try {
        await AppDataSource.initialize();
        const service = new TeamMemberService();
        const details = await service.getTeamMemberDetails(22);
        fs.writeFileSync('service-test-output.json', JSON.stringify(details, null, 2));
        console.log('Output written to service-test-output.json');
        await AppDataSource.destroy();
    } catch (err) {
        console.error(err);
    }
}

testService();
