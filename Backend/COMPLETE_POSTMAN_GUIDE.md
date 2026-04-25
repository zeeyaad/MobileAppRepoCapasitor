# Complete Postman Collection Guide

## 🎉 Collection Generated Successfully!

**Total Endpoints**: 113 routes (100% coverage)  
**File**: `Helwan_Club_Complete_API.postman_collection.json`

---

## 📁 Collection Structure (18 Folders)

### **1. Authentication (2 endpoints)**
- Login
- Change Credentials

### **2. Staff Management - Core (6 endpoints)**
- Get Staff Types
- Register Staff
- Get All Staff
- Get Staff by ID
- Update Staff
- Deactivate Staff

### **3. Staff Management - Privileges (11 endpoints)**
- Get All Privileges
- Get Privilege Packages
- Get Package Privileges
- Assign Packages
- Get Staff Privileges
- Get Final Privileges
- Get Privilege Codes
- Grant Privilege
- Revoke Privilege
- Check Privilege
- Get Activity Logs

### **4. Sports (7 endpoints)**
- Create Sport
- Get All Sports
- Get Sport by ID
- Update Sport
- Approve Sport
- Delete Sport
- Toggle Sport Status

### **5. Membership Plans (2 endpoints)**
- Get All Plans (Public)
- Get Plan by ID (Public)

### **6. Registration - Basic (4 endpoints)**
- Register Basic
- Choose Role
- Determine Membership
- Complete Registration

### **7. Registration - Working Members (9 endpoints)**
- Register Complete Working
- Get Professions
- Get Salary Brackets
- Get Relationship Types
- Get Active Working Members
- Calculate Price
- Submit Working Details
- Create Working Membership
- Get Working Status

### **8. Registration - Retired Members (9 endpoints)**
- Register Complete Retired
- Get Professions
- Get Relationship Types
- Get Active Members
- Calculate Price
- Submit Details
- Create Membership
- Create Relationship
- Get Status

### **9. Registration - Student Members (10 endpoints)**
- Register Complete Student
- Get Student Statuses
- Get Relationship Types
- Get Active Members
- Submit Details
- Calculate Price
- Create Membership
- Calculate Dependent Price
- Create Dependent Membership
- Get Status

### **10. Registration - Dependent Members (9 endpoints)**
- Get Subtypes
- Get Relationship Types
- Get Active Working
- Get Active Visitors
- Get Active Members
- Get Dependent Tiers
- Calculate Price
- Create Membership
- Get Status

### **11. Registration - Team Members (4 endpoints)**
- Submit Details
- Select Teams
- Get Status
- Review All (Sport Staff)

### **12. Members - Core (10 endpoints)**
- Get All Members
- Get Member by ID
- Create Member
- Update Member
- Review Member
- Change Status
- Block/Unblock
- Reset Password
- Get History
- Manage Request

### **13. Members - Documents (4 endpoints)**
- Upload Document
- Delete Document
- Print Document
- Print Member Card

### **14. Membership Plans - Admin (8 endpoints)**
- Get All Plans
- Get Plan by ID
- Create Plan
- Update Plan
- Delete Plan
- Change Status
- Assign to Member
- Change Member Plan

### **15. Member Types (6 endpoints)**
- Get All Types
- Get Type by ID
- Create Type
- Update Type
- Delete Type
- Assign to Member

### **16. Faculties (6 endpoints)**
- Get All Faculties
- Get Faculty by ID
- Create Faculty
- Update Faculty
- Delete Faculty
- Assign to Member

### **17. Professions (6 endpoints)**
- Get All Professions
- Get Profession by ID
- Create Profession
- Update Profession
- Delete Profession
- Assign to Member

---

## 🚀 Quick Start

### **1. Import Collection**
```
1. Open Postman
2. Click "Import"
3. Select: Helwan_Club_Complete_API.postman_collection.json
4. Click "Import"
```

### **2. Set Up Environment (Optional)**
Create a Postman environment with:
- `baseUrl`: `http://localhost:3000/api`
- `authToken`: (auto-populated after login)

### **3. Test Authentication**
```
1. Open "Authentication" folder
2. Run "Login" request
3. Token is automatically saved to {{authToken}}
4. All other requests now work!
```

---

## 🎯 Common Workflows

### **Workflow 1: Register New Staff Member**
```
1. POST /auth/login (get admin token)
2. GET /staff/types (choose staff type)
3. POST /staff/register (create staff)
4. GET /staff/packages (view packages)
5. POST /staff/:id/assign-packages (assign privileges)
6. GET /staff/:id/final-privileges (verify)
```

### **Workflow 2: Complete Member Registration (Working)**
```
1. POST /register/basic (create account)
2. GET /register/professions (get professions)
3. GET /register/salary-brackets (get brackets)
4. POST /register/calculate-working-membership-price (get price)
5. POST /register/details/working-member (submit details)
6. POST /register/working-membership (create membership)
7. GET /register/working-status/:member_id (check status)
```

### **Workflow 3: Manage Sports**
```
1. POST /auth/login
2. GET /sports (list all)
3. POST /sports (create new)
4. PUT /sports/:id (update)
5. POST /sports/:id/approve (approve if needed)
6. PATCH /sports/:id/toggle-status (activate/deactivate)
```

### **Workflow 4: Member Approval**
```
1. POST /auth/login
2. GET /members?status=pending (get pending members)
3. GET /members/:id (review details)
4. GET /members/:id/review (detailed review)
5. PATCH /members/:id/status (approve/reject)
```

---

## 🔧 Features

### **Auto-Authentication**
- Collection-level bearer token authentication
- Login request automatically saves token
- All authenticated requests use `{{authToken}}`

### **Pre-filled Examples**
- All requests include example data
- Path variables pre-filled (`:id` = 5, etc.)
- Query parameters included where applicable

### **Request Bodies**
- POST/PUT/PATCH requests have example JSON
- Ready to modify and test immediately

### **Organized Structure**
- 18 logical folders
- Easy to navigate
- Related endpoints grouped together

---

## 📝 Notes

### **Public Endpoints (No Auth Required)**
- `POST /auth/login`
- `GET /membership` and `/membership/:id`
- All `/register/*` endpoints (except team member review)

### **Path Variables**
- Replace `:id`, `:member_id`, etc. with actual values
- Example values provided in collection

### **Query Parameters**
- Optional parameters included in URLs
- Enable/disable as needed

### **Request Bodies**
- Modify example data for your tests
- All required fields included

---

## 🆚 Comparison with Previous Collection

| Feature | Old Collection | New Collection |
|---------|---------------|----------------|
| **Total Endpoints** | 39 | 113 |
| **Coverage** | 41% | 100% |
| **Folders** | 7 | 18 |
| **Registration Routes** | 5 | 45 |
| **Member Admin Routes** | 8 | 24 |
| **Staff Privilege Routes** | 3 | 11 |
| **New Features** | - | Faculties, Professions, Member Types |

---

## 🔄 Regenerating Collection

If routes change, regenerate the collection:

```bash
cd Backend
python generate_postman_collection.py
```

The script will:
1. Read all route definitions
2. Generate complete Postman collection
3. Save to `Helwan_Club_Complete_API.postman_collection.json`

---

## 📞 Support

- **API Documentation**: `Backend/API_DOCUMENTATION.md`
- **Coverage Analysis**: `Backend/API_COVERAGE_ANALYSIS.md`
- **Route Mapping**: `Backend/POSTMAN_ROUTE_MAPPING.md`

---

**Generated**: February 14, 2026  
**Version**: 2.0 (Complete)  
**Endpoints**: 113  
**Coverage**: 100%
