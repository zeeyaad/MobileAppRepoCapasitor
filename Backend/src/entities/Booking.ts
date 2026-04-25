import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from "typeorm";
import { BookingParticipant } from "./BookingParticipant";
import { Sport } from "./Sport";

export type UserType = "member" | "team_member";
export type BookingStatus = "pending_payment" | "confirmed" | "completed" | "cancelled";

@Entity("bookings")
@Index("idx_bookings_field_id", ["field_id"])
@Index("idx_bookings_status", ["status"])
@Index("idx_bookings_start_time", ["start_time"])
@Index("idx_bookings_member_id", ["member_id"])
@Index("idx_bookings_team_member_id", ["team_member_id"])
export class Booking {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ─── User Information ───────────────────────────────────────────────────
  @Column({ type: "integer", nullable: true, name: "member_id" })
  member_id: number | null; // member_id from members table (INTEGER)

  @Column({ type: "integer", nullable: true, name: "team_member_id" })
  team_member_id: number | null; // team_member_id from team_members table (INTEGER)

  // ─── Booking Information ────────────────────────────────────────────────
  @Column({ type: "integer", name: "sport_id" })
  sport_id: number;

  @ManyToOne(() => Sport, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "sport_id" })
  sport: Sport;

  @Column({ type: "uuid", name: "field_id" })
  field_id: string; // UUID reference to Field entity

  @Column({ type: "timestamp", name: "start_time" })
  start_time: Date;

  @Column({ type: "timestamp", name: "end_time" })
  end_time: Date;

  @Column({ type: "integer", name: "duration_minutes", nullable: true })
  duration_minutes: number; // Duration in minutes, can be calculated from start_time and end_time

  // ─── Pricing & Payment ──────────────────────────────────────────────────
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0, name: "price" })
  price: number;

  @Column({ type: "varchar", length: 50, default: "pending_payment", name: "status" })
  status: BookingStatus;

  @Column({ type: "varchar", length: 255, nullable: true, name: "payment_reference" })
  payment_reference: string | null;

  @Column({ type: "timestamp", nullable: true, name: "payment_completed_at" })
  payment_completed_at: Date | null;

  // ─── Sharing & Participation ────────────────────────────────────────────
  @Column({ type: "varchar", length: 64, unique: true, name: "share_token" })
  share_token: string; // 64-character unique token for sharing

  @Column({ type: "integer", default: 1, name: "expected_participants" })
  expected_participants: number;

  // ─── Additional Information ─────────────────────────────────────────────
  @Column({ type: "text", nullable: true, name: "notes" })
  notes: string | null;

  @Column({ type: "varchar", length: 2, default: "ar", name: "language" })
  language: "ar" | "en";

  // ─── Status Updates ─────────────────────────────────────────────────────
  @Column({ type: "timestamp", nullable: true, name: "cancelled_at" })
  cancelled_at: Date | null;

  @Column({ type: "timestamp", nullable: true, name: "completed_at" })
  completed_at: Date | null;

  // ─── Timestamps ─────────────────────────────────────────────────────────
  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  // ─── Relations ──────────────────────────────────────────────────────────
  @OneToMany(() => BookingParticipant, (participant) => participant.booking, {
    cascade: ["insert", "update"],
  })
  participants: BookingParticipant[];
}
