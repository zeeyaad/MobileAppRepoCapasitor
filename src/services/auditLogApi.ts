import api from './api';

export interface AuditLog {
    id: string;
    userName: string;
    role: string;
    action: string;
    module: string;
    description: string;
    status: 'نجح' | 'فشل';
    dateTime: string;
    ipAddress: string;
    oldValue: any;
    newValue: any;
}

export interface AuditLogFilters {
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
}

export interface AuditLogResponse {
    logs: AuditLog[];
    total: number;
    currentPage: number;
    totalPages: number;
}

export const getAuditLogs = async (filters: AuditLogFilters): Promise<AuditLogResponse> => {
    const response = await api.get('/audit-logs', { params: filters });
    return response.data;
};

export const getAuditLogFilters = async (): Promise<{ actions: string[]; modules: string[]; roles: string[] }> => {
    const response = await api.get('/audit-logs/filters');
    return response.data;
};

export const getAuditStats = async (): Promise<{ total: number; successful: number; failed: number; today: number }> => {
    const response = await api.get('/audit-logs/stats');
    return response.data;
};
