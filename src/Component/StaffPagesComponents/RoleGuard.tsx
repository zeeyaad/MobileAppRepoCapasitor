import { type ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";

interface RoleGuardProps {
  children: ReactNode;
  privilege?: string;
  privileges?: string[];
  roles?: string[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, privilege, privileges, roles, fallback = null }: RoleGuardProps) {
  const { user, hasPrivilege, hasAnyPrivilege } = useAuth();

  if (roles && !roles.includes(user.role)) return <>{fallback}</>;
  if (privilege && !hasPrivilege(privilege)) return <>{fallback}</>;
  if (privileges && !hasAnyPrivilege(privileges)) return <>{fallback}</>;

  return <>{children}</>;
}
