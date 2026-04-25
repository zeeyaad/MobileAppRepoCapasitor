import { AppDataSource } from '../database/data-source';
import { Member } from '../entities/Member';
import { MemberMembership } from '../entities/MemberMembership';
import { MemberRelationship } from '../entities/MemberRelationship';

export class DependentMemberService {
  /**
   * Get dependent member subtypes
   */
  static getDependentSubtypes() {
    return [
      { code: 'DEPENDENT_ACTIVE', label_en: 'Dependent for Active Working Member', label_ar: 'تابع لعضو عامل' },
      { code: 'DEPENDENT_VISITOR', label_en: 'Dependent for Visitor Member', label_ar: 'تابع لعضو زائر' },
    ];
  }

  /**
   * Get relationship types for dependent members
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
   * Get list of active members (working members) for dependent selection
   */
  static async getActiveWorkingMembers() {
    const memberRepository = AppDataSource.getRepository(Member);
    const members = await memberRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.account', 'a')
      .leftJoinAndSelect('m.memberships', 'mm')
      .leftJoinAndSelect('mm.membership_plan', 'mp')
      .where('m.member_type_id = :typeId', { typeId: 2 }) // WORKING_MEMBER
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
      member_type: 'WORKING_MEMBER',
      name_en: `${m.first_name_en} ${m.last_name_en}`,
      name_ar: `${m.first_name_ar} ${m.last_name_ar}`,
      email: m.account?.email,
      active_membership: m.memberships?.[0]?.id || null,
      highest_plan_price: m.memberships?.[0]?.membership_plan?.price || 0,
    }));
  }

  /**
   * Get list of visitor members for dependent selection
   */
  static async getActiveVisitorMembers() {
    const memberRepository = AppDataSource.getRepository(Member);
    const members = await memberRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.account', 'a')
      .leftJoinAndSelect('m.memberships', 'mm')
      .leftJoinAndSelect('mm.membership_plan', 'mp')
      .where('m.member_type_id = :typeId', { typeId: 1 }) // VISITOR_MEMBER
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
      member_type: 'VISITOR_MEMBER',
      name_en: `${m.first_name_en} ${m.last_name_en}`,
      name_ar: `${m.first_name_ar} ${m.last_name_ar}`,
      email: m.account?.email,
      active_membership: m.memberships?.[0]?.id || null,
      membership_price: m.memberships?.[0]?.membership_plan?.price || 0,
    }));
  }

  /**
   * Calculate dependent membership price (40% discount on related member's price)
   */
  static async calculateDependentMembershipPrice(memberData: {
    related_member_id: number;
    dependent_subtype: 'DEPENDENT_ACTIVE' | 'DEPENDENT_VISITOR';
  }) {
    const memberRepository = AppDataSource.getRepository(Member);
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

    // 40% discount on related member's price
    const discountAmount = relatedPrice * 0.4;
    const finalPrice = relatedPrice - discountAmount;

    return {
      is_dependent: true,
      dependent_subtype: memberData.dependent_subtype,
      related_member_price: relatedPrice,
      discount_percentage: 40,
      discount_amount: discountAmount,
      final_price: finalPrice,
    };
  }

  /**
   * Create dependent member relationship and membership
   */
  static async createDependentMembership(memberData: {
    member_id: number;
    related_member_id: number;
    relationship_type: string;
    dependent_subtype: 'DEPENDENT_ACTIVE' | 'DEPENDENT_VISITOR';
    proof_document: string; // Path to proof document
    is_auto_renew?: boolean;
  }) {
    // Calculate pricing
    const pricingDetails = await this.calculateDependentMembershipPrice({
      related_member_id: memberData.related_member_id,
      dependent_subtype: memberData.dependent_subtype,
    });

    // Create membership
    const membershipRepository = AppDataSource.getRepository(MemberMembership);
    const today = new Date();
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

    const membership = membershipRepository.create({
      member_id: memberData.member_id,
      membership_plan_id: 1, // Default plan
      start_date: today,
      end_date: nextYear,
      status: 'active',
      payment_status: 'pending',
    });

    await membershipRepository.save(membership);

    // Create relationship
    const relationshipRepository = AppDataSource.getRepository(MemberRelationship);
    const relationship = relationshipRepository.create({
      member_id: memberData.member_id,
      related_member_id: memberData.related_member_id,
      relationship_type: memberData.relationship_type,
      is_dependent: true,
    });

    await relationshipRepository.save(relationship);

    return {
      membership,
      relationship,
      pricing: pricingDetails,
    };
  }

  /**
   * Get dependent member complete status and details
   */
  static async getDependentMemberStatus(member_id: number) {
    const memberRepository = AppDataSource.getRepository(Member);
    const relationshipRepository = AppDataSource.getRepository(MemberRelationship);

    const member = await memberRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.account', 'a')
      .leftJoinAndSelect('m.memberships', 'mm')
      .leftJoinAndSelect('mm.membership_plan', 'mp')
      .where('m.id = :id', { id: member_id })
      .getOne();

    const relationships = await relationshipRepository
      .createQueryBuilder('mr')
      .leftJoinAndSelect('mr.related_member', 'rm')
      .where('mr.member_id = :id', { id: member_id })
      .andWhere('mr.is_dependent = :dependent', { dependent: true })
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
        member_type_id: member.member_type_id,
      },
      active_membership: member.memberships?.[0] || null,
      relationships: relationships.map((r) => ({
        id: r.id,
        relationship_type: r.relationship_type,
        is_dependent: r.is_dependent,
        related_member: {
          id: r.related_member?.id,
          name_en: `${r.related_member?.first_name_en} ${r.related_member?.last_name_en}`,
          name_ar: `${r.related_member?.first_name_ar} ${r.related_member?.last_name_ar}`,
          member_type_id: r.related_member?.member_type_id,
        },
      })),
    };
  }

  /**
   * Get combined list of active members (both working and visitor)
   */
  static async getActiveMembers() {
    const workingMembers = await this.getActiveWorkingMembers();
    const visitorMembers = await this.getActiveVisitorMembers();

    return {
      working_members: workingMembers,
      visitor_members: visitorMembers,
    };
  }

  /**
   * Submit dependent member details (Step 3 of registration)
   * Saves photos and documents to member record, creates relationship
   */
  static async submitDependentDetails(memberData: {
    member_id: number;
    related_member_id: number;
    relationship_type: string;
    personal_photo?: string;
    national_id_front?: string;
    national_id_back?: string;
    medical_report?: string;
    relation_proof?: string;
  }) {
    console.log('🔍 DependentMemberService.submitDependentDetails called with:', memberData);
    const memberRepository = AppDataSource.getRepository(Member);
    const relationshipRepository = AppDataSource.getRepository(MemberRelationship);

    // Verify member exists
    console.log(`🔎 Looking for member with ID: ${memberData.member_id}`);
    const member = await memberRepository.findOne({
      where: { id: memberData.member_id }
    });

    if (!member) {
      console.error(`❌ Member not found: ${memberData.member_id}`);
      throw new Error(`Member not found with ID: ${memberData.member_id}`);
    }
    console.log(`✅ Member found: ${member.id}`);

    // ========================================================================
    // VALIDATE ESSENTIAL FILES (photo, national IDs, medical) - Must not be null/missing
    // Category-specific files (relation_proof) are optional
    // ========================================================================
    const missingFiles: string[] = [];
    if (!memberData.national_id_front) missingFiles.push('national_id_front');
    if (!memberData.national_id_back) missingFiles.push('national_id_back');
    if (!memberData.personal_photo) missingFiles.push('personal_photo');
    if (!memberData.medical_report) missingFiles.push('medical_report');

    if (missingFiles.length > 0) {
      // DELETE the member record from database since registration is incomplete
      await memberRepository.delete({ id: memberData.member_id });
      console.log(`🗑️  Deleted incomplete member ID ${memberData.member_id} due to missing files: ${missingFiles.join(', ')}`);
      
      throw new Error(`Essential files are missing: ${missingFiles.join(', ')}. Member registration cancelled and deleted.`);
    }

    // Verify related member exists and has an active membership
    console.log(`🔎 Looking for related member with ID: ${memberData.related_member_id}`);
    const relatedMember = await memberRepository
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.memberships', 'mm')
      .where('m.id = :id', { id: memberData.related_member_id })
      .getOne();

    if (!relatedMember) {
      console.error(`❌ Related member not found: ${memberData.related_member_id}`);
      throw new Error(`Related member not found with ID: ${memberData.related_member_id}`);
    }
    console.log(`✅ Related member found: ${relatedMember.id}`);

    // Update member with documents/photos
    if (memberData.personal_photo) {
      member.photo = memberData.personal_photo;
      console.log(`📷 Set personal_photo: ${memberData.personal_photo}`);
    }
    if (memberData.national_id_front) {
      member.national_id_front = memberData.national_id_front;
      console.log(`📄 Set national_id_front: ${memberData.national_id_front}`);
    }
    if (memberData.national_id_back) {
      member.national_id_back = memberData.national_id_back;
      console.log(`📄 Set national_id_back: ${memberData.national_id_back}`);
    }
    if (memberData.medical_report) {
      member.medical_report = memberData.medical_report;
      console.log(`🏥 Set medical_report: ${memberData.medical_report}`);
    }

    // Save updated member
    console.log(`💾 Saving member ${member.id} to database...`);
    await memberRepository.save(member);
    console.log(`✅ Member saved successfully`);

    // Create member relationship (dependent relationship)
    console.log(`� Creating relationship: dependent=${memberData.member_id} → related=${memberData.related_member_id}`);
    const relationship = relationshipRepository.create({
      member_id: memberData.member_id,
      related_member_id: memberData.related_member_id,
      relationship_type: memberData.relationship_type,
      is_dependent: true,
    });

    await relationshipRepository.save(relationship);
    console.log(`✅ Relationship created: ${relationship.id}`);

    return {
      success: true,
      member_id: memberData.member_id,
      relationship_id: relationship.id,
      message: 'Dependent details submitted successfully',
      next_step: 'complete_registration'
    };
  }
}
