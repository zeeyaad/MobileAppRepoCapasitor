import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";
import { ROLE_PRIVILEGES, type Role, type UserToken } from "../types/auth";
import { resolveFileUrl } from "../utils/fileUrl";

interface AuthContextType {
  user: UserToken | null;
  token: string | null;
  login: (userData: any) => void;
  logout: () => void;
  hasPrivilege: (privilege: string) => boolean;
  hasAnyPrivilege: (privileges: string[]) => boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const normalizePrivilegeCode = (value: unknown): string => String(value || "").trim().toUpperCase();

function normalizeRole(rawRole: unknown): Role {
  const normalizedRole = normalizePrivilegeCode(rawRole);
  if (normalizedRole in ROLE_PRIVILEGES) {
    return normalizedRole as Role;
  }
  return "SUPPORT";
}

function normalizePrivileges(rawPrivileges: unknown): string[] {
  if (!Array.isArray(rawPrivileges)) return [];

  const codes = rawPrivileges
    .map((privilege) => {
      if (typeof privilege === "string") return normalizePrivilegeCode(privilege);
      if (privilege && typeof privilege === "object") {
        const objectPrivilege = privilege as { code?: unknown };
        return normalizePrivilegeCode(objectPrivilege.code);
      }
      return "";
    })
    .filter(Boolean);

  return Array.from(new Set(codes));
}

function parseStaffId(rawStaffId: unknown): number | undefined {
  if (typeof rawStaffId === "number" && Number.isFinite(rawStaffId)) {
    return rawStaffId;
  }

  if (typeof rawStaffId === "string") {
    const parsed = Number(rawStaffId);
    if (Number.isFinite(parsed)) return parsed;
  }

  return undefined;
}

function parseMemberId(raw: unknown): number | undefined {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

// Same shape as parseMemberId but used for team_member_id
const parseTeamMemberId = parseMemberId;

function buildUserToken(data: any): UserToken {
  const source = data?.user ?? data;
  const memberId = parseMemberId(source?.member_id ?? data?.member_id);
  const teamMemberId = parseTeamMemberId(source?.team_member_id ?? data?.team_member_id);
  const memberTypeRaw = String(source?.member_type ?? data?.member_type ?? "");
  const memberType = memberTypeRaw.toUpperCase().replace(/\s+/g, "_");
  const status = String(source?.status ?? data?.status ?? "").trim();

  const rawRole = source?.role ?? data?.role;
  const normalizedRawRole = normalizeRole(rawRole);

  // Determine role — team_member_id or role='team_member' both resolve to TEAM_MEMBER
  const role: import("../types/auth").Role =
    normalizedRawRole === "TEAM_MEMBER" ||
      teamMemberId != null ||
      (memberId != null && (memberType === "TEAM_MEMBER" || memberTypeRaw.toUpperCase().includes("TEAM")))
      ? "TEAM_MEMBER"
      : memberId != null
        ? "MEMBER"
        : normalizedRawRole;

  const providedPrivileges = normalizePrivileges(source?.privileges ?? data?.privileges ?? []);
  const fallbackPrivileges = role === "ADMIN" ? normalizePrivileges(ROLE_PRIVILEGES.ADMIN) : [];

  const rawNameAr = (source?.name_ar || data?.name_ar || "").trim();
  const rawNameEn = (source?.name_en || data?.name_en || "").trim();
  const rawName = (source?.name || data?.name || "").trim();
  const existingFullName = (source?.fullName || data?.fullName || "").trim();

  const fullName = existingFullName || rawNameAr || rawNameEn || rawName || "User";

  const rawPhoto =
    source?.photo ??
    source?.photo_url ??
    source?.profile_photo ??
    source?.profilePhoto ??
    source?.avatar ??
    source?.personal_photo_url ??
    source?.documents?.personal_photo_url ??
    data?.photo ??
    data?.photo_url ??
    data?.profile_photo ??
    data?.profilePhoto ??
    data?.avatar ??
    data?.personal_photo_url ??
    data?.documents?.personal_photo_url ??
    null;

  const builtUser = {
    fullName,
    email: source?.email ?? data?.email,
    photo: resolveFileUrl(rawPhoto) ?? undefined,
    role,
    privileges: Array.from(new Set([...providedPrivileges, ...fallbackPrivileges])),
    staff_id: parseStaffId(source?.staff_id ?? data?.staff_id),
    // Regular member
    ...(memberId != null && role !== "TEAM_MEMBER" && { member_id: memberId, status: status || undefined, member_type: memberType || undefined }),
    // Team member
    ...(teamMemberId != null && { team_member_id: teamMemberId, status: status || undefined }),
    // Edge-case: role=team_member from backend but no parsed teamMemberId yet
    ...(role === "TEAM_MEMBER" && teamMemberId == null && memberId != null && { team_member_id: memberId, status: status || undefined }),
  };

  console.log(`[AuthContext] Built User Token:`, { role: builtUser.role, team_member_id: (builtUser as any).team_member_id, member_id: (builtUser as any).member_id });
  return builtUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserToken | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("huc_user");
    const storedToken = localStorage.getItem("huc_access_token");

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(buildUserToken(parsedUser));
        setToken(storedToken);
      } catch (error) {
        console.error("Failed to parse stored user", error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== "huc_access_token") return;

      if (!event.newValue) {
        // Another tab logged out — sync this tab
        logout();
      } else if (event.newValue !== token) {
        // Another tab logged in as someone else — redirect to login
        window.location.href = "/login";
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [token]);

  // Auto-logout when the axios interceptor fires a 401 (token expired)
  useEffect(() => {
    const handleAuthLogout = () => {
      console.warn("[AuthContext] Received auth:logout event — token expired. Logging out.");
      logout();
    };

    window.addEventListener("auth:logout", handleAuthLogout);
    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, []);

  const login = (data: any) => {
    const userData = buildUserToken(data);
    const rawAccessToken = data?.token ?? data?.accessToken ?? data?.access_token;
    const accessToken = typeof rawAccessToken === "string" ? rawAccessToken : null;

    setUser(userData);
    setToken(accessToken);

    localStorage.setItem("huc_user", JSON.stringify(userData));

    if (accessToken) {
      localStorage.setItem("huc_access_token", accessToken);
      localStorage.setItem("token", accessToken); // Backwards compatibility
    } else {
      localStorage.removeItem("huc_access_token");
      localStorage.removeItem("token");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("huc_user");
    localStorage.removeItem("huc_access_token");
    localStorage.removeItem("token");
    localStorage.removeItem("huc_token"); // Clean up old keys
    window.location.href = "/login";
  };

  const hasPrivilege = (privilege: string) => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    return user.privileges.includes(normalizePrivilegeCode(privilege));
  };

  const hasAnyPrivilege = (privileges: string[]) => {
    if (!user) return false;
    if (user.role === "ADMIN") return true;
    return privileges.some((p) => user.privileges.includes(normalizePrivilegeCode(p)));
  };

  const contextValue = useMemo(() => ({
    user,
    token,
    login,
    logout,
    hasPrivilege,
    hasAnyPrivilege,
    loading
  }), [user, token, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
