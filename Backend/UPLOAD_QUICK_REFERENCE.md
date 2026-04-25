# Upload Organization - Quick Reference

## 🚀 Quick Start

### Import the Enums
```typescript
import { uploadToCloudinary, DocumentType, UserType } from '../utils/cloudinaryUpload';
```

### Upload a File
```typescript
const url = await uploadToCloudinary(
  fileBuffer,
  originalFilename,
  DocumentType.{TYPE},  // Pick from enum
  UserType.{USER}       // Pick from enum
);
```

---

## 📋 Document Type Enum

| Code | Value | Use For |
|------|-------|---------|
| `DocumentType.PERSONAL_PHOTO` | `'personal-photos'` | Profile photos, personal images |
| `DocumentType.NATIONAL_ID` | `'national-ids'` | National ID cards (front/back) |
| `DocumentType.MEDICAL_REPORT` | `'medical-reports'` | Medical certificates |
| `DocumentType.PROOF` | `'proofs'` | Employment/income proof |
| `DocumentType.PASSPORT` | `'passports'` | Passport documents |
| `DocumentType.SALARY_SLIP` | `'salary-slips'` | Salary documentation |
| `DocumentType.STUDENT_PROOF` | `'student-proofs'` | Student IDs, enrollment |
| `DocumentType.MEDIA` | `'media'` | Media center posts |
| `DocumentType.ADVERTISEMENT` | `'advertisements'` | Ad images |
| `DocumentType.OTHER` | `'other'` | Miscellaneous |

---

## 👥 User Type Enum

| Code | Value | Use For |
|------|-------|---------|
| `UserType.MEMBER` | `'members'` | Regular club members |
| `UserType.TEAM_MEMBER` | `'team-members'` | Sport/team members |
| `UserType.STAFF` | `'staff'` | Club employees |
| `UserType.PARTICIPANT` | `'participants'` | Booking participants |

---

## 💡 Common Examples

### Member Personal Photo
```typescript
await uploadToCloudinary(
  buffer, filename,
  DocumentType.PERSONAL_PHOTO,
  UserType.MEMBER
);
// → helwan-club/personal-photos/members/filename-timestamp.jpg
```

### Member National ID
```typescript
await uploadToCloudinary(
  buffer, filename,
  DocumentType.NATIONAL_ID,
  UserType.MEMBER
);
// → helwan-club/national-ids/members/filename-timestamp.jpg
```

### Team Member Medical Report
```typescript
await uploadToCloudinary(
  buffer, filename,
  DocumentType.MEDICAL_REPORT,
  UserType.TEAM_MEMBER
);
// → helwan-club/medical-reports/team-members/filename-timestamp.pdf
```

### Participant National ID
```typescript
await uploadToCloudinary(
  buffer, filename,
  DocumentType.NATIONAL_ID,
  UserType.PARTICIPANT
);
// → helwan-club/national-ids/participants/filename-timestamp.jpg
```

### Staff Personal Photo
```typescript
await uploadToCloudinary(
  buffer, filename,
  DocumentType.PERSONAL_PHOTO,
  UserType.STAFF
);
// → helwan-club/personal-photos/staff/filename-timestamp.jpg
```

---

## 🗂️ Resulting Paths

### Pattern
```
helwan-club/{document-type}/{user-type}/{filename-timestamp}.{ext}
```

### Examples
```
helwan-club/personal-photos/members/photo-1710172800000.jpg
helwan-club/national-ids/team-members/id-1710172800000.jpg
helwan-club/medical-reports/members/report-1710172800000.pdf
helwan-club/proofs/team-members/proof-1710172800000.pdf
helwan-club/national-ids/participants/id-1710172800000.jpg
```

---

## ✅ Migration Checklist

### Controllers Updated
- [x] ParticipantRegistrationController
- [x] TeamMemberController
- [x] RegistrationController
- [ ] DetailedRegistrationController
- [ ] ForeignerSeasonalController
- [ ] DependentMemberController
- [ ] MediaPostController
- [ ] AdvertisementController
- [ ] StaffController (when file uploads added)

### Per Controller Update
1. ✅ Add enum imports
2. ✅ Replace old `uploadToCloudinary` calls
3. ✅ Use DocumentType enum for document category
4. ✅ Use UserType enum for user category
5. ✅ Test uploads
6. ✅ Verify paths in Cloudinary

---

## 🔧 Code Templates

### Member Registration
```typescript
import { uploadToCloudinary, DocumentType, UserType } from '../utils/cloudinaryUpload';

// Personal photo
if (personalPhotoFile) {
  const photoUrl = await uploadToCloudinary(
    personalPhotoFile.buffer,
    personalPhotoFile.originalname,
    DocumentType.PERSONAL_PHOTO,
    UserType.MEMBER
  );
}

// National ID Front
if (nationalIdFrontFile) {
  const idFrontUrl = await uploadToCloudinary(
    nationalIdFrontFile.buffer,
    nationalIdFrontFile.originalname,
    DocumentType.NATIONAL_ID,
    UserType.MEMBER
  );
}

// National ID Back
if (nationalIdBackFile) {
  const idBackUrl = await uploadToCloudinary(
    nationalIdBackFile.buffer,
    nationalIdBackFile.originalname,
    DocumentType.NATIONAL_ID,
    UserType.MEMBER
  );
}

// Medical Report
if (medicalReportFile) {
  const medicalUrl = await uploadToCloudinary(
    medicalReportFile.buffer,
    medicalReportFile.originalname,
    DocumentType.MEDICAL_REPORT,
    UserType.MEMBER
  );
}

// Student Proof
if (studentProofFile) {
  const proofUrl = await uploadToCloudinary(
    studentProofFile.buffer,
    studentProofFile.originalname,
    DocumentType.STUDENT_PROOF,
    UserType.MEMBER
  );
}
```

