import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { PrivilegePackage } from './PrivilegePackage';
import { Privilege } from './Privilege';

/**
 * StaffPackagePrivilege Entity
 * 
 * Junction table that maps privileges to privilege packages.
 * Allows defining which privileges belong to which package.
 * 
 * Example: The "MEDIA_CENTER_MANAGER" package contains:
 *   - MEDIA_CENTER_APPROVE
 *   - MEDIA_CENTER_PUBLISH
 *   - MEDIA_CENTER_EDIT
 *   - MEDIA_CENTER_MANAGE_CATEGORIES
 */
@Entity('staff_package_privileges')
export class StaffPackagePrivilege {
  @PrimaryColumn({ type: 'integer' })
  package_id: number;

  @ManyToOne(() => PrivilegePackage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package: PrivilegePackage;

  @PrimaryColumn({ type: 'integer' })
  privilege_id: number;

  @ManyToOne(() => Privilege, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'privilege_id' })
  privilege: Privilege;

  @CreateDateColumn()
  added_at: Date;

  @Column({ type: 'integer', nullable: true })
  added_by: number | null;
}
