import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Staff } from './Staff';
import { Privilege } from './Privilege';

/**
 * StaffPrivilegeOverride Entity
 * 
 * Tracks individual privilege modifications for staff members.
 * Used for two scenarios:
 * 
 * 1. Granting additional privileges (is_granted = true)
 *    - Privileges not part of any assigned package
 *    - Extra privileges added to a package assignment
 * 
 * 2. Revoking privileges (is_granted = false)
 *    - Removing specific privileges from an assigned package
 *    - Temporarily disabling a privilege
 * 
 * If a staff member is assigned a complete package without modifications,
 * no records are created here. Instead, the assignment is tracked in staff_packages table.
 */
@Entity('staff_privileges_override')
export class StaffPrivilegeOverride {
  @PrimaryColumn({ type: 'integer' })
  staff_id: number;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @PrimaryColumn({ type: 'integer' })
  privilege_id: number;

  @ManyToOne(() => Privilege, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'privilege_id' })
  privilege: Privilege;

  @Column({ type: 'boolean', default: true })
  is_granted: boolean; // true: grant this privilege, false: revoke this privilege

  @CreateDateColumn()
  assigned_at: Date;

  @Column({ type: 'integer', nullable: true })
  assigned_by: number | null; // Staff ID of who made this assignment
}
