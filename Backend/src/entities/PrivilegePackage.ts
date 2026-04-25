import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

/**
 * PrivilegePackage Entity
 * 
 * Groups of related privileges that can be assigned together to staff members.
 * Examples: ADMIN_FULL, FINANCE_MANAGER, EVENTS_MANAGER
 * 
 * Relationship to privileges:
 * - PrivilegePackage --(many-to-many)--> Privilege via privileges_packages table
 * - This allows grouping multiple privileges into a single package
 */
@Entity('packages')
@Unique(['code'])
export class PrivilegePackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  code: string; // ADMIN_FULL, EXEC_MANAGER_STAFF, FINANCE_MANAGER, EVENTS_MANAGER, MEMBER_MANAGER, etc.

  @Column({ type: 'varchar', length: 150 })
  name_en: string;

  @Column({ type: 'varchar', length: 150 })
  name_ar: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description_en: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description_ar: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Note: Privileges in this package are mapped via privilege_package_members table
  // Staff assignments of this package are tracked in staff_packages table
}
