require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:wxgdY75MzZVWcDSc@db.mnpdqpguszjgnpzvhotr.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false },
});

async function run() {
    try {
        await client.connect();

        // Check account for halawany@gmail.com
        const acc = await client.query(`SELECT * FROM accounts WHERE email = 'halawany@gmail.com'`);
        if (acc.rows.length === 0) {
            console.log('Account not found for halawany@gmail.com');
        } else {
            console.log('Account:', acc.rows[0]);

            const mem = await client.query(`SELECT * FROM members WHERE account_id = $1`, [acc.rows[0].id]);
            if (mem.rows.length > 0) {
                console.log('Member:', mem.rows[0]);
            } else {
                console.log('No member found for this account.');
            }
        }

        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

run();
