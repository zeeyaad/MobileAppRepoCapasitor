import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Staff } from './Staff';

/**
 * StaffActivityLog Entity
 * 
 * Tracks all significant actions performed on staff accounts:
 * - Account creation
 * - Privilege assignments/changes
 * - Account deactivation
 * - Password changes
 * - Status changes
 * 
 * Used for audit trails and activity monitoring.
 */
@Entity('staff_activity_logs')
export class StaffActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  staff_id: number;

  @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Column({ type: 'varchar', length: 50 })
  action_type: string; // CREATED, PRIVILEGE_ASSIGNED, PRIVILEGE_REVOKED, STATUS_CHANGED, DEACTIVATED, etc.

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string; // Human-readable description of the action

  @Column({ type: 'integer', nullable: true })
  performed_by: number | null; // Staff ID of who performed this action (null for system actions)

  @CreateDateColumn()
  created_at: Date;
}
