require('dotenv').config();
const { AppDataSource } = require('./src/database/data-source');
const AuthController = require('./src/controllers/AuthController').default;

async function run() {
    await AppDataSource.initialize();

    // mock req, res
    const req = {
        user: { account_id: 10, role: 'member' } // Let's find real account_id for halawany
    };

    const acc = await AppDataSource.query(`SELECT id, role FROM accounts WHERE email = 'halawany@gmail.com'`);
    if (acc.length) {
        req.user.account_id = acc[0].id;
        req.user.role = acc[0].role;
    }

    const res = {
        status: (code) => res,
        json: (data) => {
            console.log(JSON.stringify(data, null, 2));
        }
    };

    await AuthController.getCurrentUser(req, res);

    await AppDataSource.destroy();
}

run().catch(console.error);
