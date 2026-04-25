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
import { Member } from './Member';
import { MembershipPlan } from './MembershipPlan';

@Entity('member_memberships')
@Index('idx_membership_member', ['member_id'])
@Index('idx_membership_status', ['status'])
@Index('idx_membership_end_date', ['end_date'])
export class MemberMembership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  member_id: number;

  @Column()
  membership_plan_id: number;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string; // active, expired, suspended, cancelled

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  payment_status: string; // pending, paid

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Member, (member) => member.memberships)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => MembershipPlan, (plan) => plan.member_memberships)
  @JoinColumn({ name: 'membership_plan_id' })
  membership_plan: MembershipPlan;
}
