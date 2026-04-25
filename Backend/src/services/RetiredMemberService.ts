import { getRepository } from 'typeorm';
import { Member } from '../entities/Member';
import { MemberMembership } from '../entities/MemberMembership';
import { RetiredEmployeeDetail } from '../entities/RetiredEmployeeDetail';
import { MemberRelationship } from '../entities/MemberRelationship';

export class RetiredMemberService {
  /**
   * Get list of retired profession options
   */
  static getProfessions() {
    return [
      { code: 'RETIRED_PROF', label_en: 'Retired Faculty Member', label_ar: 'أستاذ جامعي متقاعد' },
      { code: 'RETIRED_TA', label_en: 'Retired Teaching Assistant', label_ar: 'معيد متقاعد' },
      { code: 'RETIRED_AL', label_en: 'Retired Assistant Lecturer', label_ar: 'مدرس مساعد متقاعد' },
      { code: 'RETIRED_STAFF', label_en: 'Retired Staff', label_ar: 'موظف متقاعد' },
    ];
  }

  /**
   * Get relationship types for dependents
   */
  static getRelationshipTypes() {
    return [
      { code: 'spouse', label_en: 'Spouse', label_ar: 'الزوج/الزوجة' },
      { code: 'child', label_en: 'Child', label_ar: 'الابن/الابنة' },
      { code: 'parent', label_en: 'Parent', label_ar: 'الوالد/الوالدة' },
      { code: 'orphan', label_en: 'Orphan', label_ar: 'يتيم' },
    ];
  }

  /**
   * Calculate salary-based membership price for retired members
   * Faculty: Fixed 20,000 EGP
   * Others: Based on last salary before retirement
   */
  static calculateSalaryBasedPrice(professionCode: string, salary: number): { price: number; tier: string } {
    // Faculty members have fixed price
    if (professionCode === 'RETIRED_PROF') {
      return { price: 20000, tier: 'faculty' };
    }

    // Other professions: salary-based tiers
    if (salary > 10000) return { price: 10000, tier: 'high' };
    if (salary >= 8000) return { price: 8000, tier: 'upper_mid' };
    if (salary >= 5000) return { price: 5000, tier: 'mid' };
    return { price: 2000, tier: 'low' };
  }

  /**
   * Get list of active working members (for dependent relationship selection)
   */
  static async getActiveWorkingMembers() {
    const memberRepository = getRepository(Member);
    const members = await memberRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.account', 'a')
      .leftJoinAndSelect('m.memberships', 'mm')
      .leftJoinAndSelect('mm.membership_plan', 'mp')
      .where('m.member_type_id = :typeId', { typeId: 2 }) // Assuming 2 = WORKING_MEMBER or EMPLOYEE
      .andWhere('a.status = :status', { status: 'active' })
      .andWhere('mm.status = :mStatus', { mStatus: 'active' })
      .select([
        'm.id',
        'm.first_name_en',
        'm.first_name_ar',
        'm.last_name_en',
        'm.last_name_ar',
        'a.email',
        'mm.id',
        'mm.status',
        'mp.price',
        'mp.name_en',
      ])
      .orderBy('m.first_name_en', 'ASC')
      .getMany();

    return members.map((m) => ({
      member_id: m.id,
      name_en: `${m.first_name_en} ${m.last_name_en}`,
      name_ar: `${m.first_name_ar} ${m.last_name_ar}`,
      email: m.account?.email,
      active_membership: m.memberships?.[0]?.id || null,
      highest_plan_price: m.memberships?.[0]?.membership_plan?.price || 0,
    }));
  }

  /**
   * Submit retired member details
   */
  static async submitRetiredMemberDetails(retiredData: {
    member_id: number;
    profession_code: string;
    former_department: string;
    retirement_date: Date;
    last_salary: number;
    salary_slip: string;
  }) {
    const retiredRepository = getRepository(RetiredEmployeeDetail);

    const retiredDetails = retiredRepository.create({
      member_id: retiredData.member_id,
      profession_code: retiredData.profession_code,
      former_department_en: retiredData.former_department,
      retirement_date: retiredData.retirement_date,
      last_salary: retiredData.last_salary,
      salary_slip: retiredData.salary_slip,
    });

    await retiredRepository.save(retiredDetails);
    return retiredDetails;
  }

