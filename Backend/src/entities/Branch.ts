import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { BranchSportTeam } from './BranchSportTeam';

@Entity('branches')
@Unique(['code'])
export class Branch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name_en: string;

  @Column({ type: 'varchar', length: 100 })
  name_ar: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location_en: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location_ar: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string; // active, inactive, archived

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => BranchSportTeam, (team) => team.branch, { eager: false })
  branch_sport_teams: BranchSportTeam[];
}
