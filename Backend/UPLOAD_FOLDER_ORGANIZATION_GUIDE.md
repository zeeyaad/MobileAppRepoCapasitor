# Upload Folder Organization Migration Guide

## Overview
This document outlines the migration from the old unorganized upload structure to the new organized folder hierarchy.

## New Folder Structure

The new structure organizes uploads by **document type** first, then by **user type**:

```
helwan-club/
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
│   └── (for media posts, announcements, etc.)
├── advertisements/
│   └── (for advertisement images)
└── other/
    ├── members/
    ├── team-members/
    ├── staff/
    └── participants/
```

## Document Types

| Enum Value | Folder Name | Purpose |
|------------|-------------|---------|
| `DocumentType.PERSONAL_PHOTO` | `personal-photos` | Profile photos, personal images |
| `DocumentType.NATIONAL_ID` | `national-ids` | National ID cards (front & back) |
| `DocumentType.MEDICAL_REPORT` | `medical-reports` | Medical certificates, reports |
| `DocumentType.PROOF` | `proofs` | Employment proof, student proof, etc. |
| `DocumentType.PASSPORT` | `passports` | Passport photos |
| `DocumentType.SALARY_SLIP` | `salary-slips` | Salary slips for employees |
| `DocumentType.STUDENT_PROOF` | `student-proofs` | Student ID, enrollment proof |
| `DocumentType.MEDIA` | `media` | Media center posts, gallery |
| `DocumentType.ADVERTISEMENT` | `advertisements` | Advertisement images |
| `DocumentType.OTHER` | `other` | Miscellaneous documents |

## User Types

| Enum Value | Folder Name | Description |
|------------|-------------|-------------|
| `UserType.MEMBER` | `members` | Regular club members |
| `UserType.TEAM_MEMBER` | `team-members` | Team/sport members |
| `UserType.STAFF` | `staff` | Staff/employee documents |
| `UserType.PARTICIPANT` | `participants` | Booking invitation participants |

## Migration Steps

### 1. ✅ Update cloudinaryUpload.ts
The utility has been updated with:
- `DocumentType` enum for document categories
- `UserType` enum for user categories  
- `buildCloudinaryPath()` function for consistent path building
- New `uploadToCloudinary()` signature with enums
- Legacy function preserved for backward compatibility

### 2. ✅ Update ParticipantRegistrationController
National ID uploads for participants now go to:
- `helwan-club/national-ids/participants/`

### 3. ✅ Update TeamMemberController
All team member uploads now organized by document type:
- Personal photos → `helwan-club/personal-photos/team-members/`
- National IDs → `helwan-club/national-ids/team-members/`
- Medical reports → `helwan-club/medical-reports/team-members/`
- Proofs → `helwan-club/proofs/team-members/`

### 4. 🔄 Update RegistrationController (TODO)
Member registration uploads:
```typescript
// Old
uploadToCloudinary(buffer, filename, 'helwan-club/members/photos')

// New
uploadToCloudinary(buffer, filename, DocumentType.PERSONAL_PHOTO, UserType.MEMBER)
```

### 5. 🔄 Update DetailedRegistrationController (TODO)
Similar to RegistrationController for detailed member registration.

### 6. 🔄 Update ForeignerSeasonalController (TODO)
Foreign member registration:
```typescript
// Passport photos
uploadToCloudinary(buffer, filename, DocumentType.PASSPORT, UserType.MEMBER)
```

### 7. 🔄 Update DependentMemberController (TODO)
Dependent member documents.

### 8. 🔄 Update MediaPostController (TODO)
Media center uploads:
```typescript
uploadToCloudinary(buffer, filename, DocumentType.MEDIA, UserType.MEMBER)
```

### 9. 🔄 Update AdvertisementController (TODO)
Advertisement uploads:
```typescript
uploadToCloudinary(buffer, filename, DocumentType.ADVERTISEMENT, UserType.STAFF)
```

### 10. 🔄 Add Staff Document Uploads (TODO)
When staff document management is implemented:
```typescript
uploadToCloudinary(buffer, filename, DocumentType.NATIONAL_ID, UserType.STAFF)
```

## Usage Examples

