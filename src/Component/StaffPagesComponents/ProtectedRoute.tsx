import { type ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import ForbiddenPage from "../../Page/ForbiddenPage";

interface ProtectedRouteProps {
  children: ReactNode;
  privilege: string;
}

export function ProtectedRoute({ children, privilege }: ProtectedRouteProps) {
  const { hasPrivilege } = useAuth();

  if (!hasPrivilege(privilege)) {
    return <ForbiddenPage />;
  }

  return <>{children}</>;
}
