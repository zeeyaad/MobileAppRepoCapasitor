/**
 * Seed script to populate default membership plans
 * Run with: npx ts-node backend/src/seeds/membership-plans.seed.ts
 */

import { AppDataSource } from '../database/data-source';
import { MembershipPlan } from '../entities/MembershipPlan';

async function seedMembershipPlans() {
    try {
        // Initialize connection
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('✅ Database connection established');
        }

        const planRepository = AppDataSource.getRepository(MembershipPlan);

        // Define default plans
        const defaultPlans = [
            {
                plan_code: 'ANNUAL',
                name_en: 'Annual Membership',
                name_ar: 'عضوية سنوية',
                duration_months: 12,
                price: 500.00,
                is_renewable: true,
                plan_type: 'REGULAR',
                description_en: 'Standard annual membership plan',
                description_ar: 'خطة العضوية السنوية القياسية'
            },
            {
                plan_code: 'STUDENT',
                name_en: 'Student Membership',
                name_ar: 'عضوية طلاب',
                duration_months: 12,
                price: 200.00,
                is_renewable: true,
                plan_type: 'STUDENT',
                description_en: 'Discounted membership for university students',
                description_ar: 'عضوية مخفضة لطلاب الجامعة'
            },
            {
                plan_code: 'DEPENDENT',
                name_en: 'Dependent Membership',
                name_ar: 'عضوية تابعة',
                duration_months: 12,
                price: 300.00,
                is_renewable: true,
                plan_type: 'DEPENDENT',
                description_en: 'Membership for family members of existing members',
                description_ar: 'عضوية لأفراد عائلة الأعضاء الحاليين'
            },
            {
                plan_code: 'SEASONAL',
                name_en: 'Seasonal Membership',
                name_ar: 'عضوية موسمية',
                duration_months: 3,
                price: 400.00,
                is_renewable: true,
                plan_type: 'SEASONAL',
                description_en: 'Short-term membership for foreigners',
                description_ar: 'عضوية قصيرة المدى للأجانب'
            },
            {
                plan_code: 'FULL_ACCESS',
                name_en: 'Full Access Membership',
                name_ar: 'عضوية كاملة',
                duration_months: 12,
                price: 500.00,
                is_renewable: true,
                plan_type: 'REGULAR',
                description_en: 'Full access membership plan',
                description_ar: 'خطة عضوية بصلاحيات كاملة'
            }
        ];

        // Insert or update plans
        for (const planData of defaultPlans) {
            const existing = await planRepository.findOne({
                where: { plan_code: planData.plan_code }
            });

            if (existing) {
                console.log(`⚠️  Plan "${planData.plan_code}" already exists, skipping...`);
            } else {
                const newPlan = planRepository.create(planData);
                await planRepository.save(newPlan);
                console.log(`✅ Created plan: ${planData.plan_code} (${planData.name_en})`);
            }
        }

        console.log('\n✅ Membership plans seeding completed successfully!');
        await AppDataSource.destroy();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding membership plans:', error);
        await AppDataSource.destroy();
        process.exit(1);
    }
}

// Run the seed
seedMembershipPlans();
