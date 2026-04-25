import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/data-source';
import { ActivityLog } from '../entities/ActivityLog';

const getMemberIdFromRequest = (req: Request): number | null => {
  const bodyMemberId = req.body?.member_id;
  const paramMemberId = req.params?.member_id;
  const queryMemberId = req.query?.member_id;

  const rawValue = bodyMemberId ?? paramMemberId ?? queryMemberId;
  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return null;
  }

  const parsed = parseInt(rawValue as string);
  return Number.isNaN(parsed) ? null : parsed;
};

export const activityLogger = async (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', async () => {
    try {
      const activityLogRepository = AppDataSource.getRepository(ActivityLog);
      const memberId = getMemberIdFromRequest(req);
      const statusCode = res.statusCode;
      const durationMs = Date.now() - start;
      const outcome = statusCode >= 400 ? 'failed' : 'success';

      await activityLogRepository.insert({
        member_id: memberId || undefined,
        action: 'api_request',
        description: `${req.method} ${req.originalUrl} ${statusCode} ${outcome} (${durationMs}ms)`,
        action_date: new Date(),
      });
    } catch (error) {
      console.error('Activity log insert failed:', error);
    }
  });

  next();
};
