import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { Advertisement } from './Advertisement';

@Entity('advertisement_categories')
@Unique(['code'])
export class AdvertisementCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  code: string; // PROMOTION, EVENT, ANNOUNCEMENT, NEWS, etc.

  @Column({ type: 'varchar', length: 100 })
  name_en: string;

  @Column({ type: 'varchar', length: 100 })
  name_ar: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description_en: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description_ar: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color_code: string; // For UI display (e.g., #FF5733)

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Advertisement, (ad) => ad.category)
  advertisements: Advertisement[];
}
