# Uploads Folder Structure

## 📂 Organization

This folder contains all uploaded documents organized by **document type** first, then by **user type**.

```
uploads/
├── personal-photos/
│   ├── members/
│   ├── team-members/
│   ├── staff/
│   └── participants/
├── national-ids/
│   ├── members/
│   ├── team-members/
│   ├── staff/
│   └── participants/
├── medical-reports/
│   ├── members/
│   ├── team-members/
│   ├── staff/
│   └── participants/
├── proofs/
│   ├── members/
│   ├── team-members/
│   ├── staff/
│   └── participants/
├── passports/
│   ├── members/
│   ├── team-members/
│   ├── staff/
│   └── participants/
├── salary-slips/
│   ├── members/
│   ├── team-members/
│   ├── staff/
│   └── participants/
├── student-proofs/
│   ├── members/
│   ├── team-members/
│   ├── staff/
│   └── participants/
├── media/
│   ├── members/
│   ├── team-members/
│   ├── staff/
│   └── participants/
├── advertisements/
│   ├── members/
│   ├── team-members/
│   ├── staff/
│   └── participants/
└── other/
    ├── members/
    ├── team-members/
    ├── staff/
    └── participants/
```

## 📋 Folder Descriptions

### Document Types (Level 1)

| Folder | Purpose |
|--------|---------|
| `personal-photos/` | Profile photos, personal images |
| `national-ids/` | National ID cards (front & back) |
| `medical-reports/` | Medical certificates, health reports |
| `proofs/` | Employment proof, income documentation |
| `passports/` | Passport photos and documents |
| `salary-slips/` | Salary documentation |
| `student-proofs/` | Student IDs, enrollment certificates |
| `media/` | Media center posts, gallery images |
| `advertisements/` | Advertisement images and banners |
| `other/` | Miscellaneous documents |

### User Types (Level 2)

| Folder | Purpose |
|--------|---------|
| `members/` | Regular club members |
| `team-members/` | Sport/team members |
| `staff/` | Club employees |
| `participants/` | Booking invitation participants |

## 🎯 Examples

### Member Registration Documents
- Personal Photo: `personal-photos/members/photo-1710172800000.jpg`
- National ID Front: `national-ids/members/id_front-1710172800001.jpg`
- National ID Back: `national-ids/members/id_back-1710172800002.jpg`
- Medical Report: `medical-reports/members/medical-1710172800003.pdf`
- Student Proof: `student-proofs/members/student_id-1710172800004.pdf`

### Team Member Documents
- Personal Photo: `personal-photos/team-members/photo-1710172810000.jpg`
- National ID Front: `national-ids/team-members/id_front-1710172810001.jpg`
- Medical Report: `medical-reports/team-members/medical-1710172810002.pdf`

### Booking Participant Documents
- National ID Front: `national-ids/participants/id_front-1710172820000.jpg`
- National ID Back: `national-ids/participants/id_back-1710172820001.jpg`

### Staff Documents
- Personal Photo: `personal-photos/staff/photo-1710172830000.jpg`
- National ID: `national-ids/staff/id_front-1710172830001.jpg`
- Salary Slip: `salary-slips/staff/salary-1710172830002.pdf`

## 🔒 Security Notes

- **National IDs** and **Medical Reports** contain sensitive information - ensure proper access controls
- **Participant** documents are for booking invitation users - separate from members for privacy
- Set appropriate folder permissions at the server level
- Consider encryption for highly sensitive documents

## 🛠️ Maintenance

### Re-create Folders
If folders are accidentally deleted, run:
```powershell
.\create-upload-folders.ps1
```

Or from code:
```typescript
import { initializeFolderStructure } from './src/utils/localFileStorage';
await initializeFolderStructure();
```

### Cleanup Old Files
Consider implementing automated cleanup policies:
- Archive files older than X months
- Move expired documents to archive folder
- Delete participant documents after booking completion + retention period

## 📊 Statistics

- **Total Folders**: 40 (10 document types × 4 user types)
- **Structure Levels**: 3 (uploads → document-type → user-type)
- **Naming Pattern**: `{filename}-{timestamp}.{extension}`

## ⚠️ Important

- **Do NOT** manually reorganize files - use the upload utilities
- **Timestamps** in filenames prevent conflicts
- **Folder names** are lowercase with hyphens (e.g., `team-members`, not `Team Members`)
- **File paths** in database should use forward slashes: `uploads/national-ids/members/file.jpg`

## 🔗 Related Documentation

- See `../UPLOAD_ORGANIZATION_SUMMARY.md` for complete implementation details
- See `../UPLOAD_QUICK_REFERENCE.md` for code examples
- See `../UPLOAD_STRUCTURE_VISUAL_GUIDE.md` for visual documentation

---

**Created**: March 11, 2026  
**Total Folders**: 40  
**Purpose**: Organized document storage for Helwan Club Management System
