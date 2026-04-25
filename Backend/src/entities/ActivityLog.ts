import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Member } from './Member';

@Entity('activity_logs')
@Index('idx_activity_member', ['member_id'])
@Index('idx_activity_date', ['action_date'])
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  member_id: number;

  @Column({ type: 'varchar', length: 100 })
  action: string; // registered, renewed, paid, suspended, banned

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @CreateDateColumn()
  action_date: Date;

  // Relations
  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;
}
