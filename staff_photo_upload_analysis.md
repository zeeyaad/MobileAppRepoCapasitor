# 📸 Media Gallery Upload Failure — Technical Analysis Report

Based on tracing the logic from the frontend `MediaGalleryDashboard.tsx` to the backend routes, middleware, and IIS configuration, I have identified exactly why the "Staff photo upload" is failing for news posts.

---

## 🔍 The Core Problems

The failure is caused by a chain of limit restrictions and unhandled errors between your IIS Server, Express limit configurations, and Multer upload middleware.

### 1. The Photo Size is Exceeding `Multer`'s Strict 10MB Limit
In `Backend/src/middleware/upload.ts` (Line 46), the file size limit is strictly locked to **10MB**:
```typescript
export const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: fileFilter,
});
```
* **Why it fails:** Modern smartphones (e.g., iPhones, high-end Samsungs) or cameras used by staff take high-resolution photos that easily exceed 10MB per image. If a single file exceeds this size, Multer immediately rejects the upload.

### 2. Missing `multerErrorHandler` (Silent 500 HTML Crash)
In `Backend/src/middleware/upload.ts`, you have beautifully written a custom error handler (`multerErrorHandler`) to return clean JSON errors describing why the upload failed (e.g., "File is too large"). 
* **Why it fails:** It is **NEVER imported or used** in your `MediaPostRoutes.ts`! 
When Multer rejects the 10MB photo, it throws an unhandled Node error. Express catches this and sends back a native **HTML 500 error page**. The frontend expects a JSON response, fails to parse the HTML, and the `catch` block in `MediaGalleryDashboard.tsx` triggers `alert('فشل في حفظ المنشور');`.

### 3. IIS Default Request Limit (28.6 MB)
Your backend is running on a specific IP using IIS (Internet Information Services) as a reverse proxy, as seen in your `web.config`.
* **Why it fails:** IIS has a default `maxAllowedContentLength` of **30,000,000 bytes (~28.6 MB)**. If a staff member uploads multiple photos at once (e.g., 4 photos averaging 8MB = 32MB), IIS will instantly block the request with a `404.13 Request Entity Too Large` error before it even reaches your Node.js backend.

---

## 🛠️ How to Fix It (The Solution)

To fix this so it never happens again, you need to apply the following 4 adjustments across your files:

### Fix 1: Increase Multer Limits
**File:** `Backend/src/middleware/upload.ts` — Line 46
Change the `fileSize` from `10MB` to `50MB` (or larger depending on your needs), and allow more files.
```typescript
export const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 50 * 1024 * 1024, // Increased to 50MB per file
        files: 20 // Optionally increase max file count
    },
    fileFilter: fileFilter,
});
```

### Fix 2: Connect the Multer Error Handler
**File:** `Backend/src/routes/MediaPostRoutes.ts` 
Import the `multerErrorHandler` and place it immediately after `upload.array()` so the frontend gets actual error messages instead of a crash.
```typescript
import { upload, multerErrorHandler } from '../middleware/upload';

// Inside router.post / router.put
router.post(
    '/',
    authenticate,
    authorizeMediaWrite(['media.create', 'CREATE_MEDIA_POST']),
    upload.array('images', 20),
    multerErrorHandler,  // 👈 ADD THIS HERE
    MediaPostController.createPost
);
```

### Fix 3: Increase the IIS Limits
**File:** `web.config`
Add the `<security>` block inside `<system.webServer>` to allow large file payloads (e.g., 100MB = `104857600` bytes).
```xml
<system.webServer>
  <security>
    <requestFiltering>
      <requestLimits maxAllowedContentLength="104857600" />
    </requestFiltering>
  </security>
  <!-- Keep your existing proxy and rewrite rules -->
```

### Fix 4: Increase Express Global Payload Limits
**File:** `Backend/src/index.ts` — Line 138
Update your global JSON and URL-encoded limits to match your new max sizes so Express router doesn't choke on the large multi-part requests.
```typescript
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
```

---

### Side Note (Minor Bug Found): Auditing System Whisper
While analyzing this logic, I found a minor non-breaking bug in `MediaPostController.ts` inside `logAction()`.
```typescript
const staffRepo = AppDataSource.getRepository('Staff');
```
Using the string `'Staff'` can cause TypeORM to throw an entity missing error, silently failing your audit logs. Changing it to use the class reference `AppDataSource.getRepository(Staff)` (and importing it) will ensure your logs save correctly.
