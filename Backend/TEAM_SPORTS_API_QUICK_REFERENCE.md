# Team Members & Sports API Quick Reference (Rows 72-106)

## 📚 Quick Links

- [Endpoint Summary](#endpoint-summary)
- [Authentication](#authentication)
- [Team Members Endpoints](#team-members-endpoints-rows-72-88)
- [Sports Endpoints](#sports-endpoints-rows-89-106)
- [Common Patterns](#common-patterns)
- [Error Codes](#error-codes)
- [Troubleshooting](#troubleshooting)

---

## Endpoint Summary

**Team Members (Rows 72-88):** 17 endpoints  
**Sports (Rows 89-106):** 18 endpoints  
**Total:** 35 endpoints with privilege-based authorization

---

## Authentication

### JWT Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Payload
```json
{
  "staff_id": 1,
  "email": "admin@helwan.org",
  "role": "admin",
  "privileges": [72, 73, 74, ...],
  "iat": 1707495600,
  "exp": 1707582000
}
```

### Generate Token (Login)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@helwan.org",
    "password": "password123"
  }'
```

---

## Team Members Endpoints (Rows 72-88)

### View Operations

| Row | Endpoint | Method | Privilege | Description |
|-----|----------|--------|-----------|-------------|
| 72 | `/api/team-members` | GET | VIEW_TEAM_MEMBERS | List all team members |
| 73 | `/api/team-members/:id` | GET | VIEW_TEAM_MEMBERS | Get specific member |

### CRUD Operations

| Row | Endpoint | Method | Privilege | Description |
|-----|----------|--------|-----------|-------------|
| 74 | `/api/team-members` | POST | ADD_TEAM_MEMBER | Create team member |
| 75 | `/api/team-members/:id` | PUT | UPDATE_TEAM_MEMBER | Update member details |
| 76 | `/api/team-members/:id/status` | POST | CHANGE_TEAM_MEMBER_STATUS | Change member status |
| 77 | `/api/team-members/:id/block` | POST | MANAGE_TEAM_MEMBER_BLOCK | Block/unblock member |

### Role Management

| Row | Endpoint | Method | Privilege | Description |
|-----|----------|--------|-----------|-------------|
| 78 | `/api/team-members/:id/assign-role` | POST | ASSIGN_TEAM_ROLE | Assign role to member |
| 79 | `/api/team-members/:id/role` | PUT | CHANGE_TEAM_ROLE | Change member role |

### History & Documents

| Row | Endpoint | Method | Privilege | Description |
|-----|----------|--------|-----------|-------------|
| 80 | `/api/team-members/:id/history` | GET | VIEW_TEAM_HISTORY | View activity history |
| 81 | `/api/team-members/:id/documents` | POST | UPLOAD_TEAM_MEMBER_DOCUMENT | Upload document |
| 82 | `/api/team-members/:id/documents/:docId` | DELETE | DELETE_TEAM_MEMBER_DOCUMENT | Delete document |
| 83 | `/api/team-members/:id/documents/:docId/print` | GET | PRINT_TEAM_MEMBER_DOCUMENT | Print document |
| 84 | `/api/team-members/:id/card/print` | GET | PRINT_TEAM_MEMBER_CARD | Print member card |

### Forms

| Row | Endpoint | Method | Privilege | Description |
|-----|----------|--------|-----------|-------------|
| 85 | `/api/team-members/:id/forms` | GET | VIEW_TEAM_MEMBER_FORMS | List forms |
| 86 | `/api/team-members/:id/forms` | POST | SUBMIT_TEAM_MEMBER_FORM | Submit form |
| 87 | `/api/team-members/:id/forms/:formId` | PUT | UPDATE_TEAM_MEMBER_FORM | Update form |
| 88 | `/api/team-members/:id/forms/:formId` | DELETE | DELETE_TEAM_MEMBER_FORM | Delete form |

---

## Sports Endpoints (Rows 89-106)

### Sports Management

| Row | Endpoint | Method | Privilege | Description |
|-----|----------|--------|-----------|-------------|
| 89 | `/api/sports` | GET | VIEW_SPORTS | List all sports |
| 90 | `/api/sports/:id` | GET | VIEW_SPORTS | Get specific sport |
| 91 | `/api/sports` | POST | CREATE_SPORT | Create sport |
| 92 | `/api/sports/:id` | PUT | UPDATE_SPORT | Update sport |
| 93 | `/api/sports/:id` | DELETE | DELETE_SPORT | Delete sport |

### Sport Assignment

| Row | Endpoint | Method | Privilege | Description |
|-----|----------|--------|-----------|-------------|
| 94 | `/api/sports/:sportId/members` | POST | ASSIGN_SPORT_TO_MEMBER | Assign to member |
| 95 | `/api/sports/:sportId/members/:memberId` | DELETE | REMOVE_SPORT_FROM_MEMBER | Remove from member |
| 96 | `/api/sports/:sportId/team-members` | POST | ASSIGN_SPORT_TO_TEAM_MEMBER | Assign to team member |
| 97 | `/api/sports/:sportId/team-members/:teamMemberId` | DELETE | REMOVE_SPORT_FROM_TEAM_MEMBER | Remove from team member |

### Team Management

| Row | Endpoint | Method | Privilege | Description |
|-----|----------|--------|-----------|-------------|
| 98 | `/api/teams` | POST | CREATE_TEAM | Create team |
| 99 | `/api/teams/:id` | PUT | UPDATE_TEAM | Update team |
| 100 | `/api/teams/:id` | DELETE | DELETE_TEAM | Delete team |
| 101 | `/api/teams/:teamId/members` | POST | ASSIGN_MEMBER_TO_TEAM | Add member to team |
| 102 | `/api/teams/:teamId/members/:memberId` | DELETE | REMOVE_MEMBER_FROM_TEAM | Remove member from team |

### Match & Pricing

| Row | Endpoint | Method | Privilege | Description |
|-----|----------|--------|-----------|-------------|
| 103 | `/api/matches/schedule` | POST | SCHEDULE_MATCH | Schedule match |
| 104 | `/api/sports/:sportId/pricing` | GET | VIEW_SPORT_PRICING | Get pricing |
| 105 | `/api/sports/:sportId/pricing` | POST | CREATE_SPORT_PRICING | Create pricing |
| 106 | `/api/sports/:sportId/pricing/:pricingId` | PUT | UPDATE_SPORT_PRICING | Update pricing |
| 107 | `/api/sports/:sportId/pricing/:pricingId` | DELETE | DELETE_SPORT_PRICING | Delete pricing |

---

## Common Patterns

### GET Single Resource
```bash
curl http://localhost:3000/api/team-members/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### POST Create Resource
```bash
curl -X POST http://localhost:3000/api/team-members \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name_en": "Ahmed Mohamed",
    "name_ar": "أحمد محمد",
    "email": "ahmed@example.com",
    "role_id": 1
  }'
```

### PUT Update Resource
```bash
curl -X PUT http://localhost:3000/api/team-members/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name_en": "Ahmed M.",
    "email": "ahmed.new@example.com"
  }'
```

### DELETE Remove Resource
```bash
curl -X DELETE http://localhost:3000/api/team-members/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### POST with Special Action
```bash
curl -X POST http://localhost:3000/api/team-members/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "suspended"
  }'
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": 1,
    "name_en": "Ahmed Mohamed",
    "email": "ahmed@example.com"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (optional)"
}
```

---

## Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Check required fields and formats |
| 401 | Unauthorized | Invalid or missing token |
| 403 | Forbidden | Missing required privilege |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry or state conflict |
| 500 | Server Error | Contact support |

---

## Troubleshooting

### Issue: 401 Unauthorized

**Cause:** Missing or invalid token  
**Solution:**
```bash
# 1. Check if token is in request
curl -v http://localhost:3000/api/team-members \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Verify token is not expired
# 3. Get new token from login endpoint
```

### Issue: 403 Forbidden

**Cause:** User lacks required privilege  
**Solution:**
```bash
# 1. Check required privilege in endpoint docs
# 2. Verify user has privilege in database
# 3. Request admin to add privilege
# SELECT privileges FROM account WHERE staff_id = X;
```

### Issue: 400 Bad Request

**Cause:** Invalid input data  
**Solution:**
```bash
# 1. Check required fields
# 2. Verify data types (string, number, boolean)
# 3. Validate field lengths
# 4. Check enum values

# Valid status values: active, suspended, banned, expired, cancelled
# Valid currencies: EGP, USD, EUR
```

### Issue: 404 Not Found

**Cause:** Resource doesn't exist  
**Solution:**
```bash
# 1. Verify ID is correct
curl http://localhost:3000/api/team-members \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Check if resource was deleted
```

### Issue: 409 Conflict

**Cause:** Duplicate or invalid state  
**Solution:**
```bash
# 1. Check if email already exists
# 2. Verify member not already in team
# 3. Verify sport not already assigned
```

---

## Common Request/Response Examples

### Create Team Member
**Request:**
```bash
curl -X POST http://localhost:3000/api/team-members \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name_en": "Hassan Ali",
    "name_ar": "حسن علي",
    "email": "hassan@club.org",
    "role_id": 1,
    "team_id": 1
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Team member added successfully",
  "data": {
    "id": 5,
    "name_en": "Hassan Ali",
    "name_ar": "حسن علي",
    "email": "hassan@club.org",
    "role_id": 1,
    "created_at": "2026-02-10T10:30:00Z"
  }
}
```

### Create Sport
**Request:**
```bash
curl -X POST http://localhost:3000/api/sports \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name_en": "Football",
    "name_ar": "كرة القدم",
    "code": "FB001"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Sport created successfully",
  "data": {
    "id": 10,
    "name_en": "Football",
    "name_ar": "كرة القدم",
    "code": "FB001",
    "created_at": "2026-02-10T10:35:00Z"
  }
}
```

### Schedule Match
**Request:**
```bash
curl -X POST http://localhost:3000/api/matches/schedule \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "team_id": 1,
    "opponent": "Cairo Sports Club",
    "match_date": "2026-03-15T19:00:00Z",
    "location": "Main Stadium"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Match scheduled successfully",
  "data": {
    "id": 42,
    "team_id": 1,
    "opponent": "Cairo Sports Club",
    "match_date": "2026-03-15T19:00:00Z",
    "location": "Main Stadium",
    "status": "scheduled",
    "created_at": "2026-02-10T10:40:00Z"
  }
}
```

---

## Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# Database (Supabase)
DATABASE_URL=postgresql://postgres:password@host:5432/postgres

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRY=24h

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
```

---

## Testing Tools

### Using cURL
```bash
# Set token
TOKEN="your_jwt_token_here"

# GET request
curl http://localhost:3000/api/team-members \
  -H "Authorization: Bearer $TOKEN"

# POST request
curl -X POST http://localhost:3000/api/team-members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name_en":"Test","name_ar":"اختبار"}'
```

### Using Postman
1. Create new collection "Team Sports API"
2. Set variable: `token` = JWT token from login
3. Set variable: `baseUrl` = `http://localhost:3000/api`
4. Create request: `GET {{baseUrl}}/team-members` with header `Authorization: Bearer {{token}}`
5. Use pre-request script to refresh token if needed

### Using VS Code REST Client
```http
@baseUrl = http://localhost:3000/api
@token = YOUR_JWT_TOKEN

### Get all team members
GET {{baseUrl}}/team-members
Authorization: Bearer {{token}}

### Create team member
POST {{baseUrl}}/team-members
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name_en": "Test User",
  "name_ar": "مستخدم اختبار",
  "email": "test@example.com"
}
```

---

## Performance Tips

1. **Use pagination for list endpoints**
   ```bash
   curl "http://localhost:3000/api/team-members?page=1&limit=20" \
     -H "Authorization: Bearer TOKEN"
   ```

2. **Cache responses when possible**
   - Store frequently accessed data locally
   - Refresh every 5-10 minutes

3. **Use specific field selection**
   - Only request fields you need
   - Reduces payload size

4. **Batch operations**
   - Group multiple updates together
   - Reduce API calls

---

## Support & Resources

- **API Documentation:** `TEAM_SPORTS_API_TESTING.md`
- **Implementation Details:** `TEAM_SPORTS_API_IMPLEMENTATION.md`
- **Deployment Checklist:** `TEAM_SPORTS_API_DEPLOYMENT_CHECKLIST.md`
- **Issue Template:** See error codes section above

---

**Last Updated:** February 10, 2026  
**Total Endpoints:** 35  
**Authorization:** JWT with Privilege Checking
