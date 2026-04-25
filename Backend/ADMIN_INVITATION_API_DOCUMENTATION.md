# Admin Invitation Management API Documentation

## Overview
This document provides comprehensive documentation for the Admin Invitation Management APIs. These endpoints allow administrators to view, manage, and monitor invitation links and their participants.

---

## Table of Contents
1. [Get All Invitations](#1-get-all-invitations)
2. [Get Specific Invitation Details](#2-get-specific-invitation-details)
3. [Get Booking Participants](#3-get-booking-participants)
4. [Remove Participant from Booking](#4-remove-participant-from-booking)

---

## Authentication
All endpoints require authentication with admin/staff privileges. Include the authentication token in the request headers:
```
Authorization: Bearer <your_token_here>
```

---

## 1. Get All Invitations

### Endpoint
```
GET /api/bookings/admin/invitations
```

### Description
Retrieves a paginated list of all invitation links with booker information, participants, and booking details.

### Query Parameters
| Parameter | Type   | Required | Default | Description |
|-----------|--------|----------|---------|-------------|
| `page`    | number | No       | 1       | Page number for pagination |
| `limit`   | number | No       | 20      | Number of items per page |
| `status`  | string | No       | -       | Filter by booking status |
| `search`  | string | No       | -       | Search by booking ID |

### Status Values
- `pending_payment`
- `payment_completed`
- `in_progress`
- `completed`
- `cancelled`

### Request Example
```bash
curl -X GET "http://localhost:3000/api/bookings/admin/invitations?page=1&limit=20&status=payment_completed" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response Example (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "booking_id": "123e4567-e89b-12d3-a456-426614174000",
      "share_token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
      "share_url": "http://localhost:3000/bookings/join/a1b2c3d4...",
      "booker": {
        "name": "أحمد محمد",
        "type": "member",
        "phone": "+201001234567",
        "email": "ahmed@example.com"
      },
      "booking_date": "2025-03-15T10:00:00.000Z",
      "booking_time": {
        "start": "2025-03-15T10:00:00.000Z",
        "end": "2025-03-15T11:00:00.000Z",
        "duration_minutes": 60
      },
      "sport": {
        "name_ar": "كرة القدم",
        "name_en": "Football"
      },
      "field": {
        "name_ar": "ملعب رقم 1",
        "name_en": "Field 1"
      },
      "participants": [
        {
          "id": 1,
          "full_name": "أحمد محمد علي",
          "phone_number": "+201001234567",
          "email": "ahmed@example.com",
          "is_creator": true,
          "registered_at": "2025-03-01T08:00:00.000Z"
        },
        {
          "id": 2,
          "full_name": "محمد أحمد سعيد",
          "phone_number": "+201112345678",
          "email": "mohamed@example.com",
          "is_creator": false,
          "registered_at": "2025-03-02T09:00:00.000Z"
        }
      ],
      "stats": {
        "expected_participants": 10,
        "registered_count": 2,
        "remaining_slots": 8,
        "is_full": false
      },
      "status": "payment_completed",
      "payment_status": "completed",
      "created_at": "2025-03-01T08:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

### Response Fields
| Field | Type | Description |
|-------|------|-------------|
| `booking_id` | string | Unique booking identifier |
| `share_token` | string | 64-character invitation token |
| `share_url` | string | Full invitation URL |
| `booker` | object | Information about who created the booking |
| `booking_date` | string | ISO 8601 date/time of the booking |
| `booking_time` | object | Detailed time information |
| `sport` | object | Sport details (bilingual) |
| `field` | object | Field details (bilingual) |
| `participants` | array | List of registered participants |
| `stats` | object | Participant statistics |
| `status` | string | Current booking status |
| `payment_status` | string | Payment completion status |

---

## 2. Get Specific Invitation Details

### Endpoint
```
GET /api/bookings/:bookingId/invitation
```

### Description
Retrieves detailed information about a specific invitation, including complete booker details, all participants with their documents, and booking information.

### Path Parameters
| Parameter   | Type   | Required | Description |
|-------------|--------|----------|-------------|
| `bookingId` | string | Yes      | The booking UUID |

### Request Example
```bash
curl -X GET "http://localhost:3000/api/bookings/123e4567-e89b-12d3-a456-426614174000/invitation" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response Example (200 OK)
```json
{
  "success": true,
  "data": {
    "booking_id": "123e4567-e89b-12d3-a456-426614174000",
    "share_token": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
    "share_url": "http://localhost:3000/bookings/join/a1b2c3d4...",
    "booker": {
      "type": "member",
      "id": "456e7890-e89b-12d3-a456-426614174111",
      "name": "أحمد محمد",
      "phone": "+201001234567",
      "email": "ahmed@example.com",
      "membership_number": "2025001234"
    },
    "booking_details": {
      "sport": {
        "name_ar": "كرة القدم",
        "name_en": "Football"
      },
      "field": {
        "name_ar": "ملعب رقم 1",
        "name_en": "Field 1"
      },
      "date": "2025-03-15T10:00:00.000Z",
      "start_time": "2025-03-15T10:00:00.000Z",
      "end_time": "2025-03-15T11:00:00.000Z",
      "duration_minutes": 60,
      "status": "payment_completed",
      "price": 150.00,
      "payment_reference": "paymob_123456789",
      "payment_completed_at": "2025-03-01T09:00:00.000Z"
    },
    "participants": [
      {
        "id": 1,
        "full_name": "أحمد محمد علي",
        "phone_number": "+201001234567",
        "national_id": "29001011234567",
        "email": "ahmed@example.com",
        "national_id_front": "https://cloudinary.com/images/front_123.jpg",
        "national_id_back": "https://cloudinary.com/images/back_123.jpg",
        "is_creator": true,
        "registered_at": "2025-03-01T08:00:00.000Z"
      }
    ],
    "stats": {
      "expected_participants": 10,
      "registered_count": 1,
      "remaining_slots": 9,
      "is_full": false
    },
    "created_at": "2025-03-01T08:00:00.000Z",
    "updated_at": "2025-03-01T09:00:00.000Z"
  }
}
```

### Error Responses
```json
{
  "success": false,
  "error": "Booking not found"
}
```

---

## 3. Get Booking Participants

### Endpoint
```
GET /api/bookings/:bookingId/participants
```

### Description
Retrieves all participants for a specific booking. Similar to invitation details but focused on participant list.

### Path Parameters
| Parameter   | Type   | Required | Description |
|-------------|--------|----------|-------------|
| `bookingId` | string | Yes      | The booking UUID |

### Request Example
```bash
curl -X GET "http://localhost:3000/api/bookings/123e4567-e89b-12d3-a456-426614174000/participants" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Response Example (200 OK)
```json
{
  "success": true,
  "data": {
    "booking_id": "123e4567-e89b-12d3-a456-426614174000",
    "booker": {
      "id": "456e7890-e89b-12d3-a456-426614174111",
      "name": "أحمد محمد",
      "type": "member",
      "phone": "+201001234567",
      "email": "ahmed@example.com"
    },
    "booking_details": {
      "sport_name_ar": "كرة القدم",
      "sport_name_en": "Football",
      "field_name_ar": "ملعب رقم 1",
      "field_name_en": "Field 1",
      "start_time": "2025-03-15T10:00:00.000Z",
      "end_time": "2025-03-15T11:00:00.000Z",
      "status": "payment_completed"
    },
    "participants": [
      {
        "id": 1,
        "full_name": "أحمد محمد علي",
        "phone_number": "+201001234567",
        "national_id": "29001011234567",
        "email": "ahmed@example.com",
        "national_id_front": "https://cloudinary.com/images/front_123.jpg",
        "national_id_back": "https://cloudinary.com/images/back_123.jpg",
        "is_creator": true,
        "registered_at": "2025-03-01T08:00:00.000Z"
      }
    ],
    "stats": {
      "expected_participants": 10,
      "registered_count": 1,
      "remaining_slots": 9,
      "is_full": false
    }
  }
}
```

---

## 4. Remove Participant from Booking

### Endpoint
```
DELETE /api/bookings/:bookingId/participants/:participantId
```

### Description
Removes a specific participant from a booking. Cannot remove the booking creator - the entire booking must be cancelled instead.

### Path Parameters
| Parameter       | Type   | Required | Description |
|-----------------|--------|----------|-------------|
| `bookingId`     | string | Yes      | The booking UUID |
| `participantId` | number | Yes      | The participant ID |

### Request Body (Optional)
```json
{
  "reason": "Participant requested removal"
}
```

### Request Example
```bash
curl -X DELETE "http://localhost:3000/api/bookings/123e4567-e89b-12d3-a456-426614174000/participants/2" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Duplicate registration"}'
```

### Response Example (200 OK)
```json
{
  "success": true,
  "message": "Participant removed successfully",
  "data": {
    "id": 2,
    "full_name": "محمد أحمد سعيد",
    "phone_number": "+201112345678",
    "email": "mohamed@example.com",
    "removed_at": "2025-03-10T14:30:00.000Z",
    "removed_reason": "Duplicate registration"
  }
}
```

### Error Responses

**404 - Participant Not Found**
```json
{
  "success": false,
  "error": "Participant not found in this booking"
}
```

**400 - Cannot Remove Creator**
```json
{
  "success": false,
  "error": "Cannot remove the booking creator. Cancel the booking instead."
}
```

---

## Use Cases

### Use Case 1: Admin Dashboard - View All Invitations
An admin wants to see all active invitation links:
1. Call `GET /api/bookings/admin/invitations?status=payment_completed`
2. Display list with booker names, dates, and participant counts
3. Click on an invitation to see details

### Use Case 2: Monitor Invitation Participation
Check how many people have joined a specific booking:
1. Call `GET /api/bookings/:bookingId/invitation`
2. Review `stats.registered_count` vs `stats.expected_participants`
3. View participant list with registration timestamps

### Use Case 3: Remove Duplicate or Invalid Participant
An admin notices a duplicate registration:
1. Call `GET /api/bookings/:bookingId/participants` to see all participants
2. Identify the duplicate (e.g., participant ID 5)
3. Call `DELETE /api/bookings/:bookingId/participants/5` with reason
4. Participant is removed, slot becomes available again

### Use Case 4: Search for Specific Booking
Admin needs to find a booking by ID:
1. Call `GET /api/bookings/admin/invitations?search=123e4567`
2. Filter results by status if needed
3. View matching bookings

---

## Important Notes

### Security Considerations
- All endpoints require authentication
- Only admins/staff can access these endpoints
- Participant national ID photos are stored in Cloudinary
- Share tokens are 64 characters long and cryptographically secure

### Business Rules
1. **Cannot remove booking creator**: The creator (is_creator: true) cannot be removed. To cancel their participation, cancel the entire booking.
2. **Capacity tracking**: When a participant is removed, the slot becomes available again
3. **Participant limit**: `expected_participants` is set to field's `max_capacity` on booking creation
4. **Status flow**: `pending_payment` → `payment_completed` → `in_progress` → `completed`

### Data Retention
- Participant data includes national ID photos (required for field access)
- When a participant is removed, their data is deleted from the database
- Consider implementing soft deletes if you need an audit trail

---

## Testing Guide

### Test Scenario 1: Pagination
```bash
# Get first page
GET /api/bookings/admin/invitations?page=1&limit=5

# Get second page
GET /api/bookings/admin/invitations?page=2&limit=5
```

### Test Scenario 2: Filtering
```bash
# Only completed bookings
GET /api/bookings/admin/invitations?status=completed

# Search by ID
GET /api/bookings/admin/invitations?search=123e4567
```

### Test Scenario 3: Full Workflow
```bash
# 1. View all invitations
GET /api/bookings/admin/invitations

# 2. Get detailed info for specific booking
GET /api/bookings/123e4567-e89b-12d3-a456-426614174000/invitation

# 3. Remove a participant
DELETE /api/bookings/123e4567-e89b-12d3-a456-426614174000/participants/2

# 4. Verify removal
GET /api/bookings/123e4567-e89b-12d3-a456-426614174000/participants
```

---

## Integration Examples

### React/TypeScript Frontend Example
```typescript
interface InvitationListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

async function fetchAllInvitations(params: InvitationListParams) {
  const queryString = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v != null)
  ).toString();
  
  const response = await fetch(
    `/api/bookings/admin/invitations?${queryString}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }
  );
  
  return await response.json();
}

async function removeParticipant(bookingId: string, participantId: number, reason?: string) {
  const response = await fetch(
    `/api/bookings/${bookingId}/participants/${participantId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason })
    }
  );
  
  return await response.json();
}
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (e.g., trying to remove creator)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (not admin/staff)
- `404` - Not Found (booking or participant doesn't exist)
- `500` - Internal Server Error

---

## Change Log

### Version 1.0.0 (2025-03-10)
- Initial release
- Added `GET /api/bookings/admin/invitations`
- Added `GET /api/bookings/:bookingId/invitation`
- Added `DELETE /api/bookings/:bookingId/participants/:participantId`
- Reused existing `GET /api/bookings/:bookingId/participants`

---

## Support

For questions or issues, please contact the development team or create an issue in the project repository.
