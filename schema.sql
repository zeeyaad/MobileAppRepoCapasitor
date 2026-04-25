-- ========================================
-- CLUB MANAGEMENT SYSTEM DATABASE
-- Clean, Simple, Bilingual (English/Arabic)
-- ========================================

CREATE DATABASE clubSystem;
USE clubSystem;

-- ========================================
-- 1. MEMBER TYPES (9 Types)
-- ========================================
CREATE TABLE member_types (
    id INT PRIMARY KEY IDENTITY(1,1),
    code VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_ar NVARCHAR(100) NOT NULL,
    description_en TEXT,
    description_ar NTEXT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- ========================================
-- 2. ACCOUNTS (Authentication)
-- ========================================
CREATE TABLE accounts (
    id INT PRIMARY KEY IDENTITY(1,1),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',  -- admin, staff, moderator, member
    status VARCHAR(50) DEFAULT 'pending',  -- active, suspended, banned
    last_login DATETIME,
    password_changed_at DATETIME,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- ========================================
-- 3. MEMBERS (Main Members Table)
-- ========================================
CREATE TABLE members (
    id INT PRIMARY KEY IDENTITY(1,1),
    account_id INT NOT NULL UNIQUE,
    first_name_en VARCHAR(50) NOT NULL,
    first_name_ar NVARCHAR(50) NOT NULL,
    last_name_en VARCHAR(50) NOT NULL,
    last_name_ar NVARCHAR(50) NOT NULL,
    gender VARCHAR(20),
    phone VARCHAR(20),
    nationality VARCHAR(50),
    birthdate DATE,
    national_id VARCHAR(50) UNIQUE NOT NULL,
    health_status VARCHAR(100),
    is_foreign BIT DEFAULT 0,
    photo VARCHAR(255),
    national_id_front text,
    national_id_back text,
    address text,
    medical_report VARCHAR(255),
    member_type_id INT NOT NULL,
    points_balance INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',  -- active, suspended, banned, expired, cancelled
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (member_type_id) REFERENCES member_types(id)
);

-- ========================================
-- 4. MEMBER RELATIONSHIPS (Family & Dependents)
-- ========================================
CREATE TABLE member_relationships (
    id INT PRIMARY KEY IDENTITY(1,1),
    member_id INT NOT NULL,  -- Main member
    related_member_id INT NOT NULL,  -- Related family member
    relationship_type VARCHAR(50) NOT NULL,  -- spouse, child, parent, orphan
    relationship_name_ar NVARCHAR(100),  -- الزوجة, الابن, الوالد, اليتيم
    is_dependent BIT DEFAULT 0,
    age_group VARCHAR(50),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (related_member_id) REFERENCES members(id)
);

-- ========================================
-- 5. UNIVERSITIES
-- ========================================
CREATE TABLE universities (
    id INT PRIMARY KEY IDENTITY(1,1),
    code VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    name_ar NVARCHAR(150) NOT NULL,
    location_en VARCHAR(100),
    location_ar NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- ========================================
-- 5.5 BRANCHES (Club Branches)
-- ========================================
CREATE TABLE branches (
    id INT PRIMARY KEY IDENTITY(1,1),
    code VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_ar NVARCHAR(100) NOT NULL,
    location_en VARCHAR(100),
    location_ar NVARCHAR(100),
    phone VARCHAR(20),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- ========================================
-- 6. FACULTIES
-- ========================================
CREATE TABLE faculties (
    id INT PRIMARY KEY IDENTITY(1,1),
    code VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_ar NVARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);


-- ========================================
-- 7. PROFESSIONS
-- ========================================
CREATE TABLE professions (
    id INT PRIMARY KEY IDENTITY(1,1),
    code VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_ar NVARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- ========================================
-- 8. EMPLOYEE DETAILS (Working Members)
-- ========================================
CREATE TABLE employee_details (
    id INT PRIMARY KEY IDENTITY(1,1),
    member_id INT UNIQUE NOT NULL,
    profession_id INT NOT NULL,
    department_en VARCHAR(100),
    department_ar NVARCHAR(100),
    salary DECIMAL(12,2),
    salary_slip VARCHAR(255),
    employment_start_date DATE,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (profession_id) REFERENCES professions(id)
);

-- ========================================
-- 9. RETIRED EMPLOYEE DETAILS
-- ========================================
CREATE TABLE retired_employee_details (
    id INT PRIMARY KEY IDENTITY(1,1),
    member_id INT UNIQUE NOT NULL,
    former_department_en VARCHAR(100),
    former_department_ar NVARCHAR(100),
    retirement_date DATE NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
);

-- ========================================
-- 10. UNIVERSITY STUDENT DETAILS
-- ========================================
CREATE TABLE university_student_details (
    id INT PRIMARY KEY IDENTITY(1,1),
    member_id INT UNIQUE NOT NULL,
    university_id INT,
    faculty_id INT,
    graduation_year INT,
    enrollment_date DATE,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (university_id) REFERENCES universities(id),
    FOREIGN KEY (faculty_id) REFERENCES faculties(id)
);

-- ========================================
-- 12. OUTSIDER DETAILS (Non-University / Visitor Members)
-- ========================================
CREATE TABLE outsider_details (
    id INT PRIMARY KEY IDENTITY(1,1),
    member_id INT UNIQUE NOT NULL,
    job_title_en VARCHAR(100),
    job_title_ar NVARCHAR(100),
    employment_status VARCHAR(50) DEFAULT 'employed',
    branch_id INT,  -- For visitor-branch members
    visitor_type VARCHAR(50),  -- visitor, visitor-honorary, visitor-athletic, visitor-branch, seasonal-egy, seasonal-foreigner
    passport_number VARCHAR(50),  -- For foreigner members
    passport_photo VARCHAR(255),  -- For foreigner members
    country VARCHAR(100),  -- For foreigner members
    visa_status VARCHAR(50),  -- For foreigner members (valid, expired, pending)
    duration_months INT,  -- For seasonal members (1, 6, 12)
    is_installable BIT DEFAULT 0,  -- For seasonal members
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- ========================================
-- 13. MEMBERSHIP PLANS (Pricing Models)
-- ========================================
CREATE TABLE membership_plans (
    id INT PRIMARY KEY IDENTITY(1,1),
    member_type_id INT NOT NULL,
    plan_code VARCHAR(50) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_ar NVARCHAR(100) NOT NULL,
    description_en TEXT,
    description_ar NVARCHAR(MAX),
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EGP',
    duration_months INT NOT NULL,
    renewal_price DECIMAL(12,2),
    is_installable BIT DEFAULT 0,
    max_installments INT,
    is_active BIT DEFAULT 1,
    is_for_foreigner BIT DEFAULT 0,
    min_age INT,
    max_age INT,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (member_type_id) REFERENCES member_types(id)
);

-- ========================================
-- 14. MEMBER MEMBERSHIPS (Subscriptions)
-- ========================================
CREATE TABLE member_memberships (
    id INT PRIMARY KEY IDENTITY(1,1),
    member_id INT NOT NULL,
    membership_plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',  -- active, expired, suspended, cancelled
    payment_status VARCHAR(50) DEFAULT 'pending',  -- pending, paid
    custom_price DECIMAL(12, 2) NULL,  -- For custom-calculated prices (e.g., dependent discounts)
    is_auto_renew BIT DEFAULT 1,  -- For annual auto-renewal tracking
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (membership_plan_id) REFERENCES membership_plans(id)
);


-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Authentication & Member Lookups
CREATE INDEX idx_account_email ON accounts(email);
CREATE INDEX idx_member_national_id ON members(national_id);
CREATE INDEX idx_member_type ON members(member_type_id);
CREATE INDEX idx_member_status ON members(status);

-- Relationships
CREATE INDEX idx_relationship_member ON member_relationships(member_id);
CREATE INDEX idx_relationship_related ON member_relationships(related_member_id);

-- Employee Details
CREATE INDEX idx_employee_member ON employee_details(member_id);
CREATE INDEX idx_employee_profession ON employee_details(profession_id);
CREATE INDEX idx_employee_university ON employee_details(university_id);

-- Student Details
CREATE INDEX idx_uni_student_member ON university_student_details(member_id);

-- Memberships
CREATE INDEX idx_membership_member ON member_memberships(member_id);
CREATE INDEX idx_membership_status ON member_memberships(status);
CREATE INDEX idx_membership_end_date ON member_memberships(end_date);


-- ========================================
-- INSERT THE 9 MEMBERSHIP TYPES
-- ========================================

INSERT INTO member_types (code, name_en, name_ar, description_en, description_ar) VALUES
('FOUNDER', 'Founder Member', N'العضو المؤسس', 'Founder member of the club', N'عضو مؤسس في النادي'),
('WORKING', 'Working Member', N'العضو العامل', 'Employee of the university', N'موظف بالجامعة'),
('DEPENDENT', 'Dependent Member', N'العضو التابع', 'Spouse, children, or dependents of working members', N'زوجة أو أطفال أو تابعون للعضو العامل'),
('VISITOR', 'Visitor Member', N'العضو الزائر', 'Non-university member for annual visit', N'عضو زائر خارج الجامعة لزيارة سنوية'),
('VISITOR_HONORARY', 'Visitor - Honorary', N'الزائر - فخري', 'Honorary visitor member', N'عضو زائر فخري'),
('VISITOR_ATHLETIC', 'Visitor - Athletic', N'الزائر - رياضي', 'Athletic visitor member', N'عضو زائر رياضي'),
('VISITOR_BRANCH', 'Visitor - Branch', N'الزائر - فرع', 'Visitor member from branch', N'عضو زائر من فرع'),
('BRANCH', 'Branch Member', N'عضو الفرع', 'Member of club branch', N'عضو في فرع النادي'),
('SEASONAL', 'Seasonal Member', N'العضو الموسمى', 'Temporary member up to 6 months', N'عضو موقتي لمدة 6 أشهر'),
('ATHLETE', 'Athlete Member', N'العضو الرياضى', 'Distinguished athlete approved by board', N'رياضي متميز معتمد من المجلس'),
('HONORARY', 'Honorary Member', N'العضو الفخرى', 'Honorary member approved by board for 1 year', N'عضو فخري معتمد من المجلس لمدة سنة'),
('FOREIGNER', 'Foreigner Member', N'الأجنبي', 'Non-Egyptian member with flexible terms', N'عضو أجنبي غير مصري بشروط مرنة'),
('STUDENT', 'Student Member', N'عضو الطالب', 'University student member', N'عضو طالب جامعي'),
('GRADUATE', 'Graduate Member', N'عضو الخريج', 'University graduate member', N'عضو خريج جامعي');

-- ========================================
-- INSERT MEMBERSHIP PLANS (Pricing Models)
-- ========================================

-- Working Members - 4 Salary Tiers
INSERT INTO membership_plans (code, member_type_id, name_en, name_ar, price, currency, duration_months, renewal_price, is_active)
SELECT id, 'WORK_PROFESSOR', N'أستاذ / أساتذة قارة', 20000, 'EGP', 12, 300, 1 FROM member_types WHERE code = 'WORKING';

INSERT INTO membership_plans (code, member_type_id, name_en, name_ar, price, currency, duration_months, renewal_price, is_active)
SELECT id, 'WORK_10K', N'10,000-8000 EGP', 10000, 'EGP', 12, 300, 1 FROM member_types WHERE code = 'WORKING';

INSERT INTO membership_plans (code, member_type_id, name_en, name_ar, price, currency, duration_months, renewal_price, is_active)
SELECT id, 'WORK_8K', N'8000-5000 EGP', 8000, 'EGP', 12, 300, 1 FROM member_types WHERE code = 'WORKING';

INSERT INTO membership_plans (code, member_type_id, name_en, name_ar, price, currency, duration_months, renewal_price, is_active)
SELECT id, 'WORK_LOW', N'Below 5000 EGP', 2000, 'EGP', 12, 300, 1 FROM member_types WHERE code = 'WORKING';

-- Dependent Members - 3 Tiers
INSERT INTO membership_plans (code, member_type_id, name_en, name_ar, price, currency, duration_months, renewal_price, is_active)
SELECT id, 'DEP_FIRST', N'First Dependent', N'التابع الأول', 2000, 'EGP', 12, 1000, 1 FROM member_types WHERE code = 'DEPENDENT';

INSERT INTO membership_plans (code, member_type_id, name_en, name_ar, price, currency, duration_months, renewal_price, is_active)
SELECT id, 'DEP_SECOND', N'Second Dependent', N'التابع الثاني', 1500, 'EGP', 12, 1000, 1 FROM member_types WHERE code = 'DEPENDENT';

INSERT INTO membership_plans (code, member_type_id, name_en, name_ar, price, currency, duration_months, renewal_price, is_active)
SELECT id, 'DEP_THIRD', N'Third+ Dependent', N'التابع الثالث وما بعده', 1000, 'EGP', 12, 1000, 1 FROM member_types WHERE code = 'DEPENDENT';

-- Visitor Members - Declining Prices
INSERT INTO membership_plans (code, member_type_id, name_en, name_ar, price, currency, duration_months, renewal_price, is_active)
SELECT id, 'VISITOR', N'Visitor Member', N'العضو الزائر', 5000, 'EGP', 12, NULL, 1 FROM member_types WHERE code = 'VISITOR';

-- Seasonal Members
INSERT INTO membership_plans (code, member_type_id, name_en, name_ar, price, currency, duration_months, renewal_price, is_active)
SELECT id, 'SEASONAL_3M', N'Seasonal 3 Months', N'موسمي 3 أشهر', 3000, 'EGP', 3, 3000, 1 FROM member_types WHERE code = 'SEASONAL';

INSERT INTO membership_plans (code, member_type_id, name_en, name_ar, price, currency, duration_months, renewal_price, is_active)
SELECT id, 'SEASONAL_6M', N'Seasonal 6 Months', N'موسمي 6 أشهر', 5000, 'EGP', 6, 2000, 1 FROM member_types WHERE code = 'SEASONAL';

-- Athlete & Honorary - 1 Year
INSERT INTO membership_plans (code, member_type_id, name_en, name_ar, price, currency, duration_months, renewal_price, is_active)
SELECT id, 'ATHLETE', N'Athlete Member', N'الرياضي', 0, 'EGP', 12, 0, 1 FROM member_types WHERE code = 'ATHLETE';

INSERT INTO membership_plans (code, member_type_id, name_en, name_ar, price, currency, duration_months, renewal_price, is_active)
SELECT id, 'HONORARY', N'Honorary Member', N'الفخري', 0, 'EGP', 12, 0, 1 FROM member_types WHERE code = 'HONORARY';

-- Foreigner Members - USD Pricing
INSERT INTO membership_plans (code, member_type_id, name_en, name_ar, price, currency, duration_months, renewal_price, is_active)
SELECT id, 'FOREIGNER_YEAR', N'Foreigner 1 Year', N'أجنبي سنة واحدة', 1000, 'USD', 12, 1000, 1 FROM member_types WHERE code = 'FOREIGNER';

INSERT INTO membership_plans (code, member_type_id, name_en, name_ar, price, currency, duration_months, renewal_price, is_active)
SELECT id, 'FOREIGNER_6M', N'Foreigner 6 Months', N'أجنبي 6 أشهر', 500, 'USD', 6, 0, 1 FROM member_types WHERE code = 'FOREIGNER';

INSERT INTO membership_plans (code, member_type_id, name_en, name_ar, price, currency, duration_months, renewal_price, is_active)
SELECT id, 'FOREIGNER_MONTH', N'Foreigner 1 Month', N'أجنبي شهر واحد', 100, 'USD', 1, 0, 1 FROM member_types WHERE code = 'FOREIGNER';

-- Student & Graduate Members - Fixed 3000 EGP
INSERT INTO membership_plans (code, member_type_id, name_en, name_ar, price, currency, duration_months, renewal_price, is_active)
SELECT id, 'STUDENT_PLAN', N'Student/Graduate Member', N'عضو الطالب/الخريج', 3000, 'EGP', 12, 3000, 1 FROM member_types WHERE code = 'STUDENT';

INSERT INTO membership_plans (code, member_type_id, name_en, name_ar, price, currency, duration_months, renewal_price, is_active)
SELECT id, 'GRADUATE_PLAN', N'Student/Graduate Member', N'عضو الطالب/الخريج', 3000, 'EGP', 12, 3000, 1 FROM member_types WHERE code = 'GRADUATE';

-- ========================================
-- SAMPLE SETUP DATA
-- ========================================

-- Insert sample universities
INSERT INTO universities (code, name_en, name_ar, location_en, location_ar) VALUES
('HU', 'Helwan University', N'جامعة حلوان', 'Helwan', N'حلوان'),
('CU', 'Cairo University', N'جامعة القاهرة', 'Giza', N'الجيزة'),
('AUC', 'American University in Cairo', N'الجامعة الأمريكية بالقاهرة', 'Cairo', N'القاهرة');

-- Insert sample professions
INSERT INTO professions (code, name_en, name_ar, description_en, description_ar) VALUES
('PROF', 'Professor', N'أستاذ', 'Academic professor', N'أستاذ أكاديمي'),
('ASSOC', 'Associate Professor', N'أستاذ مساعد', 'Associate academic professor', N'أستاذ مساعد'),
('LECT', 'Lecturer', N'محاضر', 'University lecturer', N'محاضر جامعي'),
('ASST', 'Assistant Lecturer', N'معيد', 'Assistant lecturer', N'معيد');

-- Insert sample branches
INSERT INTO branches (code, name_en, name_ar, location_en, location_ar, phone) VALUES
('HQ', 'Main Branch - Helwan', N'الفرع الرئيسي - حلوان', 'Helwan', N'حلوان', '01001234567'),
('DW', 'Downtown Branch - Cairo', N'فرع وسط البلد - القاهرة', 'Cairo Downtown', N'وسط القاهرة', '01012345678'),
('GZ', 'Giza Branch', N'فرع الجيزة', 'Giza', N'الجيزة', '01023456789'),
('NS', 'Nasr City Branch', N'فرع مدينة نصر', 'Nasr City', N'مدينة نصر', '01034567890'),
('SH', 'Shubra Branch', N'فرع الشبرا', 'Shubra', N'الشبرا', '01045678901'),
('ZM', 'Zamalek Branch', N'فرع الزمالك', 'Zamalek', N'الزمالك', '01056789012'),
('HE', 'Heliopolis Branch', N'فرع هليوبوليس', 'Heliopolis', N'هليوبوليس', '01067890123'),
('MK', 'Maadi Branch', N'فرع المعادي', 'Maadi', N'المعادي', '01078901234');

-- ========================================
-- END OF SCHEMA
-- ========================================
