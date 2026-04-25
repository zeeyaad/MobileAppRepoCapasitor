/**
 * Script to create Media Specialist account
 * Email: Media@club.com, Password: Media123
 */

import 'reflect-metadata';
import { AppDataSource } from '../database/data-source';
import { Account } from '../entities/Account';
import { Staff } from '../entities/Staff';
import { StaffType } from '../entities/StaffType';
import { Privilege } from '../entities/Privilege';
import { PrivilegePackage } from '../entities/PrivilegePackage';
import { StaffPackage } from '../entities/StaffPackage';
import * as bcrypt from 'bcrypt';

async function createMediaAccount() {
    try {
        console.log('🔄 Initializing database connection...');
        await AppDataSource.initialize();
        console.log('✅ Database connected');

        const accountRepo = AppDataSource.getRepository(Account);
        const staffRepo = AppDataSource.getRepository(Staff);
        const staffTypeRepo = AppDataSource.getRepository(StaffType);
        const privilegeRepo = AppDataSource.getRepository(Privilege);
        const packageRepo = AppDataSource.getRepository(PrivilegePackage);
        const staffPackageRepo = AppDataSource.getRepository(StaffPackage);

        // 1. Ensure Media Staff Type exists
        let mediaStaffType = await staffTypeRepo.findOne({ where: { code: 'MEDIA' } });
        if (!mediaStaffType) {
            mediaStaffType = staffTypeRepo.create({
                code: 'MEDIA',
                name_en: 'Media Specialist',
                name_ar: 'المسؤول الإعلامي',
                description_en: 'Responsible for media and communications',
                description_ar: 'مسؤول عن الإعلام والتواصل',
                is_active: true
            });
            mediaStaffType = await staffTypeRepo.save(mediaStaffType);
            console.log('✅ Media Staff Type created');
        }

        // 2. Ensure Media Privileges exist
        const mediaPrivileges = [
            { code: 'media.view', name_en: 'View Media', name_ar: 'عرض الوسائط', module: 'MediaGallery' },
            { code: 'media.create', name_en: 'Create Media', name_ar: 'إضافة وسائط', module: 'MediaGallery' },
            { code: 'media.edit', name_en: 'Edit Media', name_ar: 'تعديل الوسائط', module: 'MediaGallery' },
            { code: 'media.delete', name_en: 'Delete Media', name_ar: 'حذف الوسائط', module: 'MediaGallery' },
        ];

        const savedPrivileges: Privilege[] = [];
        for (const priv of mediaPrivileges) {
            let p = await privilegeRepo.findOne({ where: { code: priv.code } });
            if (!p) {
                p = privilegeRepo.create({
                    ...priv,
                    is_active: true
                });
                p = await privilegeRepo.save(p);
                console.log(`✅ Privilege ${priv.code} created`);
            }
            savedPrivileges.push(p);
        }

        // 3. Ensure Media Package exists
        let mediaPackage = await packageRepo.findOne({ where: { code: 'MEDIA_FULL' } });
        if (!mediaPackage) {
            mediaPackage = packageRepo.create({
                code: 'MEDIA_FULL',
                name_en: 'Full Media Access',
                name_ar: 'صلاحيات الإعلام كاملة',
                description_en: 'Allows all media operations',
                description_ar: 'يسمح بجميع عمليات الإعلام',
                is_active: true
            });
            mediaPackage = await packageRepo.save(mediaPackage);
            console.log('✅ Media Package created');

            // Link privileges to package (manual query for join table)
            for (const p of savedPrivileges) {
                await AppDataSource.query(
                    'INSERT INTO privileges_packages (package_id, privilege_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [mediaPackage.id, p.id]
                );
            }
            console.log('✅ Privileges linked to Media Package');
        }

        // 4. Create Media Account
        const email = 'Media@club.com';
        const password = 'Media123';
        const hashedPassword = await bcrypt.hash(password, 10);

        let mediaAccount = await accountRepo.findOne({ where: { email } });
        if (mediaAccount) {
            console.log('⚠️ Media user account already exists. Updating password...');
            mediaAccount.password = hashedPassword;
            mediaAccount.role = 'MEDIA';
            await accountRepo.save(mediaAccount);
        } else {
            mediaAccount = accountRepo.create({
                email,
                password: hashedPassword,
                role: 'MEDIA',
                status: 'active',
                is_active: true,
            });
            mediaAccount = await accountRepo.save(mediaAccount);
            console.log('✅ Media Account created');
        }

        // 5. Create Media Staff Record
        let mediaStaff = await staffRepo.findOne({ where: { account_id: mediaAccount.id } });
        if (mediaStaff) {
            console.log('⚠️ Media staff record already exists');
        } else {
            mediaStaff = staffRepo.create({
                account_id: mediaAccount.id,
                staff_type_id: mediaStaffType.id,
                first_name_en: 'Media',
                last_name_en: 'Specialist',
                first_name_ar: 'المسؤول',
                last_name_ar: 'الإعلامي',
                national_id: '99999999999999',
                phone: '+201000000000',
                address: 'Club Media Office',
                employment_start_date: new Date(),
                status: 'active',
                is_active: true,
            });
            mediaStaff = await staffRepo.save(mediaStaff);
            console.log('✅ Media Staff record created');
        }

        // 6. Assign Package to Staff
        const existingStaffPackage = await staffPackageRepo.findOne({
            where: { staff_id: mediaStaff.id, package_id: mediaPackage.id }
        });
        if (!existingStaffPackage) {
            const newStaffPackage = new StaffPackage();
            newStaffPackage.staff_id = mediaStaff.id;
            newStaffPackage.package_id = mediaPackage.id;
            await staffPackageRepo.save(newStaffPackage);
            console.log('✅ Media Package assigned to staff');
        }

        console.log('\n' + '='.repeat(50));
        console.log('🎉 MEDIA ACCOUNT CREATED SUCCESSFULLY');
        console.log('='.repeat(50));
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Role:     MEDIA`);
        console.log('='.repeat(50));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

createMediaAccount();
