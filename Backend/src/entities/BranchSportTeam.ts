import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Branch } from './Branch';
import { Sport } from './Sport';
import { Staff } from './Staff';
import { MemberTeamSubscription } from './MemberTeamSubscription';
import { TeamMemberTeamSubscription } from './TeamMemberTeamSubscription';

/**
 * BranchSportTeam Entity
 * 
 * Represents the hierarchical structure:
 * Branch -> Sport -> Team
 * 
 * Each team belongs to:
 * - Exactly one Branch
 * - Exactly one Sport (within that branch)
 * 
 * Each team has:
 * - Specific training days (e.g., Sunday, Tuesday, Thursday)
 * - Start and end times (e.g., 8 PM - 10 PM)
 * - Monthly fee for subscription
 * - Maximum participants
 * - Status (pending, active, inactive, archived)
 */
@Entity('branch_sport_teams')
@Index('idx_branch_sport_team_status', ['status'])
@Index('idx_branch_sport_team_branch_id', ['branch_id'])
@Index('idx_branch_sport_team_sport_id', ['sport_id'])
@Index('idx_branch_sport_team_composite', ['branch_id', 'sport_id'])
export class BranchSportTeam {
  @PrimaryGeneratedColumn()
  id: number;

  // Foreign Keys
  @Column()
  branch_id: number;

  @Column()
  sport_id: number;

  @Column()
  created_by_staff_id: number;

  // Team Info
  @Column({ type: 'varchar', length: 100 })
  name_en: string;

  @Column({ type: 'varchar', length: 100 })
  name_ar: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description_en: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description_ar: string | null;

  // Training Days (e.g., "Monday,Wednesday,Friday" or "0,2,4" for day indices)
  @Column({ type: 'varchar', length: 100 })
  training_days: string;

  // Time Range
  @Column({ type: 'time' })
  start_time: string; // Format: HH:MM:SS

  @Column({ type: 'time' })
  end_time: string; // Format: HH:MM:SS

  // Fee Structure
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthly_fee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  registration_fee: number | null; // One-time registration fee, optional

  // Capacity Management
  @Column({ type: 'integer', default: 0 })
  max_participants: number; // 0 means unlimited

  @Column({ type: 'integer', default: 0 })
  current_participants: number;

  // Status & Lifecycle
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // pending, active, inactive, archived

  @Column({ type: 'varchar', length: 500, nullable: true })
  status_reason: string | null; // Reason for status change

  // Approval
  @Column({ type: 'integer', nullable: true })
  approved_by_staff_id: number | null;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date | null;

  @Column({ type: 'text', nullable: true })
  approval_comments: string | null;

  // Additional Info
  @Column({ type: 'text', nullable: true })
  team_image: string | null; // Base64 or URL

  @Column({ type: 'integer', default: 0 })
  min_age: number; // Minimum age requirement, 0 = no restriction

  @Column({ type: 'integer', default: 0 })
  max_age: number; // Maximum age requirement, 0 = no restriction

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // Timestamps
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Branch, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Sport, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sport_id' })
  sport: Sport;

  @ManyToOne(() => Staff, { eager: false, nullable: true })
  @JoinColumn({ name: 'created_by_staff_id' })
  created_by: Staff;

  @ManyToOne(() => Staff, { eager: false, nullable: true })
  @JoinColumn({ name: 'approved_by_staff_id' })
  approved_by: Staff | null;

  // Subscription Relations
  @OneToMany(() => MemberTeamSubscription, (sub) => sub.team, { eager: false })
  member_subscriptions: MemberTeamSubscription[];

  @OneToMany(() => TeamMemberTeamSubscription, (sub) => sub.team, { eager: false })
  team_member_subscriptions: TeamMemberTeamSubscription[];
}
