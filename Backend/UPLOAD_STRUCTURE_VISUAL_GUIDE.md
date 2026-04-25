# Upload Folder Structure - Visual Guide

## 📂 Complete Folder Hierarchy

```
helwan-club/                                    (Root folder on Cloudinary)
│
├── personal-photos/                            (All profile photos & personal images)
│   ├── members/                               (Regular club members)
│   │   └── photo-1710172800000.jpg
│   ├── team-members/                          (Sport/team members)
│   │   └── photo-1710172801000.jpg
│   ├── staff/                                 (Club employees)
│   │   └── photo-1710172802000.jpg
│   └── participants/                          (Booking invitation participants)
│       └── photo-1710172803000.jpg
│
├── national-ids/                               (All national ID cards)
│   ├── members/                               (Member IDs - front & back)
│   │   ├── id_front-1710172800000.jpg
│   │   └── id_back-1710172800001.jpg
│   ├── team-members/                          (Team member IDs)
│   │   ├── id_front-1710172801000.jpg
│   │   └── id_back-1710172801001.jpg
│   ├── staff/                                 (Staff IDs)
│   │   ├── id_front-1710172802000.jpg
│   │   └── id_back-1710172802001.jpg
│   └── participants/                          (Participant IDs for field access)
│       ├── id_front-1710172803000.jpg
│       └── id_back-1710172803001.jpg
│
├── medical-reports/                            (All medical certificates & reports)
│   ├── members/                               (Member health reports)
│   │   └── medical_report-1710172800000.pdf
│   ├── team-members/                          (Team member health certificates)
│   │   └── medical_report-1710172801000.pdf
│   ├── staff/                                 (Staff health records)
│   │   └── medical_report-1710172802000.pdf
│   └── participants/                          (Participant health documents)
│       └── medical_report-1710172803000.pdf
│
├── proofs/                                     (General proof documents)
│   ├── members/                               (Member employment/income proof)
│   │   └── employment_proof-1710172800000.pdf
│   ├── team-members/                          (Team member proofs)
│   │   └── proof-1710172801000.pdf
│   ├── staff/                                 (Staff employment proof)
│   │   └── proof-1710172802000.pdf
│   └── participants/                          (Participant proofs)
│       └── proof-1710172803000.pdf
│
├── passports/                                  (Passport photos & documents)
│   ├── members/                               (Foreign member passports)
│   │   └── passport-1710172800000.jpg
│   ├── team-members/                          (Foreign team member passports)
│   │   └── passport-1710172801000.jpg
│   ├── staff/                                 (Foreign staff passports)
│   │   └── passport-1710172802000.jpg
│   └── participants/                          (Foreign participant passports)
│       └── passport-1710172803000.jpg
│
├── salary-slips/                               (Employee salary documentation)
│   ├── members/                               (Member salary slips)
│   │   └── salary_slip-1710172800000.pdf
│   ├── team-members/                          (Team member salary slips)
│   │   └── salary_slip-1710172801000.pdf
│   ├── staff/                                 (Staff salary documentation)
│   │   └── salary_slip-1710172802000.pdf
│   └── participants/                          (Participant salary slips)
│       └── salary_slip-1710172803000.pdf
│
├── student-proofs/                             (Student ID & enrollment certificates)
│   ├── members/                               (Student members)
│   │   └── student_id-1710172800000.pdf
│   ├── team-members/                          (Student team members)
│   │   └── student_id-1710172801000.pdf
│   ├── staff/                                 (Student staff)
│   │   └── student_id-1710172802000.pdf
│   └── participants/                          (Student participants)
│       └── student_id-1710172803000.pdf
│
├── media/                                      (Media center posts & gallery)
│   ├── members/                               (Member-uploaded media)
│   │   └── post_image-1710172800000.jpg
│   ├── team-members/                          (Team-uploaded media)
│   │   └── post_image-1710172801000.jpg
│   ├── staff/                                 (Staff-uploaded media)
│   │   └── post_image-1710172802000.jpg
│   └── participants/                          (Participant-uploaded media)
│       └── post_image-1710172803000.jpg
│
├── advertisements/                             (Advertisement images & banners)
│   ├── members/                               (Member-created ads)
│   │   └── ad_banner-1710172800000.jpg
│   ├── team-members/                          (Team-created ads)
│   │   └── ad_banner-1710172801000.jpg
│   ├── staff/                                 (Staff-created ads)
│   │   └── ad_banner-1710172802000.jpg
│   └── participants/                          (Participant-created ads)
│       └── ad_banner-1710172803000.jpg
│
└── other/                                      (Miscellaneous documents)
    ├── members/                               (Other member documents)
    │   └── document-1710172800000.pdf
    ├── team-members/                          (Other team member documents)
    │   └── document-1710172801000.pdf
    ├── staff/                                 (Other staff documents)
    │   └── document-1710172802000.pdf
    └── participants/                          (Other participant documents)
        └── document-1710172803000.pdf
```

---

## 📊 Structure Breakdown

### Level 1: Document Type (10 categories)
```
helwan-club/
├── personal-photos/      ← Profile photos
├── national-ids/         ← ID cards (front & back)
├── medical-reports/      ← Health certificates
├── proofs/               ← Employment/income proof
├── passports/            ← Passport documents
├── salary-slips/         ← Salary documentation
├── student-proofs/       ← Student IDs
├── media/                ← Media center content
├── advertisements/       ← Ad images
└── other/                ← Misc documents
```

