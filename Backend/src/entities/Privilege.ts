import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('privileges')
@Unique(['code'])
export class Privilege {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  code: string; // STAFF_CREATE, STAFF_VIEW, MEMBER_CREATE, AUDIT_VIEW, etc.

  @Column({ type: 'varchar', length: 150 })
  name_en: string;

  @Column({ type: 'varchar', length: 150 })
  name_ar: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description_en: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description_ar: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  module: string; // system_admin, staff_management, member_management, finance, events, reservations, etc.

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Note: Privilege assignments to staff are handled through:
  // 1. privilege_package_members (privilege -> package mapping)
  // 2. staff_packages (staff -> package assignment)
  // 3. staff_privileges_override (individual privilege grants/revokes)
}

