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

@Entity('retired_employee_details')
@Unique(['member_id'])
@Index('idx_retired_member', ['member_id'])
export class RetiredEmployeeDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  member_id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  profession_code: string | null; // RETIRED_PROF, RETIRED_TA, RETIRED_AL, RETIRED_STAFF

  @Column({ type: 'varchar', length: 100, nullable: true })
  former_department_en: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  former_department_ar: string;

  @Column({ type: 'date' })
  retirement_date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  last_salary: number | null; // Last salary before retirement

  @Column({ type: 'varchar', length: 255, nullable: true })
  salary_slip: string | null; // Path to salary slip document

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;
}
