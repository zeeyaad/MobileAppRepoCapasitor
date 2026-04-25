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
import { Faculty } from './Faculty';

@Entity('university_student_details')
@Unique(['member_id'])
@Index('idx_uni_student_member', ['member_id'])
export class UniversityStudentDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  member_id: number;

  @Column({ nullable: true })
  faculty_id: number;

  @Column({ type: 'int', nullable: true })
  graduation_year: number;

  @Column({ type: 'date', nullable: true })
  enrollment_date: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  student_proof: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => Faculty, (fac) => fac.university_student_details)
  @JoinColumn({ name: 'faculty_id' })
  faculty: Faculty;
}
