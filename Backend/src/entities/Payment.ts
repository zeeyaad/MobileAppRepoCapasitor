import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Staff } from './Staff';

export type PaymentType =
  | 'team_subscription'
  | 'field_booking'
  | 'package_purchase'
  | 'membership_fee'
  | 'training_session'
  | 'tournament_registration'
  | 'equipment_rental'
  | 'late_fee'
  | 'refund';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

export type PaymentMethod = 'credit_card' | 'cash' | 'bank_transfer' | 'wallet' | 'installment';

export type EntityType = 'member' | 'team_member' | 'guest';

export type RelatedEntityType = 'team' | 'team_subscription' | 'field_booking' | 'package' | 'membership' | 'training_session';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  // Payment identification
  @Column({ type: 'varchar', length: 255, unique: true })
  payment_reference!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transaction_id?: string;

  // Payment type and entity references
  @Column({ type: 'varchar', length: 50 })
  payment_type!: PaymentType;

  @Column({ type: 'varchar', length: 50, nullable: true })
  entity_type?: EntityType;

  @Column({ type: 'integer', nullable: true })
  entity_id?: number;

  // Related entity (what they're paying for)
  @Column({ type: 'varchar', length: 50, nullable: true })
  related_entity_type?: RelatedEntityType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  related_entity_id?: string;

  // Financial details
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', length: 3, default: 'EGP' })
  currency!: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  payment_method?: PaymentMethod;

  // Payment gateway details
  @Column({ type: 'varchar', length: 50, nullable: true })
  gateway_name?: string;

  @Column({ type: 'text', nullable: true })
  gateway_response?: string;

  // Status tracking
  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status!: PaymentStatus;

  // Timestamps
  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at?: Date;

  @Column({ type: 'timestamp', nullable: true })
  refunded_at?: Date;

  // Staff tracking
  @Column({ type: 'integer', nullable: true })
  processed_by_staff_id?: number;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'processed_by_staff_id' })
  processed_by_staff?: Staff;

  @Column({ type: 'integer', nullable: true })
  refunded_by_staff_id?: number;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'refunded_by_staff_id' })
  refunded_by_staff?: Staff;

  // Additional metadata
  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, unknown>;
}
