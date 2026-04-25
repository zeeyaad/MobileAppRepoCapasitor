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
import { Sport } from "./Sport";
import { Branch } from "./Branch";
import { FieldOperatingHours } from "./FieldOperatingHours";

@Entity("fields")
@Index("idx_fields_sport_id", ["sport_id"])
@Index("idx_fields_branch_id", ["branch_id"])
@Index("idx_fields_status", ["status"])
export class Field {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ─── Field Identification ───────────────────────────────────────────────
  @Column({ type: "varchar", length: 255, name: "name_en" })
  name_en: string;

  @Column({ type: "varchar", length: 255, name: "name_ar" })
  name_ar: string;

  // ─── Field Details ──────────────────────────────────────────────────────
  @Column({ type: "text", nullable: true, name: "description_en" })
  description_en: string | null;

  @Column({ type: "text", nullable: true, name: "description_ar" })
  description_ar: string | null;

  // ─── Sport Association ──────────────────────────────────────────────────
  @Column({ type: "integer", name: "sport_id" })
  sport_id: number;

  @ManyToOne(() => Sport)
  @JoinColumn({ name: "sport_id" })
  sport: Sport;

  // ─── Field Capacity ─────────────────────────────────────────────────────
  @Column({ type: "integer", nullable: true, name: "capacity" })
  capacity: number | null;

  // ─── Location/Branch ────────────────────────────────────────────────────
  @Column({ type: "integer", nullable: true, name: "branch_id" })
  branch_id: number | null;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: "branch_id" })
  branch: Branch | null;

  // ─── Status ─────────────────────────────────────────────────────────────
  @Column({
    type: "varchar",
    length: 20,
    default: "active",
    name: "status",
  })
  status: "active" | "inactive" | "maintenance";

  // ─── Pricing ─────────────────────────────────────────────────────────────
  @Column({ type: "numeric", precision: 10, scale: 2, nullable: true, name: "hourly_rate" })
  hourly_rate: number | null;

  // ─── Booking Settings ────────────────────────────────────────────────────
  @Column({ 
    type: "boolean", 
    default: false, 
    name: "is_available_for_booking",
    comment: "Whether this field can be booked by members/team members"
  })
  is_available_for_booking: boolean;

  @Column({ 
    type: "integer", 
    default: 60, 
    name: "booking_slot_duration",
    comment: "Booking time slot duration in minutes (e.g., 60 for 1-hour slots)"
  })
  booking_slot_duration: number;

  // ─── Operating Hours ────────────────────────────────────────────────────
  @OneToMany(() => FieldOperatingHours, (hours) => hours.field, {
    cascade: true,
  })
  operating_hours: FieldOperatingHours[];

  // ─── Timestamps ─────────────────────────────────────────────────────────
  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;
}
