import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Branch } from './Branch';
import { Sport } from './Sport';

/**
 * BranchSport Entity
 * 
 * Represents a many-to-many relationship between Branches and Sports.
 * This allows filtering:
 * 1. By branch to see available sports
 * 2. By sport to see available branches
 * 
 * Each branch can have multiple sports.
 * Each sport can be available in multiple branches.
 */
@Entity('branch_sports')
@Index('idx_branch_sport_branch_id', ['branch_id'])
@Index('idx_branch_sport_sport_id', ['sport_id'])
@Unique(['branch_id', 'sport_id'])
export class BranchSport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  branch_id: number;

  @Column()
  sport_id: number;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @ManyToOne(() => Sport, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sport_id' })
  sport: Sport;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string; // 'active', 'inactive'

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
