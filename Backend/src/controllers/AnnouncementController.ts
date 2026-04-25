import { Request, Response } from 'express';
import { AnnouncementService } from '../services/AnnouncementService';

interface AuthenticatedRequest extends Request {
  user?: {
    staff_id?: number;
    id?: number;
    email?: string;
    [key: string]: unknown;
  };
}

/**
 * AnnouncementController
 * 
 * Handles announcements for promoting sports:
 * - Admin: Create, update, delete, publish announcements
 * - Users: View published announcements, click to subscribe
 */
export class AnnouncementController {
  private announcementService: AnnouncementService;

  constructor() {
    this.announcementService = new AnnouncementService();
  }

  /**
   * CREATE - Create a new announcement
   * POST /api/announcements
   * Admin only
   */
  createAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      if (!user || !user.staff_id) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const {
        sport_id,
        branch_id,
        title_en,
        title_ar,
        description_en,
        description_ar,
        banner_image,
        thumbnail_image,
        external_link,
        target_role,
        min_age,
        max_age,
        priority,
        expires_at,
      } = req.body;

      // Validation
      if (!sport_id || !title_en || !title_ar) {
        res.status(400).json({
          success: false,
          message: 'Missing required fields: sport_id, title_en, title_ar',
        });
        return;
      }

      const announcement = await this.announcementService.createAnnouncement({
        sport_id: Number(sport_id),
        branch_id: branch_id ? Number(branch_id) : null,
        created_by_staff_id: user.staff_id,
        title_en,
        title_ar,
        description_en,
        description_ar,
        banner_image,
        thumbnail_image,
        external_link,
        target_role,
        min_age: min_age ? Number(min_age) : 0,
        max_age: max_age ? Number(max_age) : 0,
        priority: priority ? Number(priority) : 0,
        expires_at: expires_at ? new Date(expires_at) : null,
      });

