# Director Of Financial Affairs - Sport Pricing (Test Guide)

This guide tests that **DirectorOfFinancialAffairs** can:
- Create a new sport with a `price`
- Update the `price` of an existing sport

It also includes negative tests to ensure other roles (like `SPORT_SPECIALIST`) cannot set/update prices.

## Prerequisites

- Backend running on: `http://localhost:3000`
- You can login and obtain a JWT token from:
  - `POST /api/auth/login`
- All requests below require:
  - Header: `Authorization: Bearer <TOKEN>`

## 1) Login to get JWT token

### 1.1 Login (email + password)

Use the credentials you created for the financial director account.

```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"DIRECTOR_EMAIL_HERE\",\"password\":\"DIRECTOR_PASSWORD_HERE\"}"
```

Copy the `token` from the response.

Set it locally (PowerShell):

```powershell
$TOKEN = "PASTE_TOKEN_HERE"
```

## 2) Create a new sport WITH price (DirectorOfFinancialAffairs)

### Endpoint

- `POST /api/sports`

### Request

```powershell
curl -X POST "http://localhost:3000/api/sports" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d "{`
    \"name_en\": \"Financial Sport\",`
    \"name_ar\": \"رياضة الشؤون المالية\",`
    \"description_en\": \"Created by DirectorOfFinancialAffairs with price\",`
    \"description_ar\": \"تم إنشاؤها بواسطة مدير الشؤون المالية مع سعر\",`
    \"price\": 1500,`
    \"max_participants\": 25`
  }"
```

### Expected

- `201 Created`
- Response `data.price` is `1500`
- Response `success: true`

Note: Sport status might be:
- `active` (if created by Sport Manager)
- `pending` (for other roles)

## 3) Get all sports (confirm the sport exists)

```powershell
curl -X GET "http://localhost:3000/api/sports" `
  -H "Authorization: Bearer $TOKEN"
```

From the response, copy the created sport `id`.

Set it (PowerShell):

```powershell
$SPORT_ID = 0  # replace with the created sport id
```

## 4) Update existing sport price (DirectorOfFinancialAffairs)

### Endpoint

- `PUT /api/sports/:id`

### Request (update price only)

```powershell
curl -X PUT "http://localhost:3000/api/sports/$SPORT_ID" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d "{ \"price\": 2000 }"
```

### Expected

- `200 OK`
- Response `data.price` is `2000`

## 5) Negative test: DirectorOfFinancialAffairs cannot update non-price fields

```powershell
curl -X PUT "http://localhost:3000/api/sports/$SPORT_ID" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $TOKEN" `
  -d "{ \"name_en\": \"Not allowed\" }"
```

### Expected

- `400`
- Error message similar to: `Director of Financial Affairs can only update the price`

## 6) Negative test: Specialist cannot set price on create

If you have the specialist test account, login as specialist and try:

```powershell
$SPECIALIST_TOKEN = "PASTE_SPECIALIST_TOKEN_HERE"

curl -X POST "http://localhost:3000/api/sports" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $SPECIALIST_TOKEN" `
  -d "{`
    \"name_en\": \"Invalid Specialist Priced Sport\",`
    \"name_ar\": \"رياضة بسعر غير مسموح\",`
    \"price\": 999`
  }"
```

### Expected

- `400` (or `403` depending on your error handling)
- Error message similar to: `Sport Activity Specialists cannot set prices`

## 7) Negative test: Specialist cannot update price

```powershell
curl -X PUT "http://localhost:3000/api/sports/$SPORT_ID" `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer $SPECIALIST_TOKEN" `
  -d "{ \"price\": 999 }"
```

### Expected

- `400` (or `403`)
- Error message similar to: `Only Sport Activity Manager or Director of Financial Affairs can update prices`

## Notes / Troubleshooting

- If you get `401 Unauthorized`:
  - Check token exists and starts with `Bearer `
- If you get `403 Forbidden` or `400` permission error:
  - Confirm the `staff_types.code` for your financial director role matches one of:
    - `DIRECTOR_OF_FINANCIAL_AFFAIRS`
    - `DIRECTOR_OF_FINANCIALAFFAIRS`
    - `DIRECTOR_FINANCIAL_AFFAIRS`
    - `FINANCIAL_DIRECTOR`
