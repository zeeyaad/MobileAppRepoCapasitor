import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from "typeorm";
import { Booking } from "./Booking";

@Entity("booking_participants")
@Index("idx_booking_participants_booking_id", ["booking_id"])
@Index("idx_booking_participants_email", ["email"])
@Index("idx_booking_participants_national_id", ["national_id"])
export class BookingParticipant {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", name: "booking_id" })
  booking_id: string;

  @ManyToOne(() => Booking, (booking) => booking.participants, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "booking_id" })
  booking: Booking;

  // ─── Participant Information ────────────────────────────────────────────
  @Column({ type: "varchar", length: 255, name: "full_name" })
  full_name: string;

  @Column({ type: "varchar", length: 20, nullable: true, name: "phone_number" })
  phone_number: string | null; // Phone number (optional if national_id or email present)

  @Column({ type: "varchar", length: 20, nullable: true, name: "national_id" })
  national_id: string | null; // National ID (optional if phone_number or email present)

  @Column({ type: "varchar", length: 255, nullable: true, name: "email" })
  email: string | null; // Email (optional if phone_number or national_id present)

  @Column({ type: "varchar", length: 255, nullable: true, name: "national_id_front" })
  national_id_front: string | null; // Path to front photo of national ID

  @Column({ type: "varchar", length: 255, nullable: true, name: "national_id_back" })
  national_id_back: string | null; // Path to back photo of national ID

  // ─── Access Information ─────────────────────────────────────────────────
  @Column({ type: "boolean", default: false, name: "is_creator" })
  is_creator: boolean; // True if this is the booking creator

  // ─── Timestamps ─────────────────────────────────────────────────────────
  @CreateDateColumn({ name: "created_at" })
  created_at: Date;
}
