import 'reflect-metadata';
// Backend Server 
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { AppDataSource } from './database/data-source';
import registrationRoutes from './routes/RegistrationRoutes';
import membershipRoutes from './routes/MembershipRoutes';
import StaffRoutes from './routes/StaffRoutes';
import AuthRoutes from './routes/AuthRoutes';
import SportRoutes from './routes/SportRoutes';
import SportSubscriptionRoutes from './routes/SportSubscriptionRoutes';
import MemberSubscriptionRoutes from './routes/MemberSubscriptionRoutes';
import TeamMemberRoutes from './routes/TeamMemberRoutes';
import TeamMemberCRUDRoutes from './routes/TeamMemberCRUDRoutes';
import TeamMemberSubscriptionRoutes from './routes/TeamMemberSubscriptionRoutes';
import TeamRoutes from './routes/TeamRoutes';
import FieldRoutes from './routes/FieldRoutes';
import BookingRoutes from './routes/BookingRoutes';
import MemberBookingRoutes from './routes/MemberBookingRoutes';
import TeamMemberBookingRoutes from './routes/TeamMemberBookingRoutes';
import MemberAdminRoutes from './routes/MemberAdminRoutes';
import TeamSubscriptionRoutes from './routes/TeamSubscriptionRoutes';
import TaskRoutes from './routes/TaskRoutes';
import SeedRoutes from './routes/SeedRoutes';
import AuditLogRoutes from './routes/AuditLogRoutes';
import MediaPostRoutes from './routes/MediaPostRoutes';
import FacultyRoutes from './routes/FacultyRoutes';
import BranchRoutes from './routes/BranchRoutes';
import BranchSportRoutes from './routes/BranchSportRoutes';
import ProfessionRoutes from './routes/ProfessionRoutes';
import publicRoutes from './routes/publicRoutes';
import { memberTeamRouter } from './routes/MemberTeamRoutes';
import participantRegistrationRoutes from './routes/participantRegistration';
import AttendanceRoutes from './routes/AttendanceRoutes';
import PaymobRoutes from './routes/PaymobRoutes';
import { initializeFolderStructure } from './utils/localFileStorage';

// Load environment variables
dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

const ensureMediaPostsTable = async () => {
  await AppDataSource.query(`
    CREATE TABLE IF NOT EXISTS media_posts (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      category VARCHAR(50) NOT NULL,
      images TEXT NULL,
      "videoUrl" VARCHAR(500) NULL,
      "videoDuration" VARCHAR(20) NULL,
      "date" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const ensureAuditLogsTable = async () => {
  await AppDataSource.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  await AppDataSource.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      "userName" VARCHAR(100) NOT NULL,
      role VARCHAR(50) NOT NULL,
      action VARCHAR(50) NOT NULL,
      module VARCHAR(50) NOT NULL,
      description TEXT NULL,
      status VARCHAR(20) NOT NULL,
      "ipAddress" VARCHAR(45) NULL,
      "oldValue" JSONB NULL,
      "newValue" JSONB NULL,
      "dateTime" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// ==================== CORS CONFIGURATION ====================
/**
 * Configure allowed origins based on environment:
 * - Environment variable: ALLOWED_ORIGINS (comma-separated)
 * - Default (development): localhost and LAN IP
 * - Production: should be explicitly set via environment
 */
const getDefaultOrigins = (): string[] => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    // Production: only allow explicitly configured origins
    return [];
  }
  
  // Development: allow localhost and LAN access
  return [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost',
    'http://10.100.104.157:8080',
    'http://10.100.104.157',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ];
};

const allowedOrigins: string[] = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : getDefaultOrigins();

console.log('✅ CORS Allowed Origins:', allowedOrigins);

// CORS middleware configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman Desktop, curl, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked request from: ${origin}`);
      callback(new Error(`CORS Error: Origin ${origin} not allowed`));
    }
  },
  credentials: true, // Allow cookies and Authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // Cache preflight for 24 hours
};

app.use(cors(corsOptions));
// ==================== END CORS CONFIGURATION ====================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Avoid noisy favicon 404s from browsers hitting the backend directly
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});


// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
console.log('📁 Static files served from: /uploads');

// Logging middleware to debug 404s
app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/public', publicRoutes);
app.use('/api/member-subscriptions', MemberSubscriptionRoutes);
app.use('/api/bookings', BookingRoutes); // NEW: Unified booking system (must be before participantRegistrationRoutes)
app.use('/api/bookings', participantRegistrationRoutes); // Participant registration via invitation links
app.use('/api/register', TeamMemberRoutes);
app.use('/api/register', registrationRoutes);
app.use('/api/teams', TeamRoutes);
app.use('/api/fields', FieldRoutes);
app.use('/api/members', MemberBookingRoutes);
app.use('/api/team-members-booking', TeamMemberBookingRoutes);
app.use('/api/team-members', TeamMemberCRUDRoutes);
app.use('/api/team-members', TeamMemberSubscriptionRoutes);
app.use('/api/team-member-subscriptions', TeamMemberSubscriptionRoutes);
app.use('/api/team-subscriptions', TeamSubscriptionRoutes);
app.use('/api/member-teams', memberTeamRouter);
app.use('/api/memberships', membershipRoutes);
app.use('/api/attendance', AttendanceRoutes);
app.use('/api', MemberAdminRoutes);
app.use('/api/auth', AuthRoutes);
app.use('/api/staff', StaffRoutes);
app.use('/api/sports', SportRoutes);
app.use('/api/sports', SportSubscriptionRoutes);

// Test route
app.get('/api/test-route', (req, res) => {
  res.json({ message: 'Backend is reachable and updating' });
});
app.use('/api/tasks', TaskRoutes);
app.use('/api/audit-logs', AuditLogRoutes);
app.use('/api/media-posts', MediaPostRoutes);
app.use('/api/faculties', FacultyRoutes);
app.use('/api/branches', BranchRoutes);
app.use('/api', BranchSportRoutes);
app.use('/api/professions', ProfessionRoutes);
app.use('/api/seed', SeedRoutes);
app.use('/api/paymob', PaymobRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Club System Backend is running' });
});

// Initialize database and start server
AppDataSource.initialize()
  .then(async () => {
    console.log('✅ Database connected successfully');
    await ensureMediaPostsTable();
    await ensureAuditLogsTable();
    console.log('✅ media_posts table is ready');

    // Initialize upload folder structure
    await initializeFolderStructure();
    console.log('✅ Upload folder structure initialized');

    // Initialize default membership plans
    const { initializeDefaultPlans } = await import('./utils/initializePlans');
    await initializeDefaultPlans();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error during Data Source initialization:', error);
    process.exit(1);
  });

export default app;
