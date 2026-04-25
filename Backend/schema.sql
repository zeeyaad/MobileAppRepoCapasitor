-- Database Schema for Helwan Club System (MSSQL)

-- 1. Lookups & Configuration Tables

CREATE TABLE member_types (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name_en VARCHAR(100) NOT NULL,
    name_ar NVARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE membership_plans (
    id INT IDENTITY(1,1) PRIMARY KEY,
    plan_code VARCHAR(50) NOT NULL UNIQUE,
    name_en VARCHAR(100) NOT NULL,
    name_ar NVARCHAR(100) NOT NULL,
    description_en VARCHAR(255),
    description_ar NVARCHAR(255),
    price DECIMAL(18, 2) NOT NULL DEFAULT 0,
    duration_months INT NOT NULL DEFAULT 12,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE professions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name_en VARCHAR(100) NOT NULL,
    name_ar NVARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE universities (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name_en VARCHAR(150) NOT NULL,
    name_ar NVARCHAR(150) NOT NULL,
    location_en VARCHAR(100),
    location_ar NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE faculties (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name_en VARCHAR(100) NOT NULL,
    name_ar NVARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

INSERT INTO faculties (code, name_en, name_ar, created_at, updated_at) VALUES 
('ARTS', 'Faculty of Arts', 'كلية الآداب', NOW(), NOW()),
('LAW', 'Faculty of Law', 'كلية الحقوق', NOW(), NOW()),
('COM', 'Faculty of Commerce and Business Administration', 'كلية التجارة وإدارة الأعمال', NOW(), NOW()),
('EDU', 'Faculty of Education', 'كلية التربية', NOW(), NOW()),
('SCI', 'Faculty of Science', 'كلية العلوم', NOW(), NOW()),
('PHARM', 'Faculty of Pharmacy', 'كلية الصيدلة', NOW(), NOW()),
('MED', 'Faculty of Medicine', 'كلية الطب', NOW(), NOW()),
('NURS', 'Faculty of Nursing', 'كلية التمريض', NOW(), NOW()),
('ENG_HEL', 'Faculty of Engineering (Helwan)', 'كلية الهندسة بحلوان', NOW(), NOW()),
('ENG_MAT', 'Faculty of Engineering (Mataria)', 'كلية الهندسة بالمطرية', NOW(), NOW()),
('FCAI', 'Faculty of Computers and Artificial Intelligence', 'كلية الحاسبات والذكاء الاصطناعي', NOW(), NOW()),
('APP_ARTS', 'Faculty of Applied Arts', 'كلية الفنون التطبيقية', NOW(), NOW()),
('FINE_ARTS', 'Faculty of Fine Arts', 'كلية الفنون الجميلة', NOW(), NOW()),
('ART_EDU', 'Faculty of Art Education', 'كلية التربية الفنية', NOW(), NOW()),
('MUS_EDU', 'Faculty of Music Education', 'كلية التربية الموسيقية', NOW(), NOW()),
('SOC_WORK', 'Faculty of Social Work', 'كلية الخدمة الاجتماعية', NOW(), NOW()),
('TOUR_HOTEL', 'Faculty of Tourism and Hotels', 'كلية السياحة والفنادق', NOW(), NOW()),
('PE_BOYS', 'Faculty of Physical Education (Boys)', 'كلية التربية الرياضية للبنين', NOW(), NOW()),
('PE_GIRLS', 'Faculty of Physical Education (Girls)', 'كلية التربية الرياضية للبنات', NOW(), NOW()),
('HOME_ECON', 'Faculty of Home Economics', 'كلية الاقتصاد المنزلي', NOW(), NOW()),
('TECH_EDU', 'Faculty of Technology and Education', 'كلية التكنولوجيا والتعليم', NOW(), NOW());

CREATE TABLE branches (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name_en VARCHAR(100) NOT NULL,
    name_ar NVARCHAR(100) NOT NULL,
    location_en VARCHAR(255),
    location_ar NVARCHAR(255),
    phone VARCHAR(20),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- 2. Core Account & Member Tables

CREATE TABLE accounts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member', -- admin, member, employee
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- active, pending, suspended
    is_active BIT DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE members (
    id INT IDENTITY(1,1) PRIMARY KEY,
    account_id INT NOT NULL UNIQUE,
    member_type_id INT, -- Can be null initially until determined
    
    first_name_en VARCHAR(100) NOT NULL,
    first_name_ar NVARCHAR(100) NOT NULL,
    last_name_en VARCHAR(100) NOT NULL,
    last_name_ar NVARCHAR(100) NOT NULL,
    
    phone VARCHAR(20),
    gender VARCHAR(10),
    nationality VARCHAR(50),
    birthdate DATE,
    national_id VARCHAR(20) UNIQUE, -- For Egyptians
    
    is_foreign BIT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending', -- pending, active, rejected
    
    -- Document Paths
    photo NVARCHAR(255),
    national_id_front NVARCHAR(255),
    national_id_back NVARCHAR(255),
    medical_report NVARCHAR(255),
    address NVARCHAR(255),
    
    health_status NVARCHAR(MAX),
    
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_Members_Accounts FOREIGN KEY (account_id) REFERENCES accounts(id),
    CONSTRAINT FK_Members_MemberTypes FOREIGN KEY (member_type_id) REFERENCES member_types(id)
);

-- 3. Detailed Info Tables (One-to-One with Members)

CREATE TABLE employee_details (
    id INT IDENTITY(1,1) PRIMARY KEY,
    member_id INT NOT NULL UNIQUE,
    profession_id INT NOT NULL,
    department_en VARCHAR(100),
    department_ar NVARCHAR(100),
    salary DECIMAL(18, 2),
    salary_slip NVARCHAR(255), -- File path
    employment_start_date DATE,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_EmployeeDetails_Members FOREIGN KEY (member_id) REFERENCES members(id),
    CONSTRAINT FK_EmployeeDetails_Professions FOREIGN KEY (profession_id) REFERENCES professions(id)
);

CREATE TABLE retired_employee_details (
    id INT IDENTITY(1,1) PRIMARY KEY,
    member_id INT NOT NULL UNIQUE,
    profession_code VARCHAR(50), -- Defines if they were Prof, TA, Staff etc.
    former_department_en VARCHAR(100),
    former_department_ar NVARCHAR(100),
    university_id INT, -- Optional link to university
    retirement_date DATE,
    last_salary DECIMAL(18, 2),
    salary_slip NVARCHAR(255),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_RetiredDetails_Members FOREIGN KEY (member_id) REFERENCES members(id),
    CONSTRAINT FK_RetiredDetails_Universities FOREIGN KEY (university_id) REFERENCES universities(id)
);

CREATE TABLE university_student_details (
    id INT IDENTITY(1,1) PRIMARY KEY,
    member_id INT NOT NULL UNIQUE,
    faculty_id INT NOT NULL,
    graduation_year INT,
    enrollment_date DATE,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    student_proof NVARCHAR(255), -- File path
    
    CONSTRAINT FK_StudentDetails_Members FOREIGN KEY (member_id) REFERENCES members(id),
    CONSTRAINT FK_StudentDetails_Faculties FOREIGN KEY (faculty_id) REFERENCES faculties(id)
);

CREATE TABLE outsider_details (
    id INT IDENTITY(1,1) PRIMARY KEY,
    member_id INT NOT NULL UNIQUE,
    visitor_type VARCHAR(50) NOT NULL, -- visitor, visitor-honorary, visitor-athletic, visitor-branch, seasonal-egy, seasonal-foreigner
    
    -- Employment info for regular visitors
    job_title_en VARCHAR(100),
    job_title_ar NVARCHAR(100),
    employment_status VARCHAR(50),
    
    -- Branch info for branch visitors
    branch_id INT,
    
    -- Foreigner/Seasonal info
    passport_number VARCHAR(50),
    passport_photo NVARCHAR(255),
    country VARCHAR(100),
    visa_status VARCHAR(50),
    duration_months INT,
    is_installable BIT DEFAULT 0,
    
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_OutsiderDetails_Members FOREIGN KEY (member_id) REFERENCES members(id),
    CONSTRAINT FK_OutsiderDetails_Branches FOREIGN KEY (branch_id) REFERENCES branches(id)
);

-- 4. Membership & Relationships

CREATE TABLE member_memberships (
    id INT IDENTITY(1,1) PRIMARY KEY,
    member_id INT NOT NULL,
    membership_plan_id INT NOT NULL,
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    status VARCHAR(20) DEFAULT 'active', -- active, expired, cancelled
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, partial, overdue
    
    custom_price DECIMAL(18, 2), -- Overrides plan price (e.g. for discounts)
    is_auto_renew BIT DEFAULT 1,
    
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_Memberships_Members FOREIGN KEY (member_id) REFERENCES members(id),
    CONSTRAINT FK_Memberships_Plans FOREIGN KEY (membership_plan_id) REFERENCES membership_plans(id)
);

CREATE TABLE member_relationships (
    id INT IDENTITY(1,1) PRIMARY KEY,
    member_id INT NOT NULL, -- The main member (Working, Retired, etc.)
    related_member_id INT NOT NULL, -- The dependent member
    
    relationship_type VARCHAR(50) NOT NULL, -- spouse, child, parent, orphan
    relationship_name_ar NVARCHAR(50),
    
    is_dependent BIT DEFAULT 1,
    
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_Relationships_MainMember FOREIGN KEY (member_id) REFERENCES members(id), -- NO ACTION or CASCADE based on requirement
    CONSTRAINT FK_Relationships_RelatedMember FOREIGN KEY (related_member_id) REFERENCES members(id)
);

-- 5. Logs

CREATE TABLE activity_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    member_id INT,
    action VARCHAR(100) NOT NULL,
    description NVARCHAR(MAX),
    ip_address VARCHAR(50),
    user_agent VARCHAR(MAX),
    action_date DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_Logs_Members FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IDX_Members_NationalID ON members(national_id);
CREATE INDEX IDX_Members_Email ON accounts(email);
CREATE INDEX IDX_Memberships_Status ON member_memberships(status);
CREATE INDEX IDX_Memberships_EndDate ON member_memberships(end_date);
