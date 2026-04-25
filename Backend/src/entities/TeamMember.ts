import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Account } from './Account';
import { TeamMemberTeam } from './TeamMemberTeam';

@Entity('team_members')
@Index('idx_team_member_account', ['account_id'])
@Index('idx_team_member_status', ['status'])
export class TeamMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  account_id: number;

  @Column({ type: 'varchar', length: 50 })
  first_name_en: string;

  @Column({ type: 'varchar', length: 50 })
  first_name_ar: string;

  @Column({ type: 'varchar', length: 50 })
  last_name_en: string;

  @Column({ type: 'varchar', length: 50 })
  last_name_ar: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nationality: string;

  @Column({ type: 'date', nullable: true })
  birthdate: Date | null;

  @Column({ type: 'varchar', length: 50, unique: true })
  national_id: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  photo: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  medical_report: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  national_id_front: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  national_id_back: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  proof: string;

  @Column({ type: 'boolean', default: false })
  is_foreign: boolean;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string; // pending, approved, rejected, suspended, active

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @OneToMany(() => TeamMemberTeam, (team) => team.team_member)
  team_member_teams: TeamMemberTeam[];
}
