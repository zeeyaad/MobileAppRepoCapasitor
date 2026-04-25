import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('media_posts')
export class MediaPost {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 50 })
    category: string; // "صور" | "فيديو" | "فعاليات"

    @Column({ type: 'simple-array', nullable: true })
    images: string[];

    @Column({ type: 'varchar', length: 500, nullable: true })
    videoUrl: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    videoDuration: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    date: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
