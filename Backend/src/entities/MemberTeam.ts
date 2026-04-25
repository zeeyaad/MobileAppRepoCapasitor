import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Member } from './Member';
import { Team } from './Team';
import { Payment } from './Payment';

@Entity('member_teams')
export class MemberTeam {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid' })
  team_id!: string;

  @Column()
  member_id!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ type: 'date', nullable: true })
  start_date!: Date | null;

  @Column({ type: 'date', nullable: true })
  end_date!: Date | null;

  @Column({ type: 'varchar', length: 20, default: 'pending', comment: 'pending, approved, declined, cancelled, active, inactive' })
  status!: string;

  @Column({ type: 'varchar', length: 50, default: 'pending_payment', comment: 'pending_payment, pending_admin_approval, active, cancelled, expired' })
  subscription_status!: string;

  @Column({ type: 'integer', nullable: true })
  payment_id!: number | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payment_reference!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  payment_completed_at!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  admin_approved_at!: Date | null;

  @Column({ type: 'integer', nullable: true })
  approved_by_staff_id!: number | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  price!: number;

  // Relations
  @ManyToOne(() => Member, (member) => member.id)
  @JoinColumn({ name: 'member_id' })
  member!: Member;

  @ManyToOne(() => Team, (team) => team.id)
  @JoinColumn({ name: 'team_id' })
  team!: Team;

  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment?: Payment;
}
