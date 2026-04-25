import { AppDataSource } from '../database/data-source';
import { MemberType } from '../entities/MemberType';

async function seedMemberTypes() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');

        const memberTypeRepo = AppDataSource.getRepository(MemberType);

        const types = [
            { code: 'REGULAR', name_en: 'Regular Member', name_ar: 'عضو عادي' },
            { code: 'STUDENT', name_en: 'Student Member', name_ar: 'عضو طالب' },
            { code: 'DEPENDENT', name_en: 'Dependent Member', name_ar: 'عضو تابع' },
            { code: 'SEASONAL', name_en: 'Seasonal Member', name_ar: 'عضو موسمي' },
            { code: 'TEAM_MEMBER', name_en: 'Team Member', name_ar: 'عضو فريق' },
            { code: 'RETIRED', name_en: 'Retired Member', name_ar: 'عضو بالمعاش' },
            { code: 'EMPLOYEE', name_en: 'Employee Member', name_ar: 'عضو موظف' },
        ];

        for (const type of types) {
            const existing = await memberTypeRepo.findOne({ where: { code: type.code } });
            if (!existing) {
                const newType = memberTypeRepo.create(type);
                await memberTypeRepo.save(newType);
                console.log(`✅ Created member type: ${type.code}`);
            } else {
                console.log(`ℹ️ Member type ${type.code} already exists`);
            }
        }

        await AppDataSource.destroy();
    } catch (error) {
        console.error('❌ Error seeding member types:', error);
    }
}

seedMemberTypes();
