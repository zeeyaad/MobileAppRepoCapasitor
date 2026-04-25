import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { MembershipPlan } from './MembershipPlan';

@Entity('member_types')
@Unique(['code'])
export class MemberType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name_en: string;

  @Column({ type: 'varchar', length: 100 })
  name_ar: string;

  @Column({ type: 'text', nullable: true })
  description_en: string;

  @Column('varchar', { length: 4000, nullable: true })
  description_ar: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToMany(() => MembershipPlan, (plan) => plan.member_type)
  membership_plans: MembershipPlan[];
}
