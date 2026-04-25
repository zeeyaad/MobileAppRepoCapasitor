import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Sport } from './Sport';
import { Branch } from './Branch';
import { Staff } from './Staff';

/**
 * SportBranch Entity
 * 
 * Represents the many-to-many relationship between Sports and Branches.
 * A sport can exist in multiple branches, and a branch can have multiple sports.
 * This allows configuration of which sports are available in which branches.
 */
@Entity('sport_branches')
@Index('idx_sport_branch_status', ['status'])
@Index('idx_sport_branches_sport_id', ['sport_id'])
@Index('idx_sport_branches_branch_id', ['branch_id'])
@Unique(['sport_id', 'branch_id']) // Ensure each sport-branch combination is unique
export class SportBranch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sport_id: number;

  @Column()
  branch_id: number;

  @Column()
  created_by_staff_id: number;

  // Sport availability status in this branch
  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string; // active, inactive, archived, pending

  @Column({ type: 'varchar', length: 500, nullable: true })
  status_reason: string | null;

  // Availability settings for this sport in this branch
  @Column({ type: 'boolean', default: true })
  is_enrollment_open: boolean; // Can members enroll in this sport in this branch?

  @Column({ type: 'timestamp', nullable: true })
  enrollment_start_date: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  enrollment_end_date: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  created_at: Date;

  // Relations
  @ManyToOne(() => Sport, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sport_id' })
  sport: Sport;

  @ManyToOne(() => Branch, { eager: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Staff, { eager: false })
  @JoinColumn({ name: 'created_by_staff_id' })
  created_by: Staff;
}
