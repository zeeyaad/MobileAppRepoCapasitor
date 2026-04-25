require('dotenv').config();
const { AppDataSource } = require('./src/database/data-source');
const AuthController = require('./src/controllers/AuthController').default;

async function run() {
    await AppDataSource.initialize();

    // Find real account for halawany
    const acc = await AppDataSource.query(`SELECT m.id as member_id, a.id as account_id, a.role FROM accounts a JOIN members m ON a.id = m.account_id WHERE a.email = 'halawany@gmail.com'`);

    if (!acc.length) {
        console.log('Account not found');
        return;
    }

    const req = {
        user: { account_id: acc[0].account_id, member_id: acc[0].member_id, role: acc[0].role },
        body: {
            phone: '01012345678',
            address: 'Test Address',
            birthdate: '1990-01-01',
            photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAZABkAAD...' // fake short base64
        }
    };

    const res = {
        status: (code) => res,
        json: (data) => console.log('Response:', JSON.stringify(data, null, 2))
    };

    await AuthController.updateMyProfile(req, res);

    await AppDataSource.destroy();
}

run().catch(console.error);
