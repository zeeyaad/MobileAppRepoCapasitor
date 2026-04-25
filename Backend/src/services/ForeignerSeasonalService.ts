import { AppDataSource } from '../database/data-source';
import { Repository } from 'typeorm';
import { Member } from '../entities/Member';
import { OutsiderDetail } from '../entities/OutsiderDetail';
import { MemberMembership } from '../entities/MemberMembership';
import { MembershipPlan } from '../entities/MembershipPlan';
import { ActivityLog } from '../entities/ActivityLog';

/**
 * Foreigner/Seasonal Visitor Service
 * Handles registration for foreigners with VISITOR_SEASONAL membership type
 * Two subtypes: visitor-seasonal-egy (Egyptian) and visitor-seasonal-foreigner
 */
export class ForeignerSeasonalService {
  private memberRepository: Repository<Member>;
  private outsiderDetailRepository: Repository<OutsiderDetail>;
  private membershipRepository: Repository<MemberMembership>;
  private membershipPlanRepository: Repository<MembershipPlan>;
  private activityLogRepository: Repository<ActivityLog>;

  constructor() {
    this.memberRepository = AppDataSource.getRepository(Member);
    this.outsiderDetailRepository = AppDataSource.getRepository(OutsiderDetail);
    this.membershipRepository = AppDataSource.getRepository(MemberMembership);
    this.membershipPlanRepository = AppDataSource.getRepository(MembershipPlan);
    this.activityLogRepository = AppDataSource.getRepository(ActivityLog);
  }

  /**
   * Get foreigner seasonal duration options with pricing
   */
  async getSeasonalDurationOptions() {
    return [
      {
        duration_months: 1,
        label_en: '1 Month',
        label_ar: 'شهر واحد',
        price: 100,
        currency: 'USD',
        plan_code: 'FOREIGNER_MONTH',
      },
      {
        duration_months: 6,
        label_en: '6 Months',
        label_ar: '6 أشهر',
        price: 500,
        currency: 'USD',
        plan_code: 'FOREIGNER_6M',
      },
      {
        duration_months: 12,
        label_en: '1 Year',
        label_ar: 'سنة واحدة',
        price: 1000,
        currency: 'USD',
        plan_code: 'FOREIGNER_YEAR',
      },
    ];
  }

  /**
   * Get visa status options
   */
  getVisaStatusOptions() {
    return [
      {
        code: 'valid',
        label_en: 'Valid',
        label_ar: 'ساري',
      },
      {
        code: 'expired',
        label_en: 'Expired',
        label_ar: 'منتهي',
      },
      {
        code: 'pending',
        label_en: 'Pending',
        label_ar: 'قيد الانتظار',
      },
    ];
  }

  /**
   * Get payment options (installments or lump sum)
   */
  getPaymentOptions() {
    return [
      {
        code: 'full',
        label_en: 'Full Payment',
        label_ar: 'الدفع الكامل',
        installments: 1,
      },
      {
        code: 'installments',
        label_en: 'Installments',
        label_ar: 'أقساط',
        installments: 2,
      },
    ];
  }

