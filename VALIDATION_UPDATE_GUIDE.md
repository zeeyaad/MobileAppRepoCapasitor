// STAFF FORM VALIDATION AND INPUTS UPDATE GUIDE
// This file documents all the changes needed to integrate Zod validation
// Apply these changes to c:\Users\H\Helwan-Club\src\Page\AddNewStaffPage.tsx

## CHANGE 1: Update handleSubmit function (around line 509)
REPLACE:
```
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!firstNameEn || !firstNameAr || !nationalId || !phone || !staffTypeId) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const staffTypeIdNum = Number(staffTypeId);
```

WITH:
```
  const onSubmit = async (data: StaffFormData) => {
    try {
      const staffTypeIdNum = Number(data.staff_type_id);
```

## CHANGE 2: Update payload creation (around line 555)
REPLACE all form field references like:
```
first_name_en: firstNameEn,
first_name_ar: firstNameAr,
last_name_en: lastNameEn || undefined,
last_name_ar: lastNameAr || undefined,
national_id: nationalId,
phone,
address: address || undefined,
staff_type_id: staffTypeIdNum,
employment_start_date: employmentStartDate || undefined,
employment_end_date: employmentEndDate || undefined,
```

WITH:
```
first_name_en: data.first_name_en,
first_name_ar: data.first_name_ar,
last_name_en: data.last_name_en || undefined,
last_name_ar: data.last_name_ar || undefined,
national_id: data.national_id,
phone: data.phone,
address: data.address || undefined,
staff_type_id: staffTypeIdNum,
employment_start_date: data.employment_start_date || undefined,
employment_end_date: data.employment_end_date || undefined,
```

## CHANGE 3: Update credentials dialog (around line 571)
REPLACE:
```
email: `staff.${nationalId}@helwan-club.local`,
password: nationalId
```

WITH:
```
email: `staff.${data.national_id}@helwan-club.local`,
password: data.national_id
```

## CHANGE 4: Update form reset (around line 583)
REPLACE all the setState calls:
```
setFirstNameEn("");
setFirstNameAr("");
setLastNameEn("");
setLastNameAr("");
setNationalId("");
setPhone("");
setAddress("");
setStaffTypeId("");
setEmploymentStartDate("");
setEmploymentEndDate("");
setSelectedPackageKeys([]);
setSelectedExtraPrivilegeIds([]);
```

WITH:
```
reset();
setSelectedPackageKeys([]);
setSelectedExtraPrivilegeIds([]);
```

## CHANGE 5: Remove finally block's setIsSubmitting(false) (around line 603)
REMOVE:
```
} finally {
  setIsSubmitting(false);
}
```

(isSubmitting is now managed by react-hook-form automatically)

## CHANGE 6: Update form submission (around line 615)
REPLACE:
```
<form onSubmit={handleSubmit} className="space-y-6">
```

WITH:
```
<form onSubmit={hookFormSubmit(onSubmit)} className="space-y-6">
```
