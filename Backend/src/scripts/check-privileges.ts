import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';
import { Account } from '../entities/Account';
import { Staff } from '../entities/Staff';
import { PrivilegeCalculationService } from '../services/PrivilegeCalculationService';

async function checkMediaPrivileges() {
    try {
        await AppDataSource.initialize();
        const email = 'Media@club.com';

        const accountRepo = AppDataSource.getRepository(Account);
        const account = await accountRepo.findOne({ where: { email } });

        if (!account) {
            console.log('Account not found');
            return;
        }

        const staffRepo = AppDataSource.getRepository(Staff);
        const staff = await staffRepo.findOne({ where: { account_id: account.id } });

        if (!staff) {
            console.log('Staff record not found');
            return;
        }

        console.log(`Checking privileges for Staff ID: ${staff.id} (${email})`);
        const privileges = await PrivilegeCalculationService.calculateFinalPrivilegeCodes(staff.id);

        console.log('Final Privileges:');
        console.log(Array.from(privileges));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkMediaPrivileges();
