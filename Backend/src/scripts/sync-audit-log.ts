
import { AppDataSource } from '../database/data-source';

async function syncAuditLog() {
    try {
        console.log('🔄 Initializing TypeORM connection for AuditLog Sync...');

        // This is a bit of a hack to force sync, but safer than modifying the source globally
        AppDataSource.setOptions({ synchronize: true });

        await AppDataSource.initialize();
        console.log('✅ TypeORM Data Source has been initialized!');

        // With synchronize: true, initialization should create the table.
        // But let's verify if we want to run migrations or manual sync.
        // AppDataSource.synchronize() can be called explicitly too.

        console.log('🔄 Forcing schema synchronization...');
        await AppDataSource.synchronize();
        console.log('✅ Schema synchronization complete.');

        console.log('✅ audit_logs table should now exist.');

        await AppDataSource.destroy();
        console.log('Connection closed.');
        process.exit(0);
    } catch (err) {
        console.error('Error during Data Source initialization:', err);
        process.exit(1);
    }
}

syncAuditLog();
