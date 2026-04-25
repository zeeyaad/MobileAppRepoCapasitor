import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { type Role } from '../types/auth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
    requiredPrivilege?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
    requiredPrivilege,
}) => {
    const { user, loading, hasPrivilege } = useAuth();
    const location = useLocation();

    // Debugging unauthorized access
    if (user && allowedRoles) {
        const normalizedUserRole = String(user.role || '').toUpperCase();
        const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toUpperCase());
        const hasRoleMatch = normalizedAllowedRoles.includes(normalizedUserRole);
        if (!hasRoleMatch) {
            console.warn(`[ProtectedRoute] Access denied to ${location.pathname}. User role: ${normalizedUserRole}. Allowed: ${normalizedAllowedRoles.join(', ')}`);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles) {
        const normalizedUserRole = String(user.role || '').toUpperCase();
        const normalizedAllowedRoles = allowedRoles.map((role) => String(role).toUpperCase());
        const hasRoleMatch = normalizedAllowedRoles.includes(normalizedUserRole);

        // Backend may return generic "staff"; allow it only on staff dashboard-style routes.
        const isGenericStaff = normalizedUserRole === 'STAFF';
        const isStaffOnlyRoute = normalizedAllowedRoles.some((role) => role !== 'ADMIN' && role !== 'MEDIA');

        if (!hasRoleMatch && !(isGenericStaff && isStaffOnlyRoute)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    if (requiredPrivilege && !hasPrivilege(requiredPrivilege)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
