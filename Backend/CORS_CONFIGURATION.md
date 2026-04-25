# CORS Configuration Guide

## Overview

This backend uses a flexible CORS (Cross-Origin Resource Sharing) configuration that:
- ✅ Supports multiple frontend origins (localhost and LAN IP)
- ✅ Allows credentials (cookies, authorization headers)
- ✅ Is secure and production-ready (no wildcard origins)
- ✅ Easily extensible for future origins

## Current Setup

### Default Allowed Origins (Development)
When `ALLOWED_ORIGINS` is not set in `.env`, the following origins are automatically allowed:

```
- http://localhost:3000
- http://localhost:5173
- http://localhost
- http://10.100.104.157:8080
- http://10.100.104.157
- http://127.0.0.1:3000
- http://127.0.0.1:5173
```

### Environment-Based Behavior

**Development (`NODE_ENV=development`):**
- Uses default origins (localhost + LAN IP)
- Allows requests from Postman Desktop (no origin header)
- Good for local testing

**Production (`NODE_ENV=production`):**
- Uses ONLY explicitly configured origins from `ALLOWED_ORIGINS`
- No default origins are used
- More secure and controlled

## How to Add New Origins

### For Local Development
Simply access the backend from your new origin. The default origins in development cover:
- `localhost` (port 3000, 5173)
- `10.100.104.157` (LAN IP, port 8080)

### For Production or Custom Origins
Set the `ALLOWED_ORIGINS` environment variable:

```env
# Single origin
ALLOWED_ORIGINS=https://yourdomain.com

# Multiple origins (comma-separated, no spaces)
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://app.yourdomain.com

# Mixed protocols (if needed)
ALLOWED_ORIGINS=http://10.100.104.157:8080,https://yourdomain.com
```

### Examples

**Local Development:**
```env
ALLOWED_ORIGINS=
# Uses defaults: localhost:3000, localhost:5173, 10.100.104.157:8080
```

**Production:**
```env
ALLOWED_ORIGINS=https://helwan-club.com,https://app.helwan-club.com,https://admin.helwan-club.com
```

**Staging + Production:**
```env
ALLOWED_ORIGINS=https://staging.helwan-club.com,https://helwan-club.com,https://app.helwan-club.com
```

## CORS Features

### Allowed Methods
- `GET` - Retrieve data
- `POST` - Create data
- `PUT` - Update data
- `DELETE` - Remove data
- `PATCH` - Partial update
- `OPTIONS` - CORS preflight

### Allowed Headers
- `Content-Type` - JSON payloads
- `Authorization` - Bearer tokens, API keys
- `X-Requested-With` - AJAX request identification

### Exposed Headers
- `Content-Range` - Pagination info
- `X-Content-Range` - Custom pagination

### Other Settings
- **Credentials:** `true` - Allows cookies and auth headers
- **Max Age:** 86400 seconds (24 hours) - Caches preflight requests

## Troubleshooting CORS Errors

### Error: "CORS blocked request from: [origin]"

**Cause:** The origin making the request is not in the allowed list

**Solution:**
1. Check the browser console to see which origin is blocked
2. Add that origin to `ALLOWED_ORIGINS` in `.env`
3. Restart the backend server
4. Clear browser cache (Ctrl+Shift+Delete)

### Error: "No 'Access-Control-Allow-Origin' header"

**Cause:** Backend is not running or CORS middleware isn't loaded

**Solution:**
1. Verify backend is running: `npm run dev`
2. Check if the endpoint exists: `curl http://localhost:3000/api/memberships`
3. Restart backend after `.env` changes

### Postman Shows CORS Error

**Cause:** Using Postman Web (browser version)

**Solution:**
- Download and use **Postman Desktop App** instead
- Postman Desktop doesn't enforce CORS

### Frontend Shows "Mixed Content" Error

**Cause:** Frontend is HTTPS but trying to access HTTP backend

**Solution:**
1. Use HTTPS for both frontend and backend
2. Or disable HTTPS requirement in development browser settings
3. Check `VITE_BACKEND_URL` in frontend `.env.local`

## Code Reference

### CORS Middleware in `Backend/src/index.ts`

```typescript
// CORS Configuration with environment-based origins
const allowedOrigins: string[] = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : getDefaultOrigins();

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked request from: ${origin}`);
      callback(new Error(`CORS Error: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
```

## Frontend Configuration

### Development (.env.local)
```env
VITE_BACKEND_URL=http://10.100.104.157:3000/api
```

### Production (.env.production)
```env
VITE_BACKEND_URL=https://yourdomain.com/api
```

## Testing CORS Configuration

### Using curl (local development)
```bash
curl -X GET "http://localhost:3000/api/memberships" \
  -H "Content-Type: application/json"
```

### Using PowerShell
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/memberships" -Method GET
```

### Using Postman Desktop
1. Download [Postman Desktop App](https://www.postman.com/downloads/)
2. Create new request: `GET http://localhost:3000/api/memberships`
3. Send - no CORS errors

### Using fetch (browser console)
```javascript
fetch('http://10.100.104.157:3000/api/memberships', {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(data => console.log(data));
```

## Security Considerations

✅ **What's Good:**
- No wildcard origins (`*`)
- Explicit origin validation
- Credentials validation per origin
- Environment-based configuration
- Separate dev/production configs

⚠️ **What to Remember:**
- Always use HTTPS in production
- Never use `127.0.0.1:5173` or `localhost:5173` in production
- Regularly audit allowed origins
- Keep ALLOWED_ORIGINS updated when adding new frontends

## Support

For issues with CORS configuration:
1. Check the backend logs: Look for `✅ CORS Allowed Origins:` and `⚠️  CORS blocked request from:`
2. Verify `.env` file has correct `ALLOWED_ORIGINS`
3. Ensure backend was restarted after `.env` changes
4. Check that frontend is using correct `VITE_BACKEND_URL`
