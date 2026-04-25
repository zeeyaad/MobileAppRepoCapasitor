import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Staff } from './Staff';
import { PrivilegePackage } from './PrivilegePackage';

/**
 * StaffPackage Entity
 * 
 * Tracks complete privilege package assignments to staff members.
 * 
 * Used ONLY when assigning a complete package without modifications.
 * If any modifications are needed (adding extra privileges or removing specific ones),
 * use StaffPrivilegeOverride instead.
 * 
 * Relationship:
 * - Staff --(one-to-many)--> StaffPackage --(many-to-one)--> PrivilegePackage
 * - Through PrivilegePackage -> Privilege (via privilege_package_members)
 */
@Entity('staff_packages')
export class StaffPackage {
  @PrimaryColumn({ type: 'integer' })
  staff_id: number;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @PrimaryColumn({ type: 'integer' })
  package_id: number;

  @ManyToOne(() => PrivilegePackage, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package: PrivilegePackage;

  @CreateDateColumn()
  assigned_at: Date;

  @Column({ type: 'integer', nullable: true })
  assigned_by: number | null; // Staff ID of who made this assignment
}
