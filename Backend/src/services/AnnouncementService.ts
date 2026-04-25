import { AppDataSource } from '../database/data-source';
import { Announcement } from '../entities/Announcement';
import { Repository } from 'typeorm';

/**
 * AnnouncementService
 * 
 * Handles business logic for managing announcements
 * Announcements are used to promote sports and drive subscriptions
 */
export class AnnouncementService {
  private repo: Repository<Announcement>;

  constructor() {
    this.repo = AppDataSource.getRepository(Announcement);
  }

  /**
   * Create a new announcement
   */
  async createAnnouncement(data: {
    sport_id: number;
    branch_id?: number | null;
    created_by_staff_id: number;
    title_en: string;
    title_ar: string;
    description_en?: string | null;
    description_ar?: string | null;
    banner_image?: string | null;
    thumbnail_image?: string | null;
    external_link?: string | null;
    target_role?: string | null;
    min_age?: number;
    max_age?: number;
    priority?: number;
    expires_at?: Date | null;
  }): Promise<Announcement> {
    const announcement = this.repo.create({
      sport_id: data.sport_id,
      branch_id: data.branch_id || null,
      created_by_staff_id: data.created_by_staff_id,
      title_en: data.title_en,
      title_ar: data.title_ar,
      description_en: data.description_en || null,
      description_ar: data.description_ar || null,
      banner_image: data.banner_image || null,
      thumbnail_image: data.thumbnail_image || null,
      external_link: data.external_link || null,
      target_role: data.target_role || null,
      min_age: data.min_age || 0,
      max_age: data.max_age || 0,
      priority: data.priority || 0,
      expires_at: data.expires_at || null,
      status: 'draft',
      is_visible: true,
      view_count: 0,
      click_count: 0,
      subscription_count: 0,
    });

    return await this.repo.save(announcement);
  }

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(announcementId: number): Promise<Announcement | null> {
    return await this.repo.findOne({
      where: { id: announcementId },
      relations: ['sport', 'branch', 'created_by'],
    });
  }

  /**
   * Get all announcements (with optional filters)
   */
  async getAllAnnouncements(filters?: {
    sport_id?: number;
    branch_id?: number;
    status?: string;
    is_visible?: boolean;
  }): Promise<Announcement[]> {
    const query = this.repo.createQueryBuilder('ann');

    if (filters?.sport_id) {
      query.where('ann.sport_id = :sport_id', { sport_id: filters.sport_id });
    }

    if (filters?.branch_id) {
      query.andWhere('(ann.branch_id = :branch_id OR ann.branch_id IS NULL)', {
        branch_id: filters.branch_id,
      });
    }

    if (filters?.status) {
      query.andWhere('ann.status = :status', { status: filters.status });
    }

    if (filters?.is_visible !== undefined) {
      query.andWhere('ann.is_visible = :is_visible', { is_visible: filters.is_visible });
    }

    return await query
      .leftJoinAndSelect('ann.sport', 'sport')
      .leftJoinAndSelect('ann.branch', 'branch')
      .leftJoinAndSelect('ann.created_by', 'created_by')
      .orderBy('ann.priority', 'DESC')
      .addOrderBy('ann.created_at', 'DESC')
      .getMany();
  }

  /**
   * Get published announcements visible to users
   */
  async getPublicAnnouncements(filters?: {
    sport_id?: number;
    branch_id?: number;
    target_role?: string;
    minAge?: number;
    maxAge?: number;
  }): Promise<Announcement[]> {
    let query = this.repo.createQueryBuilder('ann')
      .where('ann.status = :status', { status: 'published' })
      .andWhere('ann.is_visible = :is_visible', { is_visible: true })
      .andWhere('(ann.expires_at IS NULL OR ann.expires_at > NOW())');

    if (filters?.sport_id) {
      query = query.andWhere('ann.sport_id = :sport_id', { sport_id: filters.sport_id });
    }

    if (filters?.branch_id) {
      query = query.andWhere('(ann.branch_id = :branch_id OR ann.branch_id IS NULL)', {
        branch_id: filters.branch_id,
      });
    }

    if (filters?.target_role) {
      query = query.andWhere(
        "(ann.target_role = :target_role OR ann.target_role IS NULL)",
        { target_role: filters.target_role }
      );
    }

    if (filters?.minAge || filters?.maxAge) {
      const minAge = filters?.minAge || 0;
      const maxAge = filters?.maxAge || 150; // Reasonable max age
      query = query.andWhere(
        '(ann.min_age = 0 OR ann.min_age <= :minAge) AND (ann.max_age = 0 OR ann.max_age >= :maxAge)',
        { minAge, maxAge }
      );
    }

    return await query
      .leftJoinAndSelect('ann.sport', 'sport')
      .leftJoinAndSelect('ann.branch', 'branch')
      .orderBy('ann.priority', 'DESC')
      .addOrderBy('ann.created_at', 'DESC')
      .getMany();
  }

