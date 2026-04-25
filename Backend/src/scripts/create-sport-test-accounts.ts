/**
 * Script to create test staff accounts for Sport Activity Management
 * Creates one Manager and one Specialist with proper credentials
 * Run with: npm run create:sport-test-accounts
 */

import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';
import { Account } from '../entities/Account';
import { Staff } from '../entities/Staff';
import { StaffType } from '../entities/StaffType';
import * as bcrypt from 'bcrypt';

async function createSportTestAccounts() {
    try {
        console.log('🔄 Initializing database connection...');
        await AppDataSource.initialize();
        console.log('✅ Database connected');

        const accountRepository = AppDataSource.getRepository(Account);
        const staffRepository = AppDataSource.getRepository(Staff);
        const staffTypeRepository = AppDataSource.getRepository(StaffType);

        // Get staff type IDs
        const sportManagerType = await staffTypeRepository.findOne({
            where: { code: 'SPORT_MANAGER' },
        });

        const sportSpecialistType = await staffTypeRepository.findOne({
            where: { code: 'SPORT_SPECIALIST' },
        });

        if (!sportManagerType || !sportSpecialistType) {
            console.error('❌ Sport staff types not found. Please run: npm run add:sport-staff-types');
            process.exit(1);
        }

        console.log('\n📋 Found Staff Types:');
        console.log(`   Sport Manager ID: ${sportManagerType.id}`);
        console.log(`   Sport Specialist ID: ${sportSpecialistType.id}`);

        // Password for both accounts (will be hashed)
        const testPassword = 'Test123456';
        const hashedPassword = await bcrypt.hash(testPassword, 10);

        // ========================================
        // 1. Create Sport Activity Manager
        // ========================================
        console.log('\n📝 Creating Sport Activity Manager...');

        // Check if manager account already exists
        let managerAccount = await accountRepository.findOne({
            where: { email: 'sport.manager@helwan.test' },
        });

        if (managerAccount) {
            console.log('   ⚠️  Manager account already exists');
        } else {
            managerAccount = accountRepository.create({
                email: 'sport.manager@helwan.test',
                password: hashedPassword,
                role: 'staff',
                status: 'active',
                is_active: true,
            });
            managerAccount = await accountRepository.save(managerAccount);
            console.log(`   ✅ Manager account created (ID: ${managerAccount.id})`);
        }

        // Create manager staff record
        let managerStaff = await staffRepository.findOne({
            where: { account_id: managerAccount.id },
        });

        if (managerStaff) {
            console.log('   ⚠️  Manager staff record already exists');
        } else {
            managerStaff = staffRepository.create({
                account_id: managerAccount.id,
                staff_type_id: sportManagerType.id,
                first_name_en: 'Ahmed',
                first_name_ar: 'أحمد',
                last_name_en: 'Hassan',
                last_name_ar: 'حسن',
                national_id: '29901011234567',
                phone: '+201234567890',
                address: 'Cairo, Egypt',
                employment_start_date: new Date('2024-01-01'),
                status: 'active',
                is_active: true,
            });
            managerStaff = await staffRepository.save(managerStaff);
            console.log(`   ✅ Manager staff record created (ID: ${managerStaff.id})`);
        }

        // ========================================
        // 2. Create Sport Activity Specialist
        // ========================================
        console.log('\n📝 Creating Sport Activity Specialist...');

        // Check if specialist account already exists
        let specialistAccount = await accountRepository.findOne({
            where: { email: 'sport.specialist@helwan.test' },
        });

        if (specialistAccount) {
            console.log('   ⚠️  Specialist account already exists');
        } else {
            specialistAccount = accountRepository.create({
                email: 'sport.specialist@helwan.test',
                password: hashedPassword,
                role: 'staff',
                status: 'active',
                is_active: true,
            });
            specialistAccount = await accountRepository.save(specialistAccount);
            console.log(`   ✅ Specialist account created (ID: ${specialistAccount.id})`);
        }

        // Create specialist staff record
        let specialistStaff = await staffRepository.findOne({
            where: { account_id: specialistAccount.id },
        });

        if (specialistStaff) {
            console.log('   ⚠️  Specialist staff record already exists');
        } else {
            specialistStaff = staffRepository.create({
                account_id: specialistAccount.id,
                staff_type_id: sportSpecialistType.id,
                first_name_en: 'Sara',
                first_name_ar: 'سارة',
                last_name_en: 'Ali',
                last_name_ar: 'علي',
                national_id: '29902021234568',
                phone: '+201234567891',
                address: 'Giza, Egypt',
                employment_start_date: new Date('2024-02-01'),
                status: 'active',
                is_active: true,
            });
            specialistStaff = await staffRepository.save(specialistStaff);
            console.log(`   ✅ Specialist staff record created (ID: ${specialistStaff.id})`);
        }

        // ========================================
        // Summary
        // ========================================
        console.log('\n' + '='.repeat(70));
        console.log('✅ TEST ACCOUNTS CREATED SUCCESSFULLY');
        console.log('='.repeat(70));

        console.log('\n🔑 LOGIN CREDENTIALS:');
        console.log('\n1️⃣  Sport Activity Manager:');
        console.log(`   Email:    sport.manager@helwan.test`);
        console.log(`   Password: ${testPassword}`);
        console.log(`   Staff ID: ${managerStaff.id}`);
        console.log(`   Type ID:  ${sportManagerType.id}`);

        console.log('\n2️⃣  Sport Activity Specialist:');
        console.log(`   Email:    sport.specialist@helwan.test`);
        console.log(`   Password: ${testPassword}`);
        console.log(`   Staff ID: ${specialistStaff.id}`);
        console.log(`   Type ID:  ${sportSpecialistType.id}`);

        console.log('\n📝 NEXT STEPS:');
        console.log('1. Login to get JWT tokens:');
        console.log('   POST http://localhost:3000/api/auth/login');
        console.log('   Body: { "email": "sport.manager@helwan.test", "password": "Test123456" }');
        console.log('\n2. Use the returned token to test sport endpoints');
        console.log('   Authorization: Bearer <your_token>');

        console.log('\n' + '='.repeat(70));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test accounts:', error);
        process.exit(1);
    }
}

// Run the script
createSportTestAccounts();
