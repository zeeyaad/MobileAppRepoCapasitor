import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
} from 'typeorm';

export type AuditStatus = 'نجح' | 'فشل';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    userName: string; // Snapshot of user name

    @Column({ type: 'varchar', length: 50 })
    role: string; // Snapshot of role

    @Column({ type: 'varchar', length: 50 })
    action: string; // e.g., Create, Update, Delete

    @Column({ type: 'varchar', length: 50 })
    module: string; // e.g., Members, Payments

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 20 })
    status: string; // 'نجح' or 'فشل' (Success/Fail)

    @Column({ type: 'varchar', length: 45, nullable: true })
    ipAddress: string;

    @Column({ type: 'jsonb', nullable: true })
    oldValue: any;

    @Column({ type: 'jsonb', nullable: true })
    newValue: any;

    @CreateDateColumn()
    dateTime: Date;
}