  /**
   * Submit detailed info for foreigner/seasonal visitor member
   */
  async submitForeignerSeasonalDetailedInfo(memberData: {
    member_id: number;
    seasonal_type: string; // seasonal-egy or seasonal-foreigner
    duration_months: number; // 1, 6, or 12
    payment_type: string; // full or installments
    passport_number?: string;
    passport_photo?: string;
    country?: string; // Required for seasonal-foreigner
    visa_status?: string; // valid, expired, pending
    // File paths
    national_id_front?: string;
    national_id_back?: string;
    personal_photo?: string;
    medical_report?: string;
    address?: string;
  }) {
    // Validate seasonal type
    const validSeasonalTypes = ['seasonal-egy', 'seasonal-foreigner'];
    if (!validSeasonalTypes.includes(memberData.seasonal_type)) {
      throw new Error('Invalid seasonal_type. Must be seasonal-egy or seasonal-foreigner');
    }

    // Validate duration
    const validDurations = [1, 6, 12];
    if (!validDurations.includes(memberData.duration_months)) {
      throw new Error('Invalid duration_months. Must be 1, 6, or 12');
    }

    // Validate country for seasonal-foreigner
    if (memberData.seasonal_type === 'seasonal-foreigner' && !memberData.country) {
      throw new Error('Country is required for seasonal-foreigner members');
    }

    // Validate payment type
    const validPaymentTypes = ['full', 'installments'];
    if (!validPaymentTypes.includes(memberData.payment_type)) {
      throw new Error('Invalid payment_type. Must be full or installments');
    }

    // ========================================================================
    // VALIDATE ESSENTIAL FILES (photo, passport, medical) - Must not be null/missing
    // Foreigners use passport_photo instead of national_id_front/national_id_back
    // ========================================================================
    const missingFiles: string[] = [];
    if (!memberData.personal_photo) missingFiles.push('personal_photo');
    if (!memberData.passport_photo) missingFiles.push('passport_photo');
    if (!memberData.medical_report) missingFiles.push('medical_report');

    // DEBUG: Log file validation
    console.log(`🔍 File validation for member ${memberData.member_id}:`, {
      personal_photo: memberData.personal_photo || 'MISSING',
      passport_photo: memberData.passport_photo || 'MISSING',
      medical_report: memberData.medical_report || 'MISSING',
      missingFiles,
    });

    if (missingFiles.length > 0) {
      // Log but don't delete - let frontend handle cleanup
      console.log(`⚠️  Member ${memberData.member_id} missing files: ${missingFiles.join(', ')}`);
      console.log('📋 Frontend should have prevented this with pre-validation');
      
      throw new Error(`Essential files are missing for foreigner member: ${missingFiles.join(', ')}. Please upload all required files.`);
    }

    // Update member with photos and documents
    const updateData: Record<string, unknown> = {};
    if (memberData.personal_photo) updateData.photo = memberData.personal_photo;
    if (memberData.passport_photo) updateData.national_id_front = memberData.passport_photo; // Store passport as national_id_front for foreigners
    if (memberData.medical_report) updateData.medical_report = memberData.medical_report;
    if (memberData.address) updateData.address = memberData.address;
    if (Object.keys(updateData).length > 0) {
      await this.memberRepository.update({ id: memberData.member_id }, updateData);
    }

    // Create or update outsider details with seasonal/foreigner info
    let outsider = await this.outsiderDetailRepository.findOne({
      where: { member_id: memberData.member_id },
    });

    if (!outsider) {
      await this.outsiderDetailRepository.insert({
        member_id: memberData.member_id,
        visitor_type: memberData.seasonal_type,
        passport_number: memberData.passport_number || null,
        passport_photo: memberData.passport_photo || null,
        country: memberData.country || null,
        visa_status: memberData.visa_status || null,
        duration_months: memberData.duration_months,
        is_installable: memberData.payment_type === 'installments',
      });

      outsider = await this.outsiderDetailRepository.findOne({
        where: { member_id: memberData.member_id },
      });
    } else {
      outsider.visitor_type = memberData.seasonal_type;
      outsider.passport_number = memberData.passport_number || null;
      outsider.passport_photo = memberData.passport_photo || null;
      outsider.country = memberData.country || null;
      outsider.visa_status = memberData.visa_status || null;
      outsider.duration_months = memberData.duration_months;
      outsider.is_installable = memberData.payment_type === 'installments';
      await this.outsiderDetailRepository.save(outsider);
    }

    // Log activity
    await this.activityLogRepository.insert({
      member_id: memberData.member_id,
      action: 'seasonal_foreigner_info_submitted',
      description: `Submitted detailed information for ${memberData.seasonal_type} membership (${memberData.duration_months} months)`,
      action_date: new Date(),
    });

    return {
      success: true,
      message: 'Foreigner/seasonal member details saved successfully',
      outsider_id: outsider?.id,
      payment_info: {
        payment_type: memberData.payment_type,
        duration_months: memberData.duration_months,
        installments_available: memberData.payment_type === 'installments',
        currency: 'USD',
      },
    };
  }

