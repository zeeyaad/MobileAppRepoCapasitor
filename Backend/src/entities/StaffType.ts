import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';

@Entity('staff_types')
@Unique(['code'])
export class StaffType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  code: string; // ADMIN, MANAGER, RECEPTIONIST, TRAINER, etc.

  @Column({ type: 'varchar', length: 100 })
  name_en: string;

  @Column({ type: 'varchar', length: 100 })
  name_ar: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description_en: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description_ar: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany('Staff', 'staff_type')
  staff_members: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
}
