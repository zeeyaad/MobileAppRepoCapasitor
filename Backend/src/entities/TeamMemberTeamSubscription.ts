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
import { TeamMember } from './TeamMember';
import { BranchSportTeam } from './BranchSportTeam';
import { Staff } from './Staff';
import { Announcement } from './Announcement';

/**
 * TeamMemberTeamSubscription Entity
 * 
 * Tracks team member subscriptions to specific team(s).
 * A team member (athlete) can subscribe to multiple teams across different sports and branches.
 */
@Entity('team_member_team_subscriptions')
@Index('idx_tmts_team_member_id', ['team_member_id'])
@Index('idx_tmts_team_id', ['team_id'])
@Index('idx_tmts_status', ['status'])
@Index('idx_tmts_created_at', ['created_at'])
@Index('idx_tmts_team_member_status', ['team_member_id', 'status'])
@Index('idx_tmts_team_status', ['team_id', 'status'])
export class TeamMemberTeamSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  team_member_id: number;

  @Column()
  team_id: number; // FK to branch_sport_teams

  @Column({ type: 'integer', nullable: true })
  created_by_staff_id: number | null; // NULL if team member self-subscribed

  @Column({ type: 'integer', nullable: true })
  approved_by_staff_id: number | null;

  @Column({ type: 'integer', nullable: true })
  announcement_id: number | null; // Which announcement (if any) led to this subscription

  // Subscription Status Lifecycle
  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // pending, approved, declined, cancelled, active, expired, inactive

  @Column({ type: 'text', nullable: true })
  decline_reason: string | null; // Reason if declined

  @Column({ type: 'text', nullable: true })
  cancellation_reason: string | null; // Reason if cancelled

  // Dates
  @Column({ type: 'date', nullable: true })
  start_date: Date | null; // When subscription becomes active

  @Column({ type: 'date', nullable: true })
  end_date: Date | null; // When subscription expires

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  declined_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at: Date | null;

  // Fee Information
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monthly_fee: number; // Copy of team's monthly_fee at subscription time (for history)

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  registration_fee: number | null; // Copy of team's registration_fee

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  custom_price: number | null; // Override the monthly fee

  @Column({ type: 'varchar', length: 20, default: 'unpaid' })
  payment_status: string; // unpaid, paid, partial, overdue, waived, pending

  // Approval Notes
  @Column({ type: 'text', nullable: true })
  approval_notes: string | null;

  // Additional Info
  @Column({ type: 'text', nullable: true })
  special_notes: string | null; // For coaches or admins to add notes

  @Column({ type: 'boolean', default: false })
  is_captain: boolean; // If this team member is a team captain

  // Timestamps
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => TeamMember, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_member_id' })
  team_member: TeamMember;

  @ManyToOne(() => BranchSportTeam, (team) => team.team_member_subscriptions, {
    eager: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'team_id' })
  team: BranchSportTeam;

  @ManyToOne(() => Staff, { eager: false, nullable: true })
  @JoinColumn({ name: 'created_by_staff_id' })
  created_by: Staff | null;

  @ManyToOne(() => Staff, { eager: false, nullable: true })
  @JoinColumn({ name: 'approved_by_staff_id' })
  approved_by: Staff | null;

  @ManyToOne(() => Announcement, { eager: false, nullable: true })
  @JoinColumn({ name: 'announcement_id' })
  announcement: Announcement | null;
}
