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
import { Sport } from './Sport';
import { Branch } from './Branch';
import { TeamTrainingSchedule } from './TeamTrainingSchedule';
import { TeamMemberTeam } from './TeamMemberTeam';

@Entity('teams')
export class Team {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'integer' })
    sport_id: number;

    @ManyToOne(() => Sport, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'sport_id' })
    sport: Sport;

    @Column({ type: 'integer', nullable: true })
    branch_id: number | null;

    @ManyToOne(() => Branch, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'branch_id' })
    branch: Branch | null;

    @Column({ type: 'varchar', length: 255 })
    name_en: string;

    @Column({ type: 'varchar', length: 255 })
    name_ar: string;

    @Column({ type: 'integer', default: 20 })
    max_participants: number;

    @Column({
        type: 'varchar',
        length: 50,
        default: 'active',
        enum: ['active', 'inactive', 'suspended', 'archived'],
    })
    status: 'active' | 'inactive' | 'suspended' | 'archived';

    @Column({ type: 'boolean', default: false })
    approval_required: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    subscription_price: number | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Relations
    @OneToMany(() => TeamTrainingSchedule, (schedule) => schedule.team)
    training_schedules: TeamTrainingSchedule[];

    @OneToMany(() => TeamMemberTeam, (teamMemberTeam) => teamMemberTeam.team)
    team_member_teams: TeamMemberTeam[];
}
