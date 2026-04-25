import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Unique,
  Index,
} from 'typeorm';
import { Member } from './Member';
import { TeamMember } from './TeamMember';
import { ActivityLog } from './ActivityLog';

@Entity('accounts')
@Unique(['email'])
@Index('idx_account_email', ['email'])
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 50, default: 'member' })
  role: string; // admin, staff, moderator, member, SpecialistSportActivities, ManagerSportActivities

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string; // active, suspended, banned, pending

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  password_changed_at: Date | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => Member, (member) => member.account)
  member: Member;

  @OneToOne(() => TeamMember, (teamMember) => teamMember.account)
  team_member: TeamMember;

  @OneToMany(() => ActivityLog, (log) => log.member)
  activity_logs: ActivityLog[];
}
