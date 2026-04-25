import { Request, Response } from 'express';
import { AuditLogService } from '../services/AuditLogService';

const auditLogService = new AuditLogService();

export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const filters = {
            logId: req.query.logId as string,
            userName: req.query.userName as string,
            role: req.query.role as string,
            action: req.query.action as string,
            module: req.query.module as string,
            status: req.query.status as string,
            dateFrom: req.query.dateFrom as string,
            dateTo: req.query.dateTo as string,
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        };

        const { logs, total } = await auditLogService.getLogs(filters);

        res.json({
            logs,
            total,
            currentPage: filters.page,
            totalPages: Math.ceil(total / filters.limit),
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getFilterOptions = async (req: Request, res: Response) => {
    try {
        const options = await auditLogService.getFilterOptions();
        res.json(options);
    } catch (error) {
        console.error('Error fetching filter options:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


export const getAuditStats = async (req: Request, res: Response) => {
    try {
        const stats = await auditLogService.getStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching audit stats:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