      res.status(201).json({
        success: true,
        message: 'Announcement created successfully',
        data: announcement,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create announcement',
        error: errorMessage,
      });
    }
  };

  /**
   * READ - Get announcement by ID
   * GET /api/announcements/:announcementId
   */
  getAnnouncementById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { announcementId } = req.params;

      if (!announcementId) {
        res.status(400).json({
          success: false,
          message: 'Announcement ID is required',
        });
        return;
      }

      const announcement = await this.announcementService.getAnnouncementById(Number(announcementId));

      if (!announcement) {
        res.status(404).json({
          success: false,
          message: 'Announcement not found',
        });
        return;
      }

      // Record view
      await this.announcementService.recordView(Number(announcementId));

      res.json({
        success: true,
        data: announcement,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch announcement',
        error: errorMessage,
      });
    }
  };

  /**
   * READ - Get all announcements (admin)
   * GET /api/announcements?sport_id=1&branch_id=1&status=published
   */
  getAllAnnouncements = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sport_id, branch_id, status, is_visible } = req.query;

      const filters = {
        sport_id: sport_id ? Number(sport_id) : undefined,
        branch_id: branch_id ? Number(branch_id) : undefined,
        status: status ? String(status) : undefined,
        is_visible: is_visible ? is_visible === 'true' : undefined,
      };

      const announcements = await this.announcementService.getAllAnnouncements(filters);

      res.json({
        success: true,
        count: announcements.length,
        data: announcements,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching announcements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch announcements',
        error: errorMessage,
      });
    }
  };

  /**
   * READ - Get public announcements (users)
   * GET /api/announcements/public?sport_id=1&branch_id=1&target_role=member
   */
  getPublicAnnouncements = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sport_id, branch_id, target_role, minAge, maxAge } = req.query;

      const filters = {
        sport_id: sport_id ? Number(sport_id) : undefined,
        branch_id: branch_id ? Number(branch_id) : undefined,
        target_role: target_role ? String(target_role) : undefined,
        minAge: minAge ? Number(minAge) : undefined,
        maxAge: maxAge ? Number(maxAge) : undefined,
      };

      const announcements = await this.announcementService.getPublicAnnouncements(filters);

      res.json({
        success: true,
        count: announcements.length,
        data: announcements,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching public announcements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch announcements',
        error: errorMessage,
      });
    }
  };

  /**
   * READ - Get announcements by sport
   * GET /api/announcements/sport/:sportId
   */
  getAnnouncementsBySport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sportId } = req.params;

      if (!sportId) {
        res.status(400).json({
          success: false,
          message: 'Sport ID is required',
        });
        return;
      }

      const announcements = await this.announcementService.getAnnouncementsBySport(
        Number(sportId),
        true // published only
      );

      res.json({
        success: true,
        count: announcements.length,
        data: announcements,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching announcements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch announcements',
        error: errorMessage,
      });
    }
  };

  /**
   * UPDATE - Update announcement
   * PUT /api/announcements/:announcementId
   * Admin only
   */
  updateAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { announcementId } = req.params;

      if (!announcementId) {
        res.status(400).json({
          success: false,
          message: 'Announcement ID is required',
        });
        return;
      }

      const announcement = await this.announcementService.updateAnnouncement(
        Number(announcementId),
        req.body
      );

      if (!announcement) {
        res.status(404).json({
          success: false,
          message: 'Announcement not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Announcement updated successfully',
        data: announcement,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error updating announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update announcement',
        error: errorMessage,
      });
    }
  };

  /**
   * ACTION - Publish announcement
   * PATCH /api/announcements/:announcementId/publish
   * Admin only
   */
  publishAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { announcementId } = req.params;

      if (!announcementId) {
        res.status(400).json({
          success: false,
          message: 'Announcement ID is required',
        });
        return;
      }

      const announcement = await this.announcementService.publishAnnouncement(Number(announcementId));

      if (!announcement) {
        res.status(404).json({
          success: false,
          message: 'Announcement not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Announcement published successfully',
        data: announcement,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error publishing announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to publish announcement',
        error: errorMessage,
      });
    }
  };

  /**
   * ACTION - Archive announcement
   * PATCH /api/announcements/:announcementId/archive
   * Admin only
   */
  archiveAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { announcementId } = req.params;

      if (!announcementId) {
        res.status(400).json({
          success: false,
          message: 'Announcement ID is required',
        });
        return;
      }

      const announcement = await this.announcementService.archiveAnnouncement(Number(announcementId));

      if (!announcement) {
        res.status(404).json({
          success: false,
          message: 'Announcement not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Announcement archived successfully',
        data: announcement,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error archiving announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to archive announcement',
        error: errorMessage,
      });
    }
  };

  /**
   * DELETE - Delete announcement
   * DELETE /api/announcements/:announcementId
   * Admin only
   */
  deleteAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { announcementId } = req.params;

      if (!announcementId) {
        res.status(400).json({
          success: false,
          message: 'Announcement ID is required',
        });
        return;
      }

      const deleted = await this.announcementService.deleteAnnouncement(Number(announcementId));

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Announcement not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Announcement deleted successfully',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error deleting announcement:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete announcement',
        error: errorMessage,
      });
    }
  };

  /**
   * ACTION - Record announcement click
   * POST /api/announcements/:announcementId/click
   */
  recordClick = async (req: Request, res: Response): Promise<void> => {
    try {
      const { announcementId } = req.params;

      if (!announcementId) {
        res.status(400).json({
          success: false,
          message: 'Announcement ID is required',
        });
        return;
      }

      await this.announcementService.recordClick(Number(announcementId));

      res.json({
        success: true,
        message: 'Click recorded',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error recording click:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record click',
        error: errorMessage,
      });
    }
  };

  /**
   * READ - Get trending announcements
   * GET /api/announcements/trending
   */
  getTrendingAnnouncements = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit } = req.query;
      const announcements = await this.announcementService.getTrendingAnnouncements(
        limit ? Number(limit) : 5
      );

      res.json({
        success: true,
        count: announcements.length,
        data: announcements,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching trending announcements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch announcements',
        error: errorMessage,
      });
    }
  };
}
