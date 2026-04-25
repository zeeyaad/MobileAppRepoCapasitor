/**
 * Script to add SportActivityManager and SportActivitySpecialist staff types
 * Run with: npm run add:sport-staff-types
 */

import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';
import { StaffType } from '../entities/StaffType';

async function addSportStaffTypes() {
    try {
        console.log('🔄 Initializing database connection...');
        await AppDataSource.initialize();
        console.log('✅ Database connected');

        const staffTypeRepository = AppDataSource.getRepository(StaffType);

        // Check if sport staff types already exist
        const existingManager = await staffTypeRepository.findOne({
            where: { code: 'SPORT_MANAGER' },
        });

        const existingSpecialist = await staffTypeRepository.findOne({
            where: { code: 'SPORT_SPECIALIST' },
        });

        const staffTypesToAdd: StaffType[] = [];

        // Add Sport Activity Manager
        if (!existingManager) {
            const sportManager = staffTypeRepository.create({
                code: 'SPORT_MANAGER',
                name_en: 'Sport Activity Manager',
                name_ar: 'مدير الأنشطة الرياضية',
                description_en: 'Can create sports with active status, approve pending sports, set prices, and manage all sport activities',
                description_ar: 'يمكنه إنشاء رياضات بحالة نشطة، الموافقة على الرياضات المعلقة، تحديد الأسعار، وإدارة جميع الأنشطة الرياضية',
                is_active: true,
            });
            staffTypesToAdd.push(sportManager);
            console.log('➕ Adding Sport Activity Manager...');
        } else {
            console.log('⚠️  Sport Activity Manager already exists');
        }

        // Add Sport Activity Specialist
        if (!existingSpecialist) {
            const sportSpecialist = staffTypeRepository.create({
                code: 'SPORT_SPECIALIST',
                name_en: 'Sport Activity Specialist',
                name_ar: 'أخصائي الأنشطة الرياضية',
                description_en: 'Can create sports with pending status (requires manager approval), cannot set prices',
                description_ar: 'يمكنه إنشاء رياضات بحالة معلقة (تتطلب موافقة المدير)، لا يمكنه تحديد الأسعار',
                is_active: true,
            });
            staffTypesToAdd.push(sportSpecialist);
            console.log('➕ Adding Sport Activity Specialist...');
        } else {
            console.log('⚠️  Sport Activity Specialist already exists');
        }

        // Save new staff types
        if (staffTypesToAdd.length > 0) {
            await staffTypeRepository.save(staffTypesToAdd);
            console.log(`✅ Successfully added ${staffTypesToAdd.length} sport staff type(s)`);

            // Display the IDs
            const manager = await staffTypeRepository.findOne({
                where: { code: 'SPORT_MANAGER' },
            });
            const specialist = await staffTypeRepository.findOne({
                where: { code: 'SPORT_SPECIALIST' },
            });

            console.log('\n📋 Staff Type IDs:');
            if (manager) {
                console.log(`   Sport Activity Manager: ID = ${manager.id}`);
            }
            if (specialist) {
                console.log(`   Sport Activity Specialist: ID = ${specialist.id}`);
            }
        } else {
            console.log('ℹ️  No new staff types to add');
        }

        console.log('\n✅ Script completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding sport staff types:', error);
        process.exit(1);
    }
}

// Run the script
addSportStaffTypes();
