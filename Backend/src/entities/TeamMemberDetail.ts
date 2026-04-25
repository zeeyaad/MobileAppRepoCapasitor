import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('team_member_details')
export class TeamMemberDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    team_member_id: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    photo: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    medical_report: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 50, default: 'player' })
    position: string;

    @Column({ type: 'varchar', length: 50, default: 'pending' })
    status: string; // pending, approved, rejected, suspended, active

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
