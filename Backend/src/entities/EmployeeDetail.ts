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
import { Profession } from './Profession';

@Entity('employee_details')
@Unique(['member_id'])
@Index('idx_employee_member', ['member_id'])
@Index('idx_employee_profession', ['profession_id'])
export class EmployeeDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  member_id: number;

  @Column()
  profession_id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department_en: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  department_ar: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salary: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  salary_slip: string;

  @Column({ type: 'date', nullable: true })
  employment_start_date: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => Profession, (prof) => prof.employee_details)
  @JoinColumn({ name: 'profession_id' })
  profession: Profession;
}
