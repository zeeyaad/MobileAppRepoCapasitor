import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Member } from './Member';
import { TeamMember } from './TeamMember';
import { TeamTrainingSchedule } from './TeamTrainingSchedule';

@Entity('attendance')
export class Attendance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'integer', nullable: true })
    member_id: number | null;

    @ManyToOne(() => Member, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'member_id' })
    member: Member;

    @Column({ type: 'integer', nullable: true })
    team_member_id: number | null;

    @ManyToOne(() => TeamMember, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'team_member_id' })
    team_member: any;

    @Column({ type: 'uuid' })
    team_id: string;

    @Column({ type: 'uuid' })
    training_schedule_id: string;

    @ManyToOne(() => TeamTrainingSchedule, (schedule) => schedule.attendances, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'training_schedule_id' })
    training_schedule: TeamTrainingSchedule;

    @Column({ type: 'date' })
    attendance_date: string;

    @Column({ type: 'boolean', default: false })
    attended: boolean;

    @Column({ type: 'text', nullable: true })
    notes: string | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
