import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('universities')
@Unique(['code'])
export class University {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'varchar', length: 150 })
  name_en: string;

  @Column({ type: 'nvarchar', length: 150 })
  name_ar: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location_en: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  location_ar: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
