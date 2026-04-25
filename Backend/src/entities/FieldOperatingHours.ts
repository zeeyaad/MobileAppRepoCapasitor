import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
  Unique,
} from "typeorm";
import { Field } from "./Field";

@Entity("field_operating_hours")
@Index("idx_field_operating_hours_field_id", ["field_id"])
@Unique("uq_field_operating_hours_field_day", ["field_id", "day_of_week"])
export class FieldOperatingHours {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  // ─── Field Reference ────────────────────────────────────────────────────
  @Column({ type: "uuid", name: "field_id" })
  field_id: string;

  @ManyToOne(() => Field, (field) => field.operating_hours, { onDelete: "CASCADE" })
  @JoinColumn({ name: "field_id" })
  field: Field;

  // ─── Operating Hours ────────────────────────────────────────────────────
  @Column({ type: "integer", name: "day_of_week" })
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  @Column({ type: "time", name: "opening_time" })
  opening_time: string; // HH:MM:SS format

  @Column({ type: "time", name: "closing_time" })
  closing_time: string; // HH:MM:SS format

  // ─── Timestamps ─────────────────────────────────────────────────────────
  @CreateDateColumn({ name: "created_at" })
  created_at: Date;
}
