import { AppDataSource } from '../database/data-source';
import { AuditLog } from '../entities/AuditLog';
import { Between, Like, FindOptionsWhere } from 'typeorm';

export class AuditLogService {
    private auditLogRepository = AppDataSource.getRepository(AuditLog);

    async createLog(data: Partial<AuditLog>, manager?: any): Promise<AuditLog> {
        if (manager) {
            const log = manager.create(AuditLog, data);
            return await manager.save(AuditLog, log);
        }
        const log = this.auditLogRepository.create(data);
        return await this.auditLogRepository.save(log);
    }

    async getLogs(filters: {
        logId?: string;
        userName?: string;
        role?: string;
        action?: string;
        module?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
        page?: number;
        limit?: number;
    }) {
        const where: FindOptionsWhere<AuditLog> = {};

        if (filters.logId) {
            where.id = filters.logId;
        }
        if (filters.userName) {
            where.userName = Like(`%${filters.userName}%`);
        }
        if (filters.role) {
            where.role = filters.role;
        }
        if (filters.action) {
            where.action = filters.action;
        }
        if (filters.module) {
            where.module = filters.module;
        }
        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.dateFrom && filters.dateTo) {
            where.dateTime = Between(
                new Date(`${filters.dateFrom}T00:00:00`),
                new Date(`${filters.dateTo}T23:59:59`)
            );
        } else if (filters.dateFrom) {
            where.dateTime = Between(
                new Date(`${filters.dateFrom}T00:00:00`),
                new Date('9999-12-31T23:59:59')
            );
        } else if (filters.dateTo) {
            where.dateTime = Between(
                new Date('1970-01-01T00:00:00'),
                new Date(`${filters.dateTo}T23:59:59`)
            );
        }

        const [logs, total] = await this.auditLogRepository.findAndCount({
            where,
            order: { dateTime: 'DESC' },
            skip: ((filters.page || 1) - 1) * (filters.limit || 10),
            take: filters.limit || 10,
        });

        return { logs, total };
    }

    // Helper to fetch distinct values for filters
    async getFilterOptions() {
        const actions = await this.auditLogRepository
            .createQueryBuilder('log')
            .select('DISTINCT log.action', 'action')
            .getRawMany();

        const modules = await this.auditLogRepository
            .createQueryBuilder('log')
            .select('DISTINCT log.module', 'module')
            .getRawMany();

        return {
            actions: actions.map(a => a.action),
            modules: modules.map(m => m.module),
            roles: (await this.auditLogRepository
                .createQueryBuilder('log')
                .select('DISTINCT log.role', 'role')
                .getRawMany()).map(r => r.role)
        };
    }

    async getStats() {
        const total = await this.auditLogRepository.count();
        const successful = await this.auditLogRepository.count({ where: { status: 'نجح' } });
        const failed = await this.auditLogRepository.count({ where: { status: 'فشل' } });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayLogs = await this.auditLogRepository.count({
            where: {
                dateTime: Between(today, new Date(today.getTime() + 86400000))
            }
        });

        return { total, successful, failed, today: todayLogs };
    }
}

