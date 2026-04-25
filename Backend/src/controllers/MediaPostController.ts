import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { MediaPost } from '../entities/MediaPost';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
import { AuditLogService } from '../services/AuditLogService';
import { saveToLocalStorage, DocumentType, UserType } from '../utils/localFileStorage';
import { deleteFromCloudinary } from '../utils/cloudinaryUpload';

const auditLogService = new AuditLogService();

export class MediaPostController {
    private static mediaRepo = AppDataSource.getRepository(MediaPost);

    private static async logAction(req: AuthenticatedRequest, action: string, description: string, oldValue?: Record<string, unknown> | null, newValue?: Record<string, unknown> | null) {
        try {
            if (!req.user || !req.user.staff_id) return;

            const staffRepo = AppDataSource.getRepository('Staff');
            const staff = await staffRepo.findOne({
                where: { id: req.user.staff_id },
                relations: ['staff_type']
            }) as Record<string, unknown> | null;

            const userName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : req.user.email;
            const roleObj = staff?.staff_type as Record<string, unknown> | undefined;
            const role = (roleObj?.name_en as string) || req.user.role;

            await auditLogService.createLog({
                userName,
                role,
                action,
                module: 'MediaGallery',
                description,
                status: 'نجح',
                oldValue,
                newValue,
                dateTime: new Date(),
                ipAddress: req.ip || '0.0.0.0'
            });
        } catch (error) {
            console.error('Failed to create audit log in MediaPostController:', error);
        }
    }

    static async getAllPosts(req: Request, res: Response) {
        try {
            const posts = await MediaPostController.mediaRepo.find({
                order: { date: 'DESC' }
            });
            return res.json({
                success: true,
                data: posts
            });
        } catch (error) {
            console.error('Error fetching media posts:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async createPost(req: AuthenticatedRequest, res: Response) {
        try {
            const { title, description, category, videoUrl, videoDuration } = req.body;
            const files = req.files as Express.Multer.File[];

            const imageUrls: string[] = [];
            if (files && files.length > 0) {
                try {
                    for (const file of files) {
                        const localUrl = await saveToLocalStorage(
                            file.buffer,
                            file.originalname,
                            DocumentType.MEDIA,
                            UserType.STAFF
                        );
                        imageUrls.push(localUrl);
                    }
                } catch (uploadError) {
                    console.error('File upload error:', uploadError);
                    return res.status(400).json({
                        success: false,
                        message: uploadError instanceof Error ? uploadError.message : 'Failed to upload images'
                    });
                }
            }

            const post = MediaPostController.mediaRepo.create({
                title,
                description,
                category,
                images: imageUrls,
                videoUrl,
                videoDuration,
                date: new Date()
            });

            const savedPost = await MediaPostController.mediaRepo.save(post);

            await MediaPostController.logAction(req, 'Create', `Created media post: ${title}`, undefined, savedPost as unknown as Record<string, unknown>);

            return res.status(201).json({
                success: true,
                message: 'Post created successfully',
                data: savedPost
            });
        } catch (error) {
            console.error('Error creating media post:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async updatePost(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const { title, description, category, videoUrl, videoDuration, existingImages } = req.body;
            const files = req.files as Express.Multer.File[];

            const post = await MediaPostController.mediaRepo.findOne({ where: { id: parseInt(id) } });
            if (!post) {
                return res.status(404).json({ success: false, message: 'Post not found' });
            }

            const oldPost = { ...post };

            // Handle images
            let updatedImages: string[] = [];
            if (existingImages) {
                updatedImages = Array.isArray(existingImages) ? existingImages : [existingImages];
            }

            if (files && files.length > 0) {
                try {
                    for (const file of files) {
                        const localUrl = await saveToLocalStorage(
                            file.buffer,
                            file.originalname,
                            DocumentType.MEDIA,
                            UserType.STAFF
                        );
                        updatedImages.push(localUrl);
                    }
                } catch (uploadError) {
                    console.error('File upload error:', uploadError);
                    return res.status(400).json({
                        success: false,
                        message: uploadError instanceof Error ? uploadError.message : 'Failed to upload images'
                    });
                }
            }

            post.title = title || post.title;
            post.description = description || post.description;
            post.category = category || post.category;
            post.images = updatedImages;
            post.videoUrl = videoUrl || post.videoUrl;
            post.videoDuration = videoDuration || post.videoDuration;

            const savedPost = await MediaPostController.mediaRepo.save(post);

            await MediaPostController.logAction(req, 'Update', `Updated media post: ${title}`, oldPost as unknown as Record<string, unknown>, savedPost as unknown as Record<string, unknown>);

            return res.json({
                success: true,
                message: 'Post updated successfully',
                data: savedPost
            });
        } catch (error) {
            console.error('Error updating media post:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    static async deletePost(req: AuthenticatedRequest, res: Response) {
        try {
            const { id } = req.params;
            const post = await MediaPostController.mediaRepo.findOne({ where: { id: parseInt(id) } });

            if (!post) {
                return res.status(404).json({ success: false, message: 'Post not found' });
            }

            // Delete images from Cloudinary
            if (post.images && post.images.length > 0) {
                try {
                    for (const imgUrl of post.images) {
                        await deleteFromCloudinary(imgUrl);
                    }
                } catch (deleteError) {
                    console.error('Error deleting images from Cloudinary:', deleteError);
                    // Continue with post deletion even if image deletion fails
                }
            }

            await MediaPostController.mediaRepo.remove(post);

            await MediaPostController.logAction(req, 'Delete', `Deleted media post: ${post.title}`, post as unknown as Record<string, unknown>, null);

            return res.json({
                success: true,
                message: 'Post deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting media post:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}