### Example 1: Member Registration
```typescript
import { uploadToCloudinary, DocumentType, UserType } from '../utils/cloudinaryUpload';

// Upload personal photo
const photoUrl = await uploadToCloudinary(
  photoFile.buffer,
  photoFile.originalname,
  DocumentType.PERSONAL_PHOTO,
  UserType.MEMBER
);
// Result: helwan-club/personal-photos/members/photo-1234567890.jpg

// Upload national ID
const idUrl = await uploadToCloudinary(
  idFile.buffer,
  idFile.originalname,
  DocumentType.NATIONAL_ID,
  UserType.MEMBER
);
// Result: helwan-club/national-ids/members/id-1234567890.jpg
```

### Example 2: Team Member Registration
```typescript
// Upload medical report
const reportUrl = await uploadToCloudinary(
  reportFile.buffer,
  reportFile.originalname,
  DocumentType.MEDICAL_REPORT,
  UserType.TEAM_MEMBER
);
// Result: helwan-club/medical-reports/team-members/report-1234567890.pdf
```

### Example 3: Booking Participant
```typescript
// Upload national ID for participant
const idUrl = await uploadToCloudinary(
  idFile.buffer,
  idFile.originalname,
  DocumentType.NATIONAL_ID,
  UserType.PARTICIPANT
);
// Result: helwan-club/national-ids/participants/id-1234567890.jpg
```

### Example 4: Staff Document
```typescript
// Upload staff personal photo
const photoUrl = await uploadToCloudinary(
  photoFile.buffer,
  photoFile.originalname,
  DocumentType.PERSONAL_PHOTO,
  UserType.STAFF
);
// Result: helwan-club/personal-photos/staff/photo-1234567890.jpg
```

## Benefits

### 1. **Clear Organization**
- Documents grouped by type first (easier to manage bulk operations)
- User types separated within each category
- No confusion about where files belong

### 2. **Easy Maintenance**
- Find all national IDs in one place
- Manage medical reports across all user types
- Backup specific document categories

### 3. **Access Control**
- Set permissions by document type
- Separate sensitive documents (medical reports, IDs)
- Control who can access participant documents

### 4. **Analytics & Reporting**
- Count documents by type
- Track upload trends
- Monitor storage usage by category

### 5. **Scalability**
- Easy to add new document types
- Simple to add new user types
- Consistent path structure

## Migration Checklist

- [x] Update `cloudinaryUpload.ts` with enums and new function
- [x] Update `ParticipantRegistrationController.ts`
- [x] Update `TeamMemberController.ts`
- [ ] Update `RegistrationController.ts`
- [ ] Update `DetailedRegistrationController.ts`
- [ ] Update `ForeignerSeasonalController.ts`
- [ ] Update `DependentMemberController.ts`
- [ ] Update `MediaPostController.ts`
- [ ] Update `AdvertisementController.ts`
- [ ] Test all upload endpoints
- [ ] Update API documentation
- [ ] Update frontend upload components

## Testing

### Test Each Upload Type
1. Member personal photo
2. Member national ID (front/back)
3. Member medical report
4. Member student proof
5. Team member documents (all types)
6. Participant national ID
7. Media posts
8. Advertisements

### Verify Cloudinary Structure
Check Cloudinary console to ensure folders are created correctly:
```
helwan-club/
  ├── national-ids/
  │   ├── members/ (has files)
  │   ├── team-members/ (has files)
  │   └── participants/ (has files)
  ├── personal-photos/
  │   ├── members/ (has files)
  │   └── team-members/ (has files)
  etc...
```

## Rollback Plan

If issues occur, the legacy function is still available:
```typescript
import { uploadToCloudinaryLegacy } from '../utils/cloudinaryUpload';

// Use old method
const url = await uploadToCloudinaryLegacy(
  buffer,
  filename,
  'helwan-club/old-path'
);
```

## Notes

1. **Existing files remain unchanged** - Only new uploads use the new structure
2. **No database migration needed** - URLs are stored as-is
3. **Backward compatible** - Old code continues to work
4. **Gradual migration** - Update controllers one by one
5. **Cloudinary manages folders** - Folders created automatically on first upload

## Support

For questions or issues:
1. Check Cloudinary console for uploaded files
2. Review upload logs in console
3. Verify enum values match folder names
4. Ensure all imports are correct

---

**Last Updated**: March 11, 2026
**Status**: In Progress (3/10 controllers migrated)
