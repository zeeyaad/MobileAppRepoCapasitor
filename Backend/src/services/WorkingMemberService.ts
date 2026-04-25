import { AppDataSource } from '../database/data-source';
import { Repository } from 'typeorm';
import { Member } from '../entities/Member';
import { EmployeeDetail } from '../entities/EmployeeDetail';
import { MemberMembership } from '../entities/MemberMembership';
import { MembershipPlan } from '../entities/MembershipPlan';
import { Profession } from '../entities/Profession';
import { MemberRelationship } from '../entities/MemberRelationship';
import { ActivityLog } from '../entities/ActivityLog';

/**
 * Working Member Service
 * Handles registration for Egyptian working members (WORKING member type)
 * Includes salary-based membership pricing and dependent member support
 */
export class WorkingMemberService {
  private memberRepository: Repository<Member>;
  private employeeDetailRepository: Repository<EmployeeDetail>;
  private membershipRepository: Repository<MemberMembership>;
  private membershipPlanRepository: Repository<MembershipPlan>;
  private professionRepository: Repository<Profession>;
  private memberRelationshipRepository: Repository<MemberRelationship>;
  private activityLogRepository: Repository<ActivityLog>;

  constructor() {
    this.memberRepository = AppDataSource.getRepository(Member);
    this.employeeDetailRepository = AppDataSource.getRepository(EmployeeDetail);
    this.membershipRepository = AppDataSource.getRepository(MemberMembership);
    this.membershipPlanRepository = AppDataSource.getRepository(MembershipPlan);
    this.professionRepository = AppDataSource.getRepository(Profession);
    this.memberRelationshipRepository = AppDataSource.getRepository(MemberRelationship);
    this.activityLogRepository = AppDataSource.getRepository(ActivityLog);
  }

  /**
   * Get list of professions for working members
   */
  async getProfessions() {
    const professions = await this.professionRepository.find({
      select: ['id', 'code', 'name_en', 'name_ar'],
    });

    return professions.map((prof) => ({
      id: prof.id,
      code: prof.code,
      name_en: prof.name_en,
      name_ar: prof.name_ar,
    }));
  }

  /**
   * Calculate membership price based on salary and profession
   * Faculty Member: 20,000 EGP
   * Others:
   *   - Salary > 10,000: 10,000 EGP
   *   - Salary 8,000-10,000: 8,000 EGP
   *   - Salary 5,000-8,000: 5,000 EGP
   *   - Salary < 5,000: 2,000 EGP
   */
  calculateSalaryBasedPrice(professionCode: string, salary: number): {
    price: number;
    tier: string;
    description_en: string;
    description_ar: string;
  } {
    // Faculty members always pay 20,000
    if (professionCode === 'PROF' || professionCode === 'ASSOC') {
      return {
        price: 20000,
        tier: 'faculty',
        description_en: 'Faculty Member',
        description_ar: 'عضو هيئة تدريس',
      };
    }

    // For others, base on salary
    if (salary > 10000) {
      return {
        price: 10000,
        tier: 'high',
        description_en: 'Salary > 10,000 EGP',
        description_ar: 'الراتب أكثر من 10,000 جنيه',
      };
    } else if (salary >= 8000) {
      return {
        price: 8000,
        tier: 'upper_mid',
        description_en: 'Salary 8,000-10,000 EGP',
        description_ar: 'الراتب 8,000-10,000 جنيه',
      };
    } else if (salary >= 5000) {
      return {
        price: 5000,
        tier: 'mid',
        description_en: 'Salary 5,000-8,000 EGP',
        description_ar: 'الراتب 5,000-8,000 جنيه',
      };
    } else {
      return {
        price: 2000,
        tier: 'low',
        description_en: 'Salary < 5,000 EGP',
        description_ar: 'الراتب أقل من 5,000 جنيه',
      };
    }
  }

  /**
   * Get relationship types for dependents
   */
  getRelationshipTypes() {
    return [
      {
        code: 'spouse',
        label_en: 'Spouse',
        label_ar: 'الزوج/الزوجة',
      },
      {
        code: 'child',
        label_en: 'Child',
        label_ar: 'الابن/الابنة',
      },
      {
        code: 'parent',
        label_en: 'Parent',
        label_ar: 'الوالد/الوالدة',
      },
      {
        code: 'orphan',
        label_en: 'Orphan Under Care',
        label_ar: 'يتيم تحت الرعاية',
      },
    ];
  }

