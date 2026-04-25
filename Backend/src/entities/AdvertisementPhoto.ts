import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Advertisement } from './Advertisement';

@Entity('advertisement_photos')
export class AdvertisementPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Advertisement, (ad) => ad.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'advertisement_id' })
  advertisement: Advertisement;

  @Column({ type: 'int' })
  advertisement_id: number;

  @Column({ type: 'varchar', length: 500 })
  photo_url: string; // Path or URL to the photo

  @Column({ type: 'varchar', length: 100 })
  original_filename: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  alt_text_en: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  alt_text_ar: string;

  @Column({ type: 'int' })
  display_order: number; // Order in which photos should be displayed

  @CreateDateColumn()
  created_at: Date;
}
