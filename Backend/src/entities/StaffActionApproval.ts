import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('staff_action_approvals')
export class StaffActionApproval {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  staff_id: number; // The deputy manager who initiated the action

  @Column({ type: 'varchar', length: 50 })
  action_type: string; // 'CREATE_STAFF', 'UPDATE_STAFF', 'DEACTIVATE_STAFF', 'ASSIGN_PACKAGES', 'GRANT_PRIVILEGE', 'REVOKE_PRIVILEGE'

  @Column({ type: 'jsonb' })
  action_data: Record<string, unknown>; // The actual data for the action

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // 'pending', 'approved', 'rejected'

  @Column({ type: 'integer' })
  submitted_by: number; // The deputy manager who submitted the action

  @Column({ type: 'integer', nullable: true })
  approved_by: number; // The executive manager who approved/rejected

  @Column({ type: 'text', nullable: true })
  approval_comments: string; // Comments when approving or rejecting

  @Column({ type: 'timestamp', nullable: true })
  submitted_at: Date; // When action was submitted

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date; // When action was approved/rejected

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
