import { AppDataSource } from './database/data-source';
import { TeamMemberService } from './services/TeamMemberService';

async function testGetService() {
    try {
        await AppDataSource.initialize();
        const service = new TeamMemberService();

        // Find a member that has photos
        const repo = AppDataSource.getRepository(TeamMemberService as any); // Not really, but we'll use the one from service if we can
        // Re-use logic from check-data
        const teamMemberRepo = AppDataSource.getRepository(require('./entities/TeamMember').TeamMember);
        const members = await teamMemberRepo.find();

        if (members.length > 0) {
            const memberId = members[0].id;
            console.log(`🔍 Testing for member ID: ${memberId}`);
            const details = await service.getTeamMemberDetails(memberId);
            console.log('✅ Details:', JSON.stringify(details, null, 2));
        } else {
            console.log('❌ No members found');
        }

        await AppDataSource.destroy();
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

testGetService();
