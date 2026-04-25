import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Sport } from './Sport';
import { Branch } from './Branch';
import { Staff } from './Staff';

/**
 * Announcement Entity
 * 
 * Represents announcements created by admins to promote sports.
 * When users click on an announcement, they're redirected to the sport's subscription page
 * filtered by the specific branch (if specified).
 */
@Entity('announcements')
@Index('idx_announcement_status', ['status'])
@Index('idx_announcement_sport_id', ['sport_id'])
@Index('idx_announcement_branch_id', ['branch_id'])
@Index('idx_announcement_created_at', ['created_at'])
export class Announcement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sport_id: number;

  @Column({ type: 'integer', nullable: true })
  branch_id: number | null; // NULL means applies to all branches

  @Column()
  created_by_staff_id: number;

  // Announcement Content
  @Column({ type: 'varchar', length: 200 })
  title_en: string;

  @Column({ type: 'varchar', length: 200 })
  title_ar: string;

  @Column({ type: 'text', nullable: true })
  description_en: string | null;

  @Column({ type: 'text', nullable: true })
  description_ar: string | null;

  // Visual Content
  @Column({ type: 'text', nullable: true })
  banner_image: string | null; // Base64 or URL

  @Column({ type: 'text', nullable: true })
  thumbnail_image: string | null; // Smaller version for lists

  // Links & Routing
  @Column({ type: 'text', nullable: true })
  external_link: string | null; // Optional external link

  // Status & Visibility
  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: string; // draft, published, archived, expired

  @Column({ type: 'boolean', default: true })
  is_visible: boolean;

  @Column({ type: 'integer', default: 0 })
  priority: number; // For ordering announcements (higher = shown first)

  // Timing
  @Column({ type: 'timestamp', nullable: true })
  published_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date | null;

  // Analytics
  @Column({ type: 'integer', default: 0 })
  view_count: number;

  @Column({ type: 'integer', default: 0 })
  click_count: number;

  @Column({ type: 'integer', default: 0 })
  subscription_count: number; // Subscriptions from this announcement

  // Target Audience (optional filtering)
  @Column({ type: 'varchar', length: 20, nullable: true })
  target_role: string | null; // 'member', 'team_member', null = both

  @Column({ type: 'integer', default: 0 })
  min_age: number; // 0 = no restriction

  @Column({ type: 'integer', default: 0 })
  max_age: number; // 0 = no restriction

  // Timestamps
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Sport, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sport_id' })
  sport: Sport;

  @ManyToOne(() => Branch, { eager: false, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch | null;

  @ManyToOne(() => Staff, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by_staff_id' })
  created_by: Staff;
}
