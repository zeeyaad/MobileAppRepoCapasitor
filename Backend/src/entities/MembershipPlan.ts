import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { MemberType } from './MemberType';
import { MemberMembership } from './MemberMembership';

@Entity('membership_plans')
@Unique(['plan_code'])
export class MembershipPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  member_type_id: number;

  @Column({ type: 'varchar', length: 50 })
  plan_code: string;

  @Column({ type: 'varchar', length: 100 })
  name_en: string;

  @Column({ type: 'varchar', length: 100 })
  name_ar: string;

  @Column({ type: 'text', nullable: true })
  description_en: string;

  @Column('varchar', { length: 4000, nullable: true })
  description_ar: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 10, default: 'EGP' })
  currency: string;

  @Column()
  duration_months: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  renewal_price: number;

  @Column({ type: 'boolean', default: false })
  is_installable: boolean;

  @Column({ type: 'int', nullable: true })
  max_installments: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_for_foreigner: boolean;

  @Column({ type: 'int', nullable: true })
  min_age: number;

  @Column({ type: 'int', nullable: true })
  max_age: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => MemberType, (type) => type.membership_plans)
  @JoinColumn({ name: 'member_type_id' })
  member_type: MemberType;

  @OneToMany(() => MemberMembership, (mem) => mem.membership_plan)
  member_memberships: MemberMembership[];
}
