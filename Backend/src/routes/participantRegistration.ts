import express from "express";
import multer from "multer";
import path from "path";
import { ParticipantRegistrationController } from "../controllers/ParticipantRegistrationController";

const router = express.Router();
const controller = new ParticipantRegistrationController();

// ============================================================================
// Multer Configuration for Participant ID Upload (Memory Storage for Cloudinary)
// ============================================================================
const storage = multer.memoryStorage(); // Store files in memory buffer for Cloudinary upload

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max per file
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and PDF files are allowed for national ID photos"));
    }
  }
});

// ============================================================================
// Public Routes (No Authentication Required)
// ============================================================================

/**
 * GET /api/bookings/join/:shareToken
 * Get booking details by share token
 * Public endpoint - anyone with the link can view
 */
router.get(
  "/join/:shareToken",
  controller.getBookingByShareToken.bind(controller)
);

/**
 * POST /api/bookings/join/:shareToken
 * Register participant via share token
 * Public endpoint - anyone with the link can register
 * Accepts multipart/form-data with optional file uploads
 */
router.post(
  "/join/:shareToken",
  upload.fields([
    { name: "national_id_front", maxCount: 1 },
    { name: "national_id_back", maxCount: 1 }
  ]),
  controller.registerParticipant.bind(controller)
);

export default router;
