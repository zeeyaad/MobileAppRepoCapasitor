import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Staff } from './Staff';
import { AdvertisementPhoto } from './AdvertisementPhoto';
import { AdvertisementCategory } from './AdvertisementCategory';

@Entity('advertisements')
export class Advertisement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  title_en: string;

  @Column({ type: 'varchar', length: 200 })
  title_ar: string;

  @Column({ type: 'text' })
  description_en: string;

  @Column({ type: 'text' })
  description_ar: string;

  @Column({ type: 'varchar', length: 50 })
  status: 'pending' | 'approved' | 'rejected' | 'published' | 'archived'; // pending, approved, rejected, published, archived

  @Column({ type: 'varchar', length: 50, nullable: true })
  approval_status: 'pending' | 'approved' | 'rejected' | null; // For workflow: pending -> approved -> published

  @ManyToOne(() => AdvertisementCategory, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: AdvertisementCategory;

  @Column({ type: 'int' })
  category_id: number;

  // Created by (Media Center Manager or Specialist)
  @ManyToOne(() => Staff, { eager: true })
  @JoinColumn({ name: 'created_by' })
  created_by_staff: Staff;

  @Column({ type: 'int' })
  created_by: number;

  // Approved by (only Media Center Manager can approve)
  @ManyToOne(() => Staff, { nullable: true, eager: true })
  @JoinColumn({ name: 'approved_by' })
  approved_by_staff: Staff | null;

  @Column({ type: 'int', nullable: true })
  approved_by: number | null;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  approval_notes: string | null;

  @Column({ type: 'date', nullable: true })
  start_date: Date | null; // When ad should start showing

  @Column({ type: 'date', nullable: true })
  end_date: Date | null; // When ad should stop showing

  @Column({ type: 'boolean', default: false })
  is_featured: boolean; // Highlight on homepage

  @Column({ type: 'int', default: 0 })
  view_count: number; // Track impressions

  @Column({ type: 'int', default: 0 })
  click_count: number; // Track clicks

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Photos relationship
  @OneToMany(() => AdvertisementPhoto, (photo) => photo.advertisement, {
    cascade: true,
    eager: true,
  })
  photos: AdvertisementPhoto[];
}