  /**
   * Submit working member detailed information
   */
  async submitWorkingMemberDetails(memberData: {
    member_id: number;
    profession_id: number;
    department_en: string;
    department_ar: string;
    salary: number;
    salary_slip?: string;
    employment_start_date: Date;
    is_related_to_active_member: boolean;
    related_member_id?: number;
    relationship_type?: string; // spouse, child, parent, orphan
    relationship_proof?: string; // file path
    // File paths
    national_id_front?: string;
    national_id_back?: string;
    personal_photo?: string;
    medical_report?: string;
    address?: string;
  }) {
    // Validate profession exists
    const profession = await this.professionRepository.findOne({
      where: { id: memberData.profession_id },
    });

    if (!profession) {
      throw new Error('Selected profession not found');
    }

    // Validate if related, that related member exists and is active
    if (memberData.is_related_to_active_member) {
      if (!memberData.related_member_id) {
        throw new Error('related_member_id is required when is_related_to_active_member is true');
      }

      const relatedMember = await this.memberRepository.findOne({
        where: { id: memberData.related_member_id, status: 'active' },
        relations: ['member_type'],
      });

      if (!relatedMember) {
        throw new Error('Related member not found or not active');
      }

      // Validate related member is also WORKING
      if (relatedMember.member_type.code !== 'WORKING' && relatedMember.member_type.code !== 'DEPENDENT') {
        throw new Error('Related member must be a working or dependent member');
      }

      if (!memberData.relationship_type) {
        throw new Error('relationship_type is required when is_related_to_active_member is true');
      }
    }

    // Update member with photos and documents
    const updateData: Record<string, unknown> = {};
    if (memberData.national_id_front) updateData.national_id_front = memberData.national_id_front;
    if (memberData.national_id_back) updateData.national_id_back = memberData.national_id_back;
    if (memberData.personal_photo) updateData.photo = memberData.personal_photo;
    if (memberData.medical_report) updateData.medical_report = memberData.medical_report;
    if (memberData.address) updateData.address = memberData.address;
    if (Object.keys(updateData).length > 0) {
      await this.memberRepository.update({ id: memberData.member_id }, updateData);
    }

    // Create employee details
    const result = await this.employeeDetailRepository.insert({
      member_id: memberData.member_id,
      profession_id: memberData.profession_id,
      department_en: memberData.department_en,
      department_ar: memberData.department_ar,
      salary: memberData.salary,
      salary_slip: memberData.salary_slip,
      employment_start_date: memberData.employment_start_date,
    });

    const employeeDetailId = result.identifiers[0].id;

    // If related to active member, create relationship record
    if (memberData.is_related_to_active_member && memberData.related_member_id) {
      await this.memberRelationshipRepository.insert({
        member_id: memberData.related_member_id, // The main working member
        related_member_id: memberData.member_id, // This new member (dependent)
        relationship_type: memberData.relationship_type,
        is_dependent: true,
      });

      // Log activity
      await this.activityLogRepository.insert({
        member_id: memberData.member_id,
        action: 'dependent_relationship_created',
        description: `Created dependent relationship with member ${memberData.related_member_id}`,
        action_date: new Date(),
      });
    }

    // Log activity
    await this.activityLogRepository.insert({
      member_id: memberData.member_id,
      action: 'working_member_details_submitted',
      description: `Submitted working member details - Profession: ${profession.name_en}, Salary: ${memberData.salary}`,
      action_date: new Date(),
    });

    return {
      success: true,
      message: 'Working member details saved successfully',
      employee_detail_id: employeeDetailId,
      is_related_to_active_member: memberData.is_related_to_active_member,
      relationship_info: memberData.is_related_to_active_member
        ? {
            related_member_id: memberData.related_member_id,
            relationship_type: memberData.relationship_type,
            relationship_proof: memberData.relationship_proof,
          }
        : null,
    };
  }

  /**
   * Calculate membership pricing for working member
   * Includes dependent discount if related to active member
   */
  async calculateMembershipPricing(memberData: {
    profession_id: number;
    salary: number;
    is_related_to_active_member: boolean;
    related_member_id?: number;
  }) {
    // Get profession
    const profession = await this.professionRepository.findOne({
      where: { id: memberData.profession_id },
    });

    if (!profession) {
      throw new Error('Profession not found');
    }

    // Calculate base price
    const basePrice = this.calculateSalaryBasedPrice(profession.code, memberData.salary);

    // If not related to active member, return base pricing
    if (!memberData.is_related_to_active_member) {
      return {
        is_dependent: false,
        base_price: basePrice.price,
        discount: 0,
        final_price: basePrice.price,
        price_tier: basePrice.tier,
        description_en: basePrice.description_en,
        description_ar: basePrice.description_ar,
        currency: 'EGP',
      };
    }

    // If related, get related member's pricing and apply 40% discount
    if (!memberData.related_member_id) {
      throw new Error('related_member_id is required for dependent pricing');
    }

    const relatedMember = await this.memberRepository.findOne({
      where: { id: memberData.related_member_id },
      relations: ['memberships', 'memberships.membership_plan'],
    });

    if (!relatedMember) {
      throw new Error('Related member not found');
    }

    // Get related member's active membership
    const relatedMembership = relatedMember.memberships?.[0];
    if (!relatedMembership) {
      throw new Error('Related member has no active membership');
    }

    // Get related member's membership plan price
    const relatedPrice = relatedMembership.membership_plan.price;

    // For dependent: use lower of (base price, related member price) with 40% discount
    const lowerPrice = Math.min(basePrice.price, relatedPrice);
    const discountAmount = lowerPrice * 0.4;
    const finalPrice = lowerPrice - discountAmount;

    return {
      is_dependent: true,
      base_price: basePrice.price,
      related_member_price: relatedPrice,
      selected_price: lowerPrice,
      discount_percentage: 40,
      discount_amount: discountAmount,
      final_price: Math.round(finalPrice),
      price_tier: basePrice.tier,
      description_en: `${basePrice.description_en} (40% Dependent Discount)`,
      description_ar: `${basePrice.description_ar} (خصم 40% للتابع)`,
      currency: 'EGP',
      related_member_id: memberData.related_member_id,
    };
  }

