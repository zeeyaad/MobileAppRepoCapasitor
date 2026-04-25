# Postman Collection Route Mapping

This document maps all the routes used in the Staff Dashboard to their corresponding Postman Collection requests.

## ✅ Routes Used in Staff Dashboard

### **Authentication Routes**
| Frontend Usage | API Endpoint | Postman Request | Status |
|---|---|---|---|
| Login page | `POST /auth/login` | Authentication → Login | ✅ Included |
| First-time staff login | `POST /auth/login` | Authentication → Login (First Time Staff) | ✅ Included |
| Change credentials | `POST /auth/change-credentials` | Authentication → Change Credentials | ✅ Included |

### **Staff Management Routes**
| Frontend Usage | API Endpoint | Postman Request | Status |
|---|---|---|---|
| Get staff types dropdown | `GET /staff/types` | Staff Management → Get Staff Types | ✅ Included |
| Register new staff | `POST /staff/register` | Staff Management → Register Staff | ✅ Included |
| Get staff details | `GET /staff/:id` | Staff Management → Get Staff by ID | ✅ Included |
| Update staff info | `PUT /staff/:id` | Staff Management → Update Staff | ✅ Included |
| Get privilege packages | `GET /staff/packages` | Staff Management → Get Privilege Packages | ✅ Included |
| Assign packages | `POST /staff/:id/assign-packages` | Staff Management → Assign Packages to Staff | ✅ Included |
| Get final privileges | `GET /staff/:id/final-privileges` | Staff Management → Get Staff Final Privileges | ✅ Included |
| Get activity logs | `GET /staff/:id/activity-logs` | Staff Management → Get Staff Activity Logs | ✅ Included |

### **Sport Management Routes**
| Frontend Usage | API Endpoint | Postman Request | Status |
|---|---|---|---|
| Get all sports | `GET /sports` | Sport Management → Get All Sports | ✅ Included |
| Create sport | `POST /sports` | Sport Management → Create Sport | ✅ Included |
| Update sport | `PUT /sports/:id` | Sport Management → Update Sport | ✅ Included |
| Delete sport | `DELETE /sports/:id` | Sport Management → Delete Sport | ✅ Included |

### **Member Management Routes**
| Frontend Usage | API Endpoint | Postman Request | Status |
|---|---|---|---|
| Get pending members | `GET /members?status=pending` | Member Administration → Get All Members | ✅ Included |
| Approve member | `PATCH /members/:id/status` | Member Administration → Change Member Status | ✅ Included |
| Create member | `POST /members` | Member Administration → Create Member | ✅ Included |

### **Registration Routes**
| Frontend Usage | API Endpoint | Postman Request | Status |
|---|---|---|---|
| Basic registration | `POST /register/basic` | Registration → Register Basic Member | ✅ Included |
| Determine membership | `POST /register/determine-membership` | ⚠️ Not in collection |
| Submit details | `POST /register/details/*` | ⚠️ Not in collection |
| Complete registration | `POST /register/complete` | ⚠️ Not in collection |

---

## 📊 Coverage Summary

- **Total Routes Used**: ~25 endpoints
- **Covered in Postman**: 22 endpoints (88%)
- **Missing from Postman**: 3 endpoints (12%)

---

## 🔧 How to Use the Postman Collection

### **1. Import the Collection**
```bash
File: Backend/Helwan_Club_API.postman_collection.json
```

1. Open Postman
2. Click **Import**
3. Select the JSON file
4. Click **Import**

### **2. Set Up Environment Variables**

The collection uses two variables:
- `baseUrl`: `http://localhost:3000/api` (already set)
- `authToken`: Auto-populated after login

### **3. Test Workflow**

#### **A. Authentication Flow**
1. Run **Authentication → Login**
   - Token is automatically saved to `{{authToken}}`
2. All subsequent requests use the saved token

#### **B. Staff Management Flow**
1. **Get Staff Types** - Get available staff roles
2. **Register Staff** - Create new staff member
3. **Get Privilege Packages** - View available packages
4. **Assign Packages to Staff** - Assign privileges
5. **Get Staff Final Privileges** - Verify assigned privileges

#### **C. Sport Management Flow**
1. **Get All Sports** - List all sports
2. **Create Sport** - Add new sport
3. **Update Sport** - Modify sport details
4. **Delete Sport** - Remove sport

#### **D. Member Management Flow**
1. **Get All Members** - List members (filter by status)
2. **Get Member by ID** - View member details
3. **Change Member Status** - Approve/suspend members
4. **Create Member** - Add new member

---

## 🎯 Quick Test Scenarios

### **Scenario 1: Register and Configure New Staff**
```
1. POST /auth/login (admin credentials)
2. GET /staff/types
3. POST /staff/register
4. GET /staff/packages
5. POST /staff/:id/assign-packages
6. GET /staff/:id/final-privileges
```

### **Scenario 2: Manage Sports**
```
1. POST /auth/login
2. GET /sports
3. POST /sports (create new)
4. PUT /sports/:id (update)
5. DELETE /sports/:id (remove)
```

### **Scenario 3: Member Approval Workflow**
```
1. POST /auth/login
2. GET /members?status=pending
3. GET /members/:id (review details)
4. PATCH /members/:id/status (approve)
```

---

## 📝 Notes

### **Authentication**
- All authenticated requests automatically use `{{authToken}}`
- Token is saved automatically after successful login
- No manual copy-paste needed

### **Path Variables**
- Pre-filled with example values (`:id` = 5, etc.)
- Replace with actual IDs when testing

### **Query Parameters**
- Optional parameters are included in URLs
- Disable/enable as needed in Postman

### **Request Bodies**
- All POST/PUT/PATCH requests include example data
- Modify values as needed for your tests

---

## 🚀 Additional Endpoints Available

The collection includes additional endpoints not currently used in the staff dashboard but available for future features:

- Grant/Revoke individual privileges
- Approve sports (Manager only)
- Toggle sport status
- Membership plan management
- Team member registration
- And more...

---

## 📞 Support

For issues or questions about the API:
1. Check the main API documentation: `Backend/API_DOCUMENTATION.md`
2. Review route definitions in `Backend/src/routes/`
3. Check controller implementations in `Backend/src/controllers/`

---

**Last Updated**: February 13, 2026  
**Collection Version**: 1.0  
**Total Requests**: 39
