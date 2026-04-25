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
import { Team } from './Team';
import { Sport } from './Sport';
import { Attendance } from './Attendance';
import { Field } from './Field';

@Entity('team_training_schedules')
export class TeamTrainingSchedule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    team_id: string;

    @ManyToOne(() => Team, (team) => team.training_schedules, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @Column({ type: 'integer', nullable: true })
    sport_id: number | null;

    @ManyToOne(() => Sport, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'sport_id' })
    sport: Sport | null;

    @Column({ type: 'varchar', length: 255 })
    days_en: string;

    @Column({ type: 'varchar', length: 255 })
    days_ar: string;

    @Column({ type: 'time' })
    start_time: string;

    @Column({ type: 'time' })
    end_time: string;

    @Column({ type: 'uuid', nullable: true })
    field_id: string | null;

    @ManyToOne(() => Field, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'field_id' })
    field: Field | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    training_fee: number;

    @Column({
        type: 'varchar',
        length: 50,
        default: 'active',
        enum: ['active', 'inactive', 'archived'],
    })
    status: 'active' | 'inactive' | 'archived';

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @OneToMany(() => Attendance, (attendance) => attendance.training_schedule)
    attendances: Attendance[];
}
