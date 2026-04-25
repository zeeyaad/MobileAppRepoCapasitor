import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Advertisement } from '../entities/Advertisement';
import { AdvertisementPhoto } from '../entities/AdvertisementPhoto';
import { AdvertisementCategory } from '../entities/AdvertisementCategory';

export class MediaCenterService {
  private advertisementRepository: Repository<Advertisement>;
  private photoRepository: Repository<AdvertisementPhoto>;
  private categoryRepository: Repository<AdvertisementCategory>;

  constructor() {
    this.advertisementRepository = AppDataSource.getRepository(Advertisement);
    this.photoRepository = AppDataSource.getRepository(AdvertisementPhoto);
    this.categoryRepository = AppDataSource.getRepository(AdvertisementCategory);
  }

  /**
   * Create advertisement
   * - Manager: Creates with "approved" status and is immediately published
   * - Specialist: Creates with "pending" status and requires manager approval
   */
  async createAdvertisement(
    data: {
      title_en: string;
      title_ar: string;
      description_en: string;
      description_ar: string;
      category_id: number;
      start_date?: Date;
      end_date?: Date;
      is_featured?: boolean;
    },
    staffId: number,
    staffTypeId: number,
    photos: Array<{ path: string; originalname: string; alt_text_en?: string; alt_text_ar?: string }>
  ): Promise<Advertisement> {
    // Check category exists
    const category = await this.categoryRepository.findOne({
      where: { id: data.category_id },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    if (!category.is_active) {
      throw new Error('Category is not active');
    }

    // Determine status based on staff type
    // Staff type ID: Media Center Manager (typically higher ID) vs Specialist (lower ID)
    // We'll use a check for manager - you may need to adjust this based on your actual staff type IDs
    const isManager = staffTypeId === 1; // Adjust this check based on your actual staff type IDs

    const advertisement = this.advertisementRepository.create({
      title_en: data.title_en,
      title_ar: data.title_ar,
      description_en: data.description_en,
      description_ar: data.description_ar,
      category_id: data.category_id,
      created_by: staffId,
      status: isManager ? 'approved' : 'pending',
      approval_status: isManager ? 'approved' : 'pending',
      start_date: data.start_date,
      end_date: data.end_date,
      is_featured: data.is_featured || false,
      photos: [],
    });

    const savedAdvertisement = await this.advertisementRepository.save(advertisement);

    // Save photos
    if (photos && photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        const adPhoto = this.photoRepository.create({
          advertisement_id: savedAdvertisement.id,
          photo_url: photo.path,
          original_filename: photo.originalname,
          alt_text_en: photo.alt_text_en || '',
          alt_text_ar: photo.alt_text_ar || '',
          display_order: i + 1,
        });
        await this.photoRepository.save(adPhoto);
      }
    }

    // Reload with photos
    return this.advertisementRepository.findOne({
      where: { id: savedAdvertisement.id },
      relations: ['photos', 'category', 'created_by_staff', 'approved_by_staff'],
    }) as Promise<Advertisement>;
  }

  /**
   * Get all advertisements with optional filters
   */
  async getAllAdvertisements(filters?: {
    status?: string;
    category_id?: number;
    created_by?: number;
    is_featured?: boolean;
  }): Promise<Advertisement[]> {
    let query = this.advertisementRepository.createQueryBuilder('ad');

    if (filters?.status) {
      query = query.where('ad.status = :status', { status: filters.status });
    }

    if (filters?.category_id) {
      query = query.andWhere('ad.category_id = :category_id', { category_id: filters.category_id });
    }

    if (filters?.created_by) {
      query = query.andWhere('ad.created_by = :created_by', { created_by: filters.created_by });
    }

    if (filters?.is_featured) {
      query = query.andWhere('ad.is_featured = :is_featured', { is_featured: filters.is_featured });
    }

    return query
      .leftJoinAndSelect('ad.photos', 'photos')
      .leftJoinAndSelect('ad.category', 'category')
      .leftJoinAndSelect('ad.created_by_staff', 'created_by')
      .leftJoinAndSelect('ad.approved_by_staff', 'approved_by')
      .orderBy('ad.created_at', 'DESC')
      .getMany();
  }

  /**
   * Get advertisement by ID
   */
  async getAdvertisementById(id: number): Promise<Advertisement | null> {
    return this.advertisementRepository.findOne({
      where: { id },
      relations: ['photos', 'category', 'created_by_staff', 'approved_by_staff'],
    });
  }

  /**
   * Get pending advertisements (for manager approval)
   */
  async getPendingAdvertisements(): Promise<Advertisement[]> {
    return this.advertisementRepository.find({
      where: { status: 'pending' },
      relations: ['photos', 'category', 'created_by_staff'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Approve advertisement (Manager only)
   */
  async approveAdvertisement(
    id: number,
    managerId: number,
    approvalNotes?: string
  ): Promise<Advertisement> {
    const ad = await this.advertisementRepository.findOne({ where: { id } });

    if (!ad) {
      throw new Error('Advertisement not found');
    }

    if (ad.status !== 'pending') {
      throw new Error('Only pending advertisements can be approved');
    }

    ad.status = 'approved';
    ad.approval_status = 'approved';
    ad.approved_by = managerId;
    ad.approved_at = new Date();
    ad.approval_notes = approvalNotes || null;

    await this.advertisementRepository.save(ad);

    return this.advertisementRepository.findOne({
      where: { id },
      relations: ['photos', 'category', 'created_by_staff', 'approved_by_staff'],
    }) as Promise<Advertisement>;
  }

  /**
   * Reject advertisement (Manager only)
   */
  async rejectAdvertisement(
    id: number,
    managerId: number,
    rejectionReason: string
  ): Promise<Advertisement> {
    const ad = await this.advertisementRepository.findOne({ where: { id } });

    if (!ad) {
      throw new Error('Advertisement not found');
    }

    if (ad.status !== 'pending') {
      throw new Error('Only pending advertisements can be rejected');
    }

    ad.status = 'rejected';
    ad.approval_status = 'rejected';
    ad.approved_by = managerId;
    ad.approved_at = new Date();
    ad.approval_notes = rejectionReason;

    await this.advertisementRepository.save(ad);

    return this.advertisementRepository.findOne({
      where: { id },
      relations: ['photos', 'category', 'created_by_staff', 'approved_by_staff'],
    }) as Promise<Advertisement>;
  }

  /**
   * Publish advertisement (typically done after approval)
   */
  async publishAdvertisement(id: number): Promise<Advertisement> {
    const ad = await this.advertisementRepository.findOne({ where: { id } });

    if (!ad) {
      throw new Error('Advertisement not found');
    }

    if (ad.approval_status !== 'approved') {
      throw new Error('Only approved advertisements can be published');
    }

    ad.status = 'published';

    await this.advertisementRepository.save(ad);

    return this.advertisementRepository.findOne({
      where: { id },
      relations: ['photos', 'category', 'created_by_staff', 'approved_by_staff'],
    }) as Promise<Advertisement>;
  }

  /**
   * Update advertisement (only if still pending)
   */
  async updateAdvertisement(
    id: number,
    data: Partial<{
      title_en: string;
      title_ar: string;
      description_en: string;
      description_ar: string;
      category_id: number;
      start_date: Date;
      end_date: Date;
      is_featured: boolean;
    }>
  ): Promise<Advertisement> {
    const ad = await this.advertisementRepository.findOne({ where: { id } });

    if (!ad) {
      throw new Error('Advertisement not found');
    }

    if (ad.status !== 'pending') {
      throw new Error('Can only update advertisements that are still pending');
    }

    if (data.category_id) {
      const category = await this.categoryRepository.findOne({
        where: { id: data.category_id },
      });
      if (!category) {
        throw new Error('Category not found');
      }
    }

    Object.assign(ad, data);
    await this.advertisementRepository.save(ad);

    return this.advertisementRepository.findOne({
      where: { id },
      relations: ['photos', 'category', 'created_by_staff', 'approved_by_staff'],
    }) as Promise<Advertisement>;
  }

  /**
   * Delete advertisement (only if not published)
   */
  async deleteAdvertisement(id: number): Promise<void> {
    const ad = await this.advertisementRepository.findOne({ where: { id } });

    if (!ad) {
      throw new Error('Advertisement not found');
    }

    if (ad.status === 'published') {
      throw new Error('Cannot delete published advertisements');
    }

    // Delete photos first
    await this.photoRepository.delete({ advertisement_id: id });

    // Delete advertisement
    await this.advertisementRepository.delete(id);
  }

  /**
   * Archive advertisement
   */
  async archiveAdvertisement(id: number): Promise<Advertisement> {
    const ad = await this.advertisementRepository.findOne({ where: { id } });

    if (!ad) {
      throw new Error('Advertisement not found');
    }

    ad.status = 'archived';

    await this.advertisementRepository.save(ad);

    return this.advertisementRepository.findOne({
      where: { id },
      relations: ['photos', 'category', 'created_by_staff', 'approved_by_staff'],
    }) as Promise<Advertisement>;
  }

  /**
   * Get advertisement categories
   */
  async getCategories(isActive?: boolean): Promise<AdvertisementCategory[]> {
    let query = this.categoryRepository.createQueryBuilder('cat');

    if (isActive !== undefined) {
      query = query.where('cat.is_active = :is_active', { is_active: isActive });
    }

    return query.orderBy('cat.name_en', 'ASC').getMany();
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: number): Promise<AdvertisementCategory | null> {
    return this.categoryRepository.findOne({ where: { id } });
  }

  /**
   * Create category (Admin only)
   */
  async createCategory(data: {
    code: string;
    name_en: string;
    name_ar: string;
    description_en?: string;
    description_ar?: string;
    color_code?: string;
  }): Promise<AdvertisementCategory> {
    // Check if code already exists
    const existing = await this.categoryRepository.findOne({
      where: { code: data.code },
    });

    if (existing) {
      throw new Error('Category code already exists');
    }

    const category = this.categoryRepository.create(data);
    return this.categoryRepository.save(category);
  }

  /**
   * Update category (Admin only)
   */
  async updateCategory(id: number, data: Partial<AdvertisementCategory>): Promise<AdvertisementCategory> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new Error('Category not found');
    }

    Object.assign(category, data);
    return this.categoryRepository.save(category);
  }

  /**
   * Track advertisement view
   */
  async trackView(id: number): Promise<void> {
    const ad = await this.advertisementRepository.findOne({ where: { id } });

    if (!ad) {
      throw new Error('Advertisement not found');
    }

    ad.view_count += 1;
    await this.advertisementRepository.save(ad);
  }

  /**
   * Track advertisement click
   */
  async trackClick(id: number): Promise<void> {
    const ad = await this.advertisementRepository.findOne({ where: { id } });

    if (!ad) {
      throw new Error('Advertisement not found');
    }

    ad.click_count += 1;
    await this.advertisementRepository.save(ad);
  }
}

export default MediaCenterService;
