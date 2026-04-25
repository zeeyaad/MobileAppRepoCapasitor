import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index
} from 'typeorm';
import { TeamMember } from './TeamMember';
import { Team } from './Team';
import { Payment } from './Payment';

@Entity('team_member_teams')
@Index('idx_team_member_teams_team_member_id', ['team_member_id'])
@Index('idx_team_member_teams_team_id', ['team_id'])
export class TeamMemberTeam {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    team_member_id: number;

    @Column({ type: 'uuid', nullable: true })
    team_id: string;

    @Column({ type: 'date', nullable: true })
    start_date: Date;

    @Column({ type: 'date', nullable: true })
    end_date: Date;

    @Column({ type: 'varchar', length: 20, default: 'pending', comment: 'pending, approved, declined, cancelled, active, inactive' })
    status: string;

    @Column({ type: 'varchar', length: 50, default: 'pending_payment', comment: 'pending_payment, pending_admin_approval, active, cancelled, expired' })
    subscription_status: string;

    @Column({ type: 'integer', nullable: true })
    payment_id: number | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    payment_reference: string | null;

    @Column({ type: 'timestamp', nullable: true })
    payment_completed_at: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    admin_approved_at: Date | null;

    @Column({ type: 'integer', nullable: true })
    approved_by_staff_id: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    price: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => TeamMember, (teamMember) => teamMember.team_member_teams)
    @JoinColumn({ name: 'team_member_id' })
    team_member: TeamMember;

    @ManyToOne(() => Team, (team) => team.id)
    @JoinColumn({ name: 'team_id' })
    team: Team;

    @ManyToOne(() => Payment, { nullable: true })
    @JoinColumn({ name: 'payment_id' })
    payment?: Payment;
}