  /**
   * Get active working members for dependent relationship
   */
  async getActiveWorkingMembers() {
    const members = await this.memberRepository.find({
      where: {
        status: 'active',
        member_type: { code: 'WORKING' },
      },
      relations: ['member_type'],
      select: ['id', 'first_name_en', 'last_name_en', 'first_name_ar', 'last_name_ar'],
    });

    return members.map((member) => ({
      id: member.id,
      name_en: `${member.first_name_en} ${member.last_name_en}`,
      name_ar: `${member.first_name_ar} ${member.last_name_ar}`,
      status: member.status,
    }));
  }

  /**
   * Create membership for working member
   */
  async createWorkingMembership(memberData: {
    member_id: number;
    profession_id: number;
    salary: number;
    is_related_to_active_member: boolean;
    related_member_id?: number;
  }) {
    // Calculate final price
    const pricing = await this.calculateMembershipPricing(memberData);

    // Get or create membership plan based on pricing
    // For simplicity, use a standard annual plan for all working members
    const plan = await this.membershipPlanRepository.findOne({
      where: { plan_code: 'WORK_ANNUAL' }, // Standard annual working member plan
    });

    if (!plan) {
      throw new Error('Membership plan not found');
    }

    // Calculate membership dates
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year membership

    // Create membership with custom price override
    const result = await this.membershipRepository.insert({
      member_id: memberData.member_id,
      membership_plan_id: plan.id,
      start_date: startDate,
      end_date: endDate,
      status: 'active',
      payment_status: 'unpaid',
    });

    // Log activity
    await this.activityLogRepository.insert({
      member_id: memberData.member_id,
      action: 'working_membership_created',
      description: `Working member membership created - Price: ${pricing.final_price} EGP${
        pricing.is_dependent ? ' (40% dependent discount applied)' : ''
      }`,
      action_date: new Date(),
    });

    return {
      success: true,
      message: 'Working member membership created successfully',
      membership_id: result.identifiers[0].id,
      details: {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        price: pricing.final_price,
        is_dependent: pricing.is_dependent,
        discount_applied: pricing.is_dependent ? '40%' : 'None',
        currency: 'EGP',
      },
    };
  }

  /**
   * Get working member status
   */
  async getWorkingMemberStatus(memberId: number) {
    const member = await this.memberRepository.findOne({
      where: { id: memberId },
      relations: ['member_type', 'memberships', 'memberships.membership_plan'],
    });

    if (!member) {
      throw new Error('Member not found');
    }

    const employeeDetail = await this.employeeDetailRepository.findOne({
      where: { member_id: memberId },
      relations: ['profession'],
    });

    const membershipRelation = await this.memberRelationshipRepository.findOne({
      where: { related_member_id: memberId },
    });

    const membership = member.memberships?.[0];

    return {
      member_id: member.id,
      member_type: 'WORKING',
      status: member.status,
      profession: employeeDetail?.profession?.name_en,
      department: employeeDetail?.department_en,
      salary: employeeDetail?.salary,
      employment_start_date: employeeDetail?.employment_start_date
        ? employeeDetail.employment_start_date.toISOString().split('T')[0]
        : null,
      is_dependent: membershipRelation ? true : false,
      dependent_of: membershipRelation?.member_id,
      dependent_relationship: membershipRelation?.relationship_type,
      membership_active: membership ? true : false,
      membership_details: membership
        ? {
            start_date: membership.start_date.toISOString().split('T')[0],
            end_date: membership.end_date.toISOString().split('T')[0],
            price: membership.membership_plan.price,
            status: membership.status,
          }
        : null,
      documents_uploaded: {
        national_id_front: !!member.national_id_front,
        national_id_back: !!member.national_id_back,
        personal_photo: !!member.photo,
        medical_report: !!member.medical_report,
        salary_slip: !!employeeDetail?.salary_slip,
      },
    };
  }
}

export default new WorkingMemberService();