### Level 2: User Type (4 categories per document type)
```
{document-type}/
├── members/              ← Regular club members
├── team-members/         ← Sport/team members
├── staff/                ← Club employees
└── participants/         ← Booking participants
```

### Level 3: Individual Files
```
{user-type}/
├── filename-timestamp.extension
└── filename-timestamp.extension
```

---

## 🎯 Real-World Examples

### Example 1: Member Registration
**User Action**: New member "Ahmed" registers with documents

**Uploads**:
```
helwan-club/personal-photos/members/ahmed_photo-1710172800000.jpg
helwan-club/national-ids/members/ahmed_id_front-1710172800001.jpg
helwan-club/national-ids/members/ahmed_id_back-1710172800002.jpg
helwan-club/medical-reports/members/ahmed_medical-1710172800003.pdf
helwan-club/student-proofs/members/ahmed_student_id-1710172800004.pdf
```

### Example 2: Team Member Registration
**User Action**: Team member "Mohamed" joins football team

**Uploads**:
```
helwan-club/personal-photos/team-members/mohamed_photo-1710172810000.jpg
helwan-club/national-ids/team-members/mohamed_id_front-1710172810001.jpg
helwan-club/national-ids/team-members/mohamed_id_back-1710172810002.jpg
helwan-club/medical-reports/team-members/mohamed_medical-1710172810003.pdf
helwan-club/proofs/team-members/mohamed_proof-1710172810004.pdf
```

### Example 3: Booking Participant
**User Action**: Participant "Sara" registers via invitation link

**Uploads**:
```
helwan-club/national-ids/participants/sara_id_front-1710172820000.jpg
helwan-club/national-ids/participants/sara_id_back-1710172820001.jpg
```

### Example 4: Staff Document
**User Action**: Staff member "Hassan" uploads employee documents

**Uploads**:
```
helwan-club/personal-photos/staff/hassan_photo-1710172830000.jpg
helwan-club/national-ids/staff/hassan_id_front-1710172830001.jpg
helwan-club/national-ids/staff/hassan_id_back-1710172830002.jpg
helwan-club/salary-slips/staff/hassan_salary_2026_03-1710172830003.pdf
```

---

## 🔍 Finding Files

### By Document Type
**Want all national IDs?**
```
helwan-club/national-ids/
├── members/ (all member IDs)
├── team-members/ (all team member IDs)
├── staff/ (all staff IDs)
└── participants/ (all participant IDs)
```

### By User Type
**Want all member documents?**
```
helwan-club/
├── personal-photos/members/
├── national-ids/members/
├── medical-reports/members/
├── proofs/members/
├── passports/members/
├── salary-slips/members/
├── student-proofs/members/
├── media/members/
├── advertisements/members/
└── other/members/
```

### By Specific Category
**Want all team member medical reports?**
```
helwan-club/medical-reports/team-members/
```

**Want all participant national IDs?**
```
helwan-club/national-ids/participants/
```

---

## 📈 Growth Scenario

### Month 1: Initial Setup
```
helwan-club/
├── personal-photos/
│   ├── members/ (50 files)
│   └── team-members/ (20 files)
└── national-ids/
    ├── members/ (100 files)
    └── team-members/ (40 files)
```

### Month 6: Growing Usage
```
helwan-club/
├── personal-photos/
│   ├── members/ (500 files)
│   ├── team-members/ (200 files)
│   └── participants/ (50 files)
├── national-ids/
│   ├── members/ (1,000 files)
│   ├── team-members/ (400 files)
│   └── participants/ (100 files)
└── medical-reports/
    ├── members/ (450 files)
    └── team-members/ (180 files)
```

### Year 1: Mature System
```
helwan-club/
├── personal-photos/
│   ├── members/ (2,000 files)
│   ├── team-members/ (800 files)
│   ├── staff/ (100 files)
│   └── participants/ (500 files)
├── national-ids/
│   ├── members/ (4,000 files)
│   ├── team-members/ (1,600 files)
│   ├── staff/ (200 files)
│   └── participants/ (1,000 files)
├── medical-reports/
│   ├── members/ (1,800 files)
│   ├── team-members/ (720 files)
│   └── staff/ (90 files)
└── ... all other categories
```

---

## 🎨 Color-Coded Guide

### 🟦 Member Documents (Blue)
- Most common uploads
- Standard registration flow
- Stored in `{document-type}/members/`

### 🟩 Team Member Documents (Green)
- Sport-specific documents
- Include proofs and medicals
- Stored in `{document-type}/team-members/`

### 🟨 Staff Documents (Yellow)
- Employee records
- Administrative documents
- Stored in `{document-type}/staff/`

### 🟥 Participant Documents (Red)
- Booking invitation users
- Minimal required documents
- Stored in `{document-type}/participants/`

---

## ✨ Key Advantages Visualized

### Before (Unorganized)
```
helwan-club/
├── members/
│   ├── photos/
│   ├── national-ids/
│   └── medical-reports/
└── participant-ids/
    └── (mixed files)
```
❌ Document types scattered  
❌ Hard to find specific categories  
❌ No consistent pattern

### After (Organized)
```
helwan-club/
├── national-ids/
│   ├── members/
│   ├── team-members/
│   ├── staff/
│   └── participants/
└── medical-reports/
    ├── members/
    ├── team-members/
    ├── staff/
    └── participants/
```
✅ Document types grouped together  
✅ Easy category-wide operations  
✅ Consistent, scalable pattern

---

**Created**: March 11, 2026  
**Purpose**: Visual documentation of Cloudinary upload structure  
**Maintainer**: Development Team
