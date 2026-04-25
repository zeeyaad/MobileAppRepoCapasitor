-- Media Center Management System - Database Schema
-- PostgreSQL Migration Script
-- Date: February 13, 2026

-- ================================================================
-- PHASE 1: Create Advertisement Categories Table
-- ================================================================

CREATE TABLE advertisement_categories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name_en VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    description_en TEXT,
    description_ar TEXT,
    color_code VARCHAR(7),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for quick lookups
CREATE INDEX idx_advertisement_categories_code ON advertisement_categories(code);
CREATE INDEX idx_advertisement_categories_is_active ON advertisement_categories(is_active);

-- ================================================================
-- PHASE 2: Create Advertisements Table
-- ================================================================

CREATE TABLE advertisements (
    id SERIAL PRIMARY KEY,
    
    -- Bilingual Content
    title_en VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    
    -- Relationships
    category_id INTEGER NOT NULL REFERENCES advertisement_categories(id),
    created_by INTEGER NOT NULL REFERENCES staff(id),
    approved_by INTEGER REFERENCES staff(id),
    
    -- Status Management
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- Enum: 'pending' | 'approved' | 'rejected' | 'published' | 'archived'
    
    approval_status VARCHAR(20) DEFAULT 'pending',
    -- Enum: 'pending' | 'approved' | 'rejected'
    
    approval_notes TEXT,
    approved_at TIMESTAMP,
    
    -- Features
    is_featured BOOLEAN DEFAULT false,
    
    -- Scheduling
    start_date DATE,
    end_date DATE,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX idx_advertisements_status ON advertisements(status);
CREATE INDEX idx_advertisements_approval_status ON advertisements(approval_status);
CREATE INDEX idx_advertisements_category_id ON advertisements(category_id);
CREATE INDEX idx_advertisements_created_by ON advertisements(created_by);
CREATE INDEX idx_advertisements_approved_by ON advertisements(approved_by);
CREATE INDEX idx_advertisements_is_featured ON advertisements(is_featured);
CREATE INDEX idx_advertisements_created_at ON advertisements(created_at DESC);

-- ================================================================
-- PHASE 3: Create Advertisement Photos Table
-- ================================================================

CREATE TABLE advertisement_photos (
    id SERIAL PRIMARY KEY,
    
    -- Relationship
    advertisement_id INTEGER NOT NULL REFERENCES advertisements(id) ON DELETE CASCADE,
    
    -- Photo Information
    photo_url VARCHAR(500) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    
    -- Bilingual Alt Text
    alt_text_en VARCHAR(255),
    alt_text_ar VARCHAR(255),
    
    -- Display Order
    display_order INTEGER NOT NULL DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for quick lookups
CREATE INDEX idx_advertisement_photos_advertisement_id ON advertisement_photos(advertisement_id);
CREATE INDEX idx_advertisement_photos_display_order ON advertisement_photos(display_order);

-- ================================================================
-- PHASE 4: Create Privileges (if not already exist)
-- ================================================================

-- Check if privileges table exists, then add media center privileges
INSERT INTO privileges (code, name, description, created_at, updated_at)
VALUES 
    ('MEDIA_CENTER_CREATE', 'Create Media Center Ads', 'Create new media center advertisements', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('MEDIA_CENTER_PUBLISH', 'Publish Media Center Ads', 'Publish approved advertisements directly', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('MEDIA_CENTER_APPROVE', 'Approve Media Center Ads', 'Approve and reject pending advertisements', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('MEDIA_CENTER_EDIT', 'Edit Media Center Ads', 'Edit pending advertisements', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('MEDIA_CENTER_DELETE', 'Delete Media Center Ads', 'Delete advertisements', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('MEDIA_CENTER_MANAGE_CATEGORIES', 'Manage Categories', 'Manage advertisement categories', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- PHASE 5: Seed Predefined Categories
-- ================================================================

INSERT INTO advertisement_categories (code, name_en, name_ar, description_en, description_ar, color_code, is_active)
VALUES 
    ('PROMOTION', 'Promotion', 'عرض ترويجي', 'Promotional offers and deals', 'العروض والصفقات الترويجية', '#FF6B6B', true),
    ('EVENT', 'Event', 'حدث', 'Club events and gatherings', 'أحداث ومجمعات النادي', '#4ECDC4', true),
    ('ANNOUNCEMENT', 'Announcement', 'إعلان', 'Important club announcements', 'إعلانات النادي المهمة', '#FFE66D', true),
    ('NEWS', 'News', 'أخبار', 'Club news and updates', 'أخبار النادي والتحديثات', '#95E1D3', true),
    ('MAINTENANCE', 'Maintenance', 'الصيانة', 'Maintenance notices and updates', 'إشعارات الصيانة والتحديثات', '#A8DADC', true)
ON CONFLICT (code) DO NOTHING;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Verify tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('advertisement_categories', 'advertisements', 'advertisement_photos')
ORDER BY table_name;

-- Verify privileges created
SELECT code, name FROM privileges 
WHERE code LIKE 'MEDIA_CENTER%'
ORDER BY code;

-- Verify categories seeded
SELECT id, code, name_en, name_ar, is_active FROM advertisement_categories
ORDER BY id;

-- ================================================================
-- ROLLBACK SCRIPT (if needed)
-- ================================================================
/*
DROP TABLE IF EXISTS advertisement_photos CASCADE;
DROP TABLE IF EXISTS advertisements CASCADE;
DROP TABLE IF EXISTS advertisement_categories CASCADE;

DELETE FROM privileges WHERE code LIKE 'MEDIA_CENTER%';
*/
