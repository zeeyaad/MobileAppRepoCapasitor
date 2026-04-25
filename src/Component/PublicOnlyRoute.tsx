import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserToken } from '../types/auth';

interface PublicOnlyRouteProps {
    children: React.ReactNode;
}

const STAFF_ROLES = new Set([
    'ADMIN',
    'STAFF',
    'STAFF_MEMBER',
    'SPORTS_DIRECTOR',
    'SPORTS_OFFICER',
    'FINANCIAL_DIRECTOR',
    'REGISTRATION_STAFF',
    'TEAM_MANAGER',
    'SUPPORT',
    'AUDITOR',
    'MEDIA',
]);

const resolveAuthenticatedRedirect = (user: UserToken): string => {
    const role = String(user.role || '').toUpperCase();
    const memberType = String(user.member_type || '').toUpperCase();

    const isTeamMember =
        role === 'TEAM_MEMBER' ||
        Boolean(user.team_member_id) ||
        memberType.includes('TEAM');

    if (isTeamMember) {
        return '/team-member/dashboard';
    }

    const isMember = role === 'MEMBER' || Boolean(user.member_id);
    if (isMember) {
        return '/member/dashboard';
    }

    const isStaff = Boolean(user.staff_id) || STAFF_ROLES.has(role);
    if (isStaff) {
        return '/staff/dashboard';
    }

    return '/';
};

const PublicOnlyRoute: React.FC<PublicOnlyRouteProps> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
            </div>
        );
    }

    if (user) {
        return <Navigate to={resolveAuthenticatedRedirect(user)} replace />;
    }

    return <>{children}</>;
};

export default PublicOnlyRoute;
