import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Account } from './Account';
import { MemberRelationship } from './MemberRelationship';
import { MemberMembership } from './MemberMembership';
import { MemberType } from './MemberType';

@Entity('members')
@Index('idx_member_type', ['member_type_id'])
@Index('idx_member_status', ['status'])
export class Member {
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

  @Column({ type: 'varchar', length: 100, nullable: true })
  health_status: string;

  @Column({ type: 'boolean', default: false })
  is_foreign: boolean;

  @Column({ type: 'text', nullable: true })
  photo: string;

  @Column({ type: 'text', nullable: true })
  national_id_front: string;

  @Column({ type: 'text', nullable: true })
  national_id_back: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  medical_report: string;

  @Column()
  member_type_id: number;

  @Column({ type: 'int', default: 0 })
  points_balance: number;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string; // active, suspended, banned, expired, cancelled

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @OneToOne(() => Account)
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => MemberType)
  @JoinColumn({ name: 'member_type_id' })
  member_type: MemberType;

  @OneToMany(() => MemberRelationship, (rel) => rel.member)
  relationships: MemberRelationship[];

  @OneToMany(() => MemberMembership, (mem) => mem.member)
  memberships: MemberMembership[];
}