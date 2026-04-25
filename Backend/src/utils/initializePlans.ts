/**
 * Initialize default membership plans if they don't exist
 * This ensures the registration flow works correctly
 */
import { AppDataSource } from '../database/data-source';
import { MembershipPlan } from '../entities/MembershipPlan';
import { MemberType } from '../entities/MemberType';

export async function initializeDefaultPlans() {
    try {
        const planRepository = AppDataSource.getRepository(MembershipPlan);
        const memberTypeRepository = AppDataSource.getRepository(MemberType);

        const requiredMemberTypes = [
            { code: 'REGULAR', name_en: 'Regular Member', name_ar: 'عضو عادي' },
            { code: 'STUDENT', name_en: 'Student Member', name_ar: 'عضو طالب' },
            { code: 'DEPENDENT', name_en: 'Dependent Member', name_ar: 'عضو تابع' },
            { code: 'SEASONAL', name_en: 'Seasonal Member', name_ar: 'عضو موسمي' },
        ];

        for (const type of requiredMemberTypes) {
            const existingType = await memberTypeRepository.findOne({
                where: { code: type.code },
            });

            if (!existingType) {
                const newType = memberTypeRepository.create(type);
                await memberTypeRepository.save(newType);
                console.log(`✅ Created member type: ${type.code}`);
            }
        }

        // Map plan codes to member type codes
        const planMemberTypeMap = {
            'ANNUAL': 'REGULAR',
            'STUDENT': 'STUDENT',
            'DEPENDENT': 'DEPENDENT',
            'SEASONAL': 'SEASONAL',
            'FULL_ACCESS': 'REGULAR'
        };

        const defaultPlans = [
            {
                plan_code: 'ANNUAL',
                name_en: 'Annual Membership',
                name_ar: 'عضوية سنوية',
                duration_months: 12,
                price: 500.00,
                description_en: 'Standard annual membership plan',
                description_ar: 'خطة العضوية السنوية القياسية'
            },
            {
                plan_code: 'STUDENT',
                name_en: 'Student Membership',
                name_ar: 'عضوية طلاب',
                duration_months: 12,
                price: 200.00,
                description_en: 'Discounted membership for university students',
                description_ar: 'عضوية مخفضة لطلاب الجامعة'
            },
            {
                plan_code: 'DEPENDENT',
                name_en: 'Dependent Membership',
                name_ar: 'عضوية تابعة',
                duration_months: 12,
                price: 300.00,
                description_en: 'Membership for family members',
                description_ar: 'عضوية لأفراد العائلة'
            },
            {
                plan_code: 'SEASONAL',
                name_en: 'Seasonal Membership',
                name_ar: 'عضوية موسمية',
                duration_months: 3,
                price: 400.00,
                description_en: 'Short-term membership',
                description_ar: 'عضوية قصيرة المدى'
            },
            {
                plan_code: 'FULL_ACCESS',
                name_en: 'Full Access',
                name_ar: 'عضوية كاملة',
                duration_months: 12,
                price: 500.00,
                description_en: 'Full access plan',
                description_ar: 'خطة بصلاحيات كاملة'
            }
        ];

        for (const planData of defaultPlans) {
            const existing = await planRepository.findOne({
                where: { plan_code: planData.plan_code }
            });

            if (!existing) {
                // Get member type based on plan code
                const memberTypeCode = planMemberTypeMap[planData.plan_code as keyof typeof planMemberTypeMap];
                const memberType = await memberTypeRepository.findOne({
                    where: { code: memberTypeCode }
                });

                if (!memberType) {
                    console.error(`❌ Member type not found for code: ${memberTypeCode}`);
                    continue;
                }

                const newPlan = planRepository.create({
                    ...planData,
                    member_type_id: memberType.id
                });
                await planRepository.save(newPlan);
                console.log(`✅ Created membership plan: ${planData.plan_code} (member_type_id: ${memberType.id})`);
            }
        }

    } catch (error) {
        console.error('⚠️  Error initializing membership plans:', error);
        // Don't throw - let server continue even if seeding fails
    }
}
