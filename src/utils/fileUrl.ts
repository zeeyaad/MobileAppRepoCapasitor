import { BACKEND_ORIGIN } from "../config/backend";

/**
 * Normalize uploaded-file references to a hard-coded local URL:
 * `http://localhost:3000/uploads/...`
 *
 * Inputs we accept:
 * - Absolute: `http://10.0.0.1/uploads/...`
 * - Absolute (legacy): `http://10.0.0.1/api/uploads/...`
 * - Relative: `uploads/...` or `/uploads/...`
 * - Relative (legacy): `/api/uploads/...`
 */
export const getUploadsUrl = (f?: string | null): string => {
  if (!f) return "";
  if (f.startsWith("data:")) return f;

  // If it's an absolute URL, rewrite it to our hard-coded origin (when it points to /uploads).
  if (f.startsWith("http://") || f.startsWith("https://")) {
    try {
      const u = new URL(f);
      const pathname = u.pathname.replace(/\\/g, "/");
      if (pathname.startsWith("/api/uploads/")) return `${BACKEND_ORIGIN}${pathname.replace(/^\/api/, "")}`;
      if (pathname.startsWith("/uploads/")) return `${BACKEND_ORIGIN}${pathname}`;
      // If it's an absolute URL to a different kind of resource, keep it as-is.
      return f;
    } catch {
      // Fall through to relative handling
    }
  }

  const normalized = f.replace(/\\/g, "/");
  const clean = normalized.startsWith("/") ? normalized : `/${normalized}`;

  if (clean.startsWith("/api/uploads/")) return `${BACKEND_ORIGIN}${clean.replace(/^\/api/, "")}`;
  if (clean.startsWith("/uploads/")) return `${BACKEND_ORIGIN}${clean}`;

  // Common case: DB stores `uploads/...` without a leading slash.
  return `${BACKEND_ORIGIN}/uploads${clean}`;
};

/**
 * Backward-compatible name used across the app.
 * Returns `undefined` when the input is empty.
 */
export const resolveFileUrl = (f?: string | null): string | undefined => {
  const url = getUploadsUrl(f);
  return url ? url : undefined;
};
