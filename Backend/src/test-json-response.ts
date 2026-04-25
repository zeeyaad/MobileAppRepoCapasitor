import axios from 'axios';

async function checkDetails() {
    try {
        const { AppDataSource } = require('./database/data-source');
        const { TeamMember } = require('./entities/TeamMember');
        if (!AppDataSource.isInitialized) await AppDataSource.initialize();
        const latest = await AppDataSource.getRepository(TeamMember).findOne({ order: { id: 'DESC' } });
        if (!latest) throw new Error('No members found');

        const memberId = latest.id;
        console.log(`\n--- Fetching details for LATEST member ID: ${memberId} ---`);
        const res = await axios.get(`http://localhost:3000/api/register/team-member/details/${memberId}`);
        console.log('Response Status:', res.status);
        console.log('FULL DATA:', JSON.stringify(res.data.data, null, 2));
        await AppDataSource.destroy();
    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

checkDetails();