  /**
   * Get announcements for a specific sport
   */
  async getAnnouncementsBySport(sportId: number, publishedOnly: boolean = true): Promise<Announcement[]> {
    let query = this.repo.createQueryBuilder('ann')
      .where('ann.sport_id = :sport_id', { sport_id: sportId });

    if (publishedOnly) {
      query = query
        .andWhere('ann.status = :status', { status: 'published' })
        .andWhere('ann.is_visible = :is_visible', { is_visible: true });
    }

    return await query
      .leftJoinAndSelect('ann.sport', 'sport')
      .leftJoinAndSelect('ann.branch', 'branch')
      .orderBy('ann.priority', 'DESC')
      .addOrderBy('ann.created_at', 'DESC')
      .getMany();
  }

  /**
   * Update announcement
   */
  async updateAnnouncement(
    announcementId: number,
    data: any
  ): Promise<Announcement | null> {
    await this.repo.update(announcementId, data);
    return await this.getAnnouncementById(announcementId);
  }

  /**
   * Publish announcement (change status to published)
   */
  async publishAnnouncement(announcementId: number): Promise<Announcement | null> {
    return await this.updateAnnouncement(announcementId, {
      status: 'published',
      published_at: new Date(),
    });
  }

  /**
   * Archive announcement
   */
  async archiveAnnouncement(announcementId: number): Promise<Announcement | null> {
    return await this.updateAnnouncement(announcementId, {
      status: 'archived',
      is_visible: false,
    });
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(announcementId: number): Promise<boolean> {
    const result = await this.repo.delete(announcementId);
    return (result.affected || 0) > 0;
  }

  /**
   * Increment view count
   */
  async recordView(announcementId: number): Promise<void> {
    await this.repo.increment({ id: announcementId }, 'view_count', 1);
  }

  /**
   * Increment click count
   */
  async recordClick(announcementId: number): Promise<void> {
    await this.repo.increment({ id: announcementId }, 'click_count', 1);
  }

  /**
   * Increment subscription count
   */
  async recordSubscription(announcementId: number): Promise<void> {
    await this.repo.increment({ id: announcementId }, 'subscription_count', 1);
  }

  /**
   * Get trending announcements (by clicks)
   */
  async getTrendingAnnouncements(limit: number = 5): Promise<Announcement[]> {
    return await this.repo.createQueryBuilder('ann')
      .where('ann.status = :status', { status: 'published' })
      .andWhere('ann.is_visible = :is_visible', { is_visible: true })
      .andWhere('(ann.expires_at IS NULL OR ann.expires_at > NOW())')
      .leftJoinAndSelect('ann.sport', 'sport')
      .leftJoinAndSelect('ann.branch', 'branch')
      .orderBy('ann.click_count', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * Get announcements with highest subscription conversion
   */
  async getTopPerformingAnnouncements(limit: number = 5): Promise<Announcement[]> {
    return await this.repo.createQueryBuilder('ann')
      .where('ann.status = :status', { status: 'published' })
      .andWhere('ann.is_visible = :is_visible', { is_visible: true })
      .leftJoinAndSelect('ann.sport', 'sport')
      .leftJoinAndSelect('ann.branch', 'branch')
      .orderBy('ann.subscription_count', 'DESC')
      .limit(limit)
      .getMany();
  }
}