  /**
   * Calculate membership end date and pricing details
   */
  async getMembershipPricingDetails(duration_months: number) {
    const durations: { [key: number]: { price: number; currency: string; plan_code: string } } = {
      1: { price: 100, currency: 'USD', plan_code: 'FOREIGNER_MONTH' },
      6: { price: 500, currency: 'USD', plan_code: 'FOREIGNER_6M' },
      12: { price: 1000, currency: 'USD', plan_code: 'FOREIGNER_YEAR' },
    };

    if (!durations[duration_months]) {
      throw new Error('Invalid duration_months');
    }

    const pricing = durations[duration_months];

    return {
      duration_months,
      total_price: pricing.price,
      currency: pricing.currency,
      plan_code: pricing.plan_code,
      installment_options: [
        {
          option: 'full',
          label_en: 'Full Payment',
          label_ar: 'الدفع الكامل',
          amount: pricing.price,
          installments: 1,
        },
        {
          option: 'installments',
          label_en: 'Installments (2 parts)',
          label_ar: 'أقساط (جزئين)',
          amount: pricing.price / 2,
          installments: 2,
          first_installment: pricing.price / 2,
          second_installment: pricing.price / 2,
        },
      ],
    };
  }

  /**
   * Create membership subscription for foreigner/seasonal member
   */
  async createSeasonalMembership(memberData: {
    member_id: number;
    duration_months: number;
    payment_type: string; // full or installments
  }) {
    // Get or find the FOREIGNER membership plan
    const planCode = {
      1: 'FOREIGNER_MONTH',
      6: 'FOREIGNER_6M',
      12: 'FOREIGNER_YEAR',
    }[memberData.duration_months];

    if (!planCode) {
      throw new Error('Invalid duration_months');
    }

    const plan = await this.membershipPlanRepository.findOne({
      where: { plan_code: planCode },
    });

    if (!plan) {
      throw new Error(`Membership plan ${planCode} not found`);
    }

    // Calculate end date
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + memberData.duration_months);

    // Create membership
    const result = await this.membershipRepository.insert({
      member_id: memberData.member_id,
      membership_plan_id: plan.id,
      start_date: startDate,
      end_date: endDate,
      status: 'active',
      payment_status: memberData.payment_type === 'installments' ? 'partial' : 'paid',
    });

    // Log activity
    await this.activityLogRepository.insert({
      member_id: memberData.member_id,
      action: 'membership_created',
      description: `Seasonal foreigner membership created for ${memberData.duration_months} months (${memberData.payment_type} payment)`,
      action_date: new Date(),
    });

    return {
      success: true,
      message: 'Membership subscription created successfully',
      membership_id: result.identifiers[0].id,
      details: {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        duration_months: memberData.duration_months,
        payment_status: memberData.payment_type === 'installments' ? 'partial' : 'paid',
        plan_code: planCode,
      },
    };
  }

  /**
   * Get foreigner member status with all details
   */
  async getForeignerMemberStatus(memberId: number) {
    const member = await this.memberRepository.findOne({
      where: { id: memberId },
      relations: ['member_type', 'memberships'],
    });

    if (!member) {
      throw new Error('Member not found');
    }

    const outsider = await this.outsiderDetailRepository.findOne({
      where: { member_id: memberId },
    });

    const membership = await this.membershipRepository.findOne({
      where: { member_id: memberId },
      order: { created_at: 'DESC' },
      relations: ['membership_plan'],
    });

    return {
      member_id: member.id,
      member_type: 'FOREIGNER',
      status: member.status,
      seasonal_type: outsider?.visitor_type,
      duration_months: outsider?.duration_months,
      passport_number: outsider?.passport_number,
      country: outsider?.country,
      visa_status: outsider?.visa_status,
      is_installable: outsider?.is_installable,
      membership_active: membership ? true : false,
      membership_details: membership
        ? {
            start_date: membership.start_date.toISOString().split('T')[0],
            end_date: membership.end_date.toISOString().split('T')[0],
            status: membership.status,
            payment_status: membership.payment_status,
            plan_code: membership.membership_plan.plan_code,
          }
        : null,
      documents_uploaded: {
        passport_photo: !!outsider?.passport_photo,
        national_id_front: !!member.national_id_front,
        national_id_back: !!member.national_id_back,
        personal_photo: !!member.photo,
        medical_report: !!member.medical_report,
      },
    };
  }
}

export default new ForeignerSeasonalService();