  /**
   * Calculate final membership pricing
   * If independent: Based on profession/salary
   * If dependent: 40% discount on lower of (member's price, related member's highest membership fee)
   */
  static async calculateMembershipPricing(memberData: {
    member_id: number;
    profession_code: string;
    last_salary: number;
    is_related_to_active_member: boolean;
    related_member_id?: number;
  }) {
    const basePrice = this.calculateSalaryBasedPrice(memberData.profession_code, memberData.last_salary);

    // Independent member: no discount
    if (!memberData.is_related_to_active_member) {
      return {
        is_dependent: false,
        base_price: basePrice.price,
        discount_percentage: 0,
        final_price: basePrice.price,
        tier: basePrice.tier,
      };
    }

    // Dependent member: 40% discount
    const memberRepository = getRepository(Member);
    const relatedMember = await memberRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.memberships', 'mm')
      .leftJoinAndSelect('mm.membership_plan', 'mp')
      .where('m.id = :id', { id: memberData.related_member_id })
      .andWhere('mm.status = :status', { status: 'active' })
      .orderBy('mp.price', 'DESC')
      .getOne();

    if (!relatedMember) {
      throw new Error('Related member not found or has no active membership');
    }

    const relatedPrice = relatedMember.memberships?.[0]?.membership_plan?.price || 0;
    const lowerPrice = Math.min(basePrice.price, relatedPrice);
    const discountAmount = lowerPrice * 0.4;
    const finalPrice = lowerPrice - discountAmount;

    return {
      is_dependent: true,
      base_price: basePrice.price,
      related_member_price: relatedPrice,
      lower_price: lowerPrice,
      discount_percentage: 40,
      discount_amount: discountAmount,
      final_price: finalPrice,
      tier: basePrice.tier,
    };
  }

  /**
   * Create membership subscription for retired member
   */
  static async createRetiredMembership(memberData: {
    member_id: number;
    profession_code: string;
    last_salary: number;
    is_related_to_active_member: boolean;
    related_member_id?: number;
    is_auto_renew?: boolean;
  }) {
    const pricingDetails = await this.calculateMembershipPricing({
      member_id: memberData.member_id,
      profession_code: memberData.profession_code,
      last_salary: memberData.last_salary,
      is_related_to_active_member: memberData.is_related_to_active_member,
      related_member_id: memberData.related_member_id,
    });

    const membershipRepository = getRepository(MemberMembership);
    const today = new Date();
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

    const membership = membershipRepository.create({
      member_id: memberData.member_id,
      membership_plan_id: 1, // Default or based on pricing tier
      start_date: today,
      end_date: nextYear,
      status: 'active',
      payment_status: 'pending',
    });

    await membershipRepository.save(membership);
    return {
      membership: membership,
      pricing: pricingDetails,
    };
  }

  /**
   * Create relationship between retired member and active member (with approval tracking)
   */
  static async createMemberRelationship(relationshipData: {
    retired_member_id: number;
    active_member_id: number;
    relationship_type: string;
    proof_document: string; // Path to birth certificate, marriage certificate, etc.
  }) {
    const relationshipRepository = getRepository(MemberRelationship);

    const relationship = relationshipRepository.create({
      member_id: relationshipData.retired_member_id,
      related_member_id: relationshipData.active_member_id,
      relationship_type: relationshipData.relationship_type,
      is_dependent: true,
      // Custom field for proof document (may need to extend entity)
    });

    await relationshipRepository.save(relationship);
    return relationship;
  }

  /**
   * Get retired member complete status and details
   */
  static async getRetiredMemberStatus(member_id: number) {
    const memberRepository = getRepository(Member);
    const retiredRepository = getRepository(RetiredEmployeeDetail);
    const relationshipRepository = getRepository(MemberRelationship);

    const member = await memberRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.account', 'a')
      .leftJoinAndSelect('m.memberships', 'mm')
      .leftJoinAndSelect('mm.membership_plan', 'mp')
      .where('m.id = :id', { id: member_id })
      .getOne();

    const retiredDetails = await retiredRepository.findOne({
      where: { member_id: member_id },
    });

    const relationships = await relationshipRepository
      .createQueryBuilder('mr')
      .leftJoinAndSelect('mr.related_member', 'rm')
      .where('mr.member_id = :id', { id: member_id })
      .getMany();

    if (!member) {
      throw new Error('Member not found');
    }

    return {
      member: {
        id: member.id,
        name_en: `${member.first_name_en} ${member.last_name_en}`,
        name_ar: `${member.first_name_ar} ${member.last_name_ar}`,
        email: member.account?.email,
        status: member.status,
        phone: member.phone,
        national_id: member.national_id,
        birthdate: member.birthdate,
        health_status: member.health_status,
        photo: member.photo,
      },
      retired_details: retiredDetails || null,
      active_membership: member.memberships?.[0] || null,
      relationships: relationships.map((r) => ({
        id: r.id,
        relationship_type: r.relationship_type,
        related_member: {
          id: r.related_member?.id,
          name: `${r.related_member?.first_name_en} ${r.related_member?.last_name_en}`,
        },
      })),
    };
  }
}