### Team Member Registration
```typescript
import { uploadToCloudinary, DocumentType, UserType } from '../utils/cloudinaryUpload';

const userType = UserType.TEAM_MEMBER;

// Personal Photo
if (personalPhoto) {
  photoUrl = await uploadToCloudinary(
    personalPhoto.buffer,
    personalPhoto.originalname,
    DocumentType.PERSONAL_PHOTO,
    userType
  );
}

// Medical Report
if (medicalReport) {
  reportUrl = await uploadToCloudinary(
    medicalReport.buffer,
    medicalReport.originalname,
    DocumentType.MEDICAL_REPORT,
    userType
  );
}

// National ID Front
if (nationalIdFront) {
  idFrontUrl = await uploadToCloudinary(
    nationalIdFront.buffer,
    nationalIdFront.originalname,
    DocumentType.NATIONAL_ID,
    userType
  );
}

// National ID Back
if (nationalIdBack) {
  idBackUrl = await uploadToCloudinary(
    nationalIdBack.buffer,
    nationalIdBack.originalname,
    DocumentType.NATIONAL_ID,
    userType
  );
}

// Proof
if (proof) {
  proofUrl = await uploadToCloudinary(
    proof.buffer,
    proof.originalname,
    DocumentType.PROOF,
    userType
  );
}
```

### Participant (Invitation Link)
```typescript
import { uploadToCloudinary, DocumentType, UserType } from '../utils/cloudinaryUpload';

const userType = UserType.PARTICIPANT;

// National ID Front
if (files?.national_id_front?.[0]) {
  const frontFile = files.national_id_front[0];
  national_id_front_url = await uploadToCloudinary(
    frontFile.buffer,
    frontFile.originalname,
    DocumentType.NATIONAL_ID,
    userType
  );
}

// National ID Back
if (files?.national_id_back?.[0]) {
  const backFile = files.national_id_back[0];
  national_id_back_url = await uploadToCloudinary(
    backFile.buffer,
    backFile.originalname,
    DocumentType.NATIONAL_ID,
    userType
  );
}
```

---

## 🎯 Path Lookup Table

| Document | Member | Team Member | Staff | Participant |
|----------|--------|-------------|-------|-------------|
| Personal Photo | `personal-photos/members/` | `personal-photos/team-members/` | `personal-photos/staff/` | `personal-photos/participants/` |
| National ID | `national-ids/members/` | `national-ids/team-members/` | `national-ids/staff/` | `national-ids/participants/` |
| Medical Report | `medical-reports/members/` | `medical-reports/team-members/` | `medical-reports/staff/` | `medical-reports/participants/` |
| Proof | `proofs/members/` | `proofs/team-members/` | `proofs/staff/` | `proofs/participants/` |
| Passport | `passports/members/` | `passports/team-members/` | `passports/staff/` | `passports/participants/` |
| Salary Slip | `salary-slips/members/` | `salary-slips/team-members/` | `salary-slips/staff/` | `salary-slips/participants/` |
| Student Proof | `student-proofs/members/` | `student-proofs/team-members/` | `student-proofs/staff/` | `student-proofs/participants/` |

---

## ⚡ Tips

1. **Always use enums** - Never use string literals
2. **Import both enums** - DocumentType AND UserType
3. **Choose correct user type** - Member vs TeamMember vs Staff vs Participant
4. **Check Cloudinary console** - Verify folder structure
5. **Test uploads** - Confirm files in correct locations

---

## 🆘 Common Issues

### TypeScript Error: String not assignable to DocumentType
❌ **Wrong**:
```typescript
uploadToCloudinary(buffer, filename, 'personal-photos', 'members')
```

✅ **Correct**:
```typescript
uploadToCloudinary(buffer, filename, DocumentType.PERSONAL_PHOTO, UserType.MEMBER)
```

### Missing Imports
❌ **Wrong**:
```typescript
import { uploadToCloudinary } from '../utils/cloudinaryUpload';
```

✅ **Correct**:
```typescript
import { uploadToCloudinary, DocumentType, UserType } from '../utils/cloudinaryUpload';
```

### Wrong User Type
❌ **Wrong** (for team member):
```typescript
uploadToCloudinary(buffer, filename, DocumentType.PERSONAL_PHOTO, UserType.MEMBER)
```

✅ **Correct**:
```typescript
uploadToCloudinary(buffer, filename, DocumentType.PERSONAL_PHOTO, UserType.TEAM_MEMBER)
```

---

**Last Updated**: March 11, 2026  
**Quick Reference Version**: 1.0  
**Status**: Active ✅
