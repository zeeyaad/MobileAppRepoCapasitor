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
import { Member } from './Member';
import { Branch } from './Branch';

@Entity('outsider_details')
@Unique(['member_id'])
@Index('idx_outsider_member', ['member_id'])
export class OutsiderDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  member_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  job_title_en: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  job_title_ar: string | null;

  @Column({ type: 'varchar', length: 50, default: 'employed' })
  employment_status: string; // employed, self_employed, freelance, unemployed

  @Column({ type: 'int', nullable: true })
  branch_id: number | null; // For visitor-branch members

  @Column({ type: 'varchar', length: 50, nullable: true })
  visitor_type: string; // visitor, visitor-honorary, visitor-athletic, visitor-branch, seasonal-egy, seasonal-foreigner

  @Column({ type: 'varchar', length: 50, nullable: true })
  passport_number: string | null; // For foreigner members

  @Column({ type: 'varchar', length: 255, nullable: true })
  passport_photo: string | null; // For foreigner members

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string | null; // For foreigner members

  @Column({ type: 'varchar', length: 50, nullable: true })
  visa_status: string | null; // For foreigner members (valid, expired, pending)

  @Column({ type: 'int', nullable: true })
  duration_months: number | null; // For seasonal members (1, 6, 12)

  @Column({ type: 'boolean', default: false })
  is_installable: boolean; // For seasonal members

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => Branch)
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;
}
