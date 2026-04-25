import { AppDataSource } from '../database/data-source';

async function checkMemberTypes() {
    try {
        await AppDataSource.initialize();
        const types = await AppDataSource.query('SELECT * FROM member_types');
        console.log(JSON.stringify(types, null, 2));
        await AppDataSource.destroy();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkMemberTypes();
