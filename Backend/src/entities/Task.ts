import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum TaskStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

export enum TaskType {
    SPORT_CREATION = 'SPORT_CREATION',
    FINANCE = 'FINANCE',
    MEMBERSHIP_UPDATE = 'MEMBERSHIP_UPDATE',
    GENERAL = 'GENERAL',
}

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: TaskType,
        default: TaskType.GENERAL,
    })
    type: TaskType;

    @Column({
        type: 'enum',
        enum: TaskStatus,
        default: TaskStatus.PENDING,
    })
    status: TaskStatus;

    @Column({ type: 'jsonb', nullable: true })
    data: Record<string, any>;

    @Column({ type: 'varchar', length: 100, nullable: true })
    created_by: string; // Staff Name or ID

    @Column({ type: 'varchar', length: 100, nullable: true })
    assigned_to: string; // Role or specific staff ID

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
