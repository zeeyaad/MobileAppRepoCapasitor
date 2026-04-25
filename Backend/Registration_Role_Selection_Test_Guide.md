# Registration - Role Selection (Test Guide)

This guide tests that **the user must choose a role before basic registration**.

The endpoint `POST /api/register/basic` now requires:
- `role`: `member` or `team_member`

## Prerequisites

- Backend running on: `http://localhost:3000`
- Registration base route: `POST /api/register/basic`

## 1) Positive Test: Register as `member`

### Request

```bash
curl -X POST "http://localhost:3000/api/register/basic" \
  -H "Content-Type: application/json" \
  -d "{\
    \"role\": \"member\",\
    \"email\": \"member1@test.com\",\
    \"password\": \"Passw0rd!\",\
    \"first_name_en\": \"Ahmed\",\
    \"first_name_ar\": \"أحمد\",\
    \"last_name_en\": \"Ali\",\
    \"last_name_ar\": \"علي\",\
    \"phone\": \"01000000000\",\
    \"gender\": \"male\",\
    \"nationality\": \"Egyptian\",\
    \"birthdate\": \"1999-01-01\",\
    \"national_id\": \"11111111111111\"\
  }"
```

### Expected

- Status: `201`
- Response contains:
  - `data.account_id`
  - `data.member_id`

## 2) Positive Test: Register as `team_member`

### Request

```bash
curl -X POST "http://localhost:3000/api/register/basic" \
  -H "Content-Type: application/json" \
  -d "{\
    \"role\": \"team_member\",\
    \"email\": \"team1@test.com\",\
    \"password\": \"Passw0rd!\",\
    \"first_name_en\": \"Sara\",\
    \"first_name_ar\": \"سارة\",\
    \"last_name_en\": \"Hassan\",\
    \"last_name_ar\": \"حسن\",\
    \"phone\": \"01000000001\",\
    \"gender\": \"female\",\
    \"nationality\": \"Egyptian\",\
    \"birthdate\": \"2000-02-02\",\
    \"national_id\": \"22222222222222\"\
  }"
```

### Expected

- Status: `201`
- Response contains:
  - `data.account_id`
  - `data.member_id`

### Expected (DB behavior)

- `accounts.role` should be saved as `team_member`
- `members.member_type_id`:
  - If `member_types` contains code `TEAM_MEMBER` (or `team_member`), it will use that ID.
  - Otherwise it falls back to `1` (existing default).

## 3) Negative Test: Missing `role`

### Request

```bash
curl -X POST "http://localhost:3000/api/register/basic" \
  -H "Content-Type: application/json" \
  -d "{\
    \"email\": \"missingrole@test.com\",\
    \"password\": \"Passw0rd!\",\
    \"first_name_en\": \"NoRole\",\
    \"national_id\": \"33333333333333\"\
  }"
```

### Expected

- Status: `400`
- Message contains: `Missing required fields (role, email, password, first_name_en, national_id are mandatory)`

## 4) Negative Test: Invalid `role`

### Request

```bash
curl -X POST "http://localhost:3000/api/register/basic" \
  -H "Content-Type: application/json" \
  -d "{\
    \"role\": \"staff\",\
    \"email\": \"invalidrole@test.com\",\
    \"password\": \"Passw0rd!\",\
    \"first_name_en\": \"Invalid\",\
    \"national_id\": \"44444444444444\"\
  }"
```

### Expected

- Status: `400`
- Message contains: `Invalid role. Allowed roles are: member, team_member`

## Notes

- The endpoint path depends on how you mount routes. In this repo, registration routes are defined in `src/routes/RegistrationRoutes.ts` and the basic route is `/basic` within that router.
- If your app mounts it under `/api/register`, then the full path is: `POST /api/register/basic`.
