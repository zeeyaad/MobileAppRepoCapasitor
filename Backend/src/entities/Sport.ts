import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { Staff } from './Staff';
import { Team } from './Team';
import { TeamTrainingSchedule } from './TeamTrainingSchedule';

@Entity('sports')
export class Sport {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name_en: string;

    @Column({ type: 'varchar', length: 100 })
    name_ar: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    description_en: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    description_ar: string | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price: number | null;

    @Column({ type: 'varchar', length: 20, default: 'pending' })
    status: string; // 'pending', 'active', 'inactive', 'rejected'

    @Column({ type: 'integer' })
    created_by_staff_id: number;

    @ManyToOne(() => Staff, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'created_by_staff_id' })
    created_by: Staff;

    @Column({ type: 'integer', nullable: true })
    approved_by_staff_id: number | null;

    @ManyToOne(() => Staff, { nullable: true })
    @JoinColumn({ name: 'approved_by_staff_id' })
    approved_by: Staff | null;

    @Column({ type: 'timestamp', nullable: true })
    approved_at: Date | null;

    @Column({ type: 'text', nullable: true })
    approval_comments: string | null;

    @Column({ type: 'text', nullable: true })
    sport_image: string | null; // Base64 data URL or remote URL for sport image

    @Column({ type: 'integer', default: 0 })
    max_participants: number; // Maximum number of participants (0 = unlimited)

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @OneToMany(() => Team, (team) => team.sport)
    teams: Team[];

    @OneToMany(() => TeamTrainingSchedule, (schedule) => schedule.sport)
    training_schedules: TeamTrainingSchedule[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
