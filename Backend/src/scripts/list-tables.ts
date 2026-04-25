import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';

async function listTables() {
    try {
        await AppDataSource.initialize();
        const tables = await AppDataSource.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables in database:');
        console.log(tables.map((t: any) => t.table_name));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

listTables();
