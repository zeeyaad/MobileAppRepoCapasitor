import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
const Landingpage = lazy(() => import('./Page/Landingpage'));
const Login = lazy(() => import('./Page/Login'));
const Register = lazy(() => import('./Page/Register'));
const IdentityVerification = lazy(() => import('./Page/IdentityVerification'));
const DocumentUpload = lazy(() => import('./Page/DocumentUpload'));
const Dashboard = lazy(() => import('./Page/Dashboard'));
const BranchExplorePage = lazy(() => import('./Page/BranchExplorePage'));
const MemberPortal = lazy(() => import('./Page/MemberPortal'));
const AdminDashboard = lazy(() => import('./Page/Admin'));
const NewRegister = lazy(() => import('./Page/NewRegister'));
const InviteMemberPage = lazy(() => import('./Page/InviteMemberPage'));
const FamilyMemberDetailsPage = lazy(() => import('./Page/FamilyMemberDetailsPage'));
const RegisterPage = lazy(() => import('./features/register/RegisterPage'));
const AssignmentPage = lazy(() => import('./features/register/pages').then(m => ({ default: m.AssignmentPage })));

const StaffDashboard = lazy(() => import('./Page/staffDashboard'));
const MemberDashboard = lazy(() => import('./Page/MemberDashboard'));
const MemberPendingPage = lazy(() => import('./Page/MemberPendingPage'));

import ProtectedRoute from './Component/ProtectedRoute';
const ForbiddenPage = lazy(() => import('./Page/ForbiddenPage'));
import { AuthProvider } from './context/AuthContext';
const TeamMemberDashboard = lazy(() => import('./Page/teammemberdashboard'));
const PublicPostDetailsPage = lazy(() => import('./Page/PublicPostDetailsPage'));
const TeamMemberSportPaymentPage = lazy(() => import('./Page/TeamMemberSportPaymentPage'));
const MemberSportPaymentPage = lazy(() => import('./Page/MemberSportPaymentPage'));
const InvitationPage = lazy(() => import('./Page/InvitationPage'));
const JoinBookingPage = lazy(() => import('./Page/JoinBookingPage'));
const SecurityDashboardPage = lazy(() => import('./Page/SecurityDashboardPage'));

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">جار التحميل…</div>}>
          <Routes>
            <Route path="/" element={<Landingpage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify" element={<IdentityVerification />} />
            <Route path="/identity-verification" element={<IdentityVerification />} />
            <Route path="/upload-documents" element={<DocumentUpload />} />
            <Route path="/upload" element={<DocumentUpload />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/memberportal" element={<MemberPortal />} />
            <Route path="/new" element={<NewRegister />} />
            <Route path="/re" element={<RegisterPage />} />
            <Route path="/assignment" element={<AssignmentPage />} />
            <Route path="/form" element={<InviteMemberPage />} />
            <Route path="/invite" element={<InviteMemberPage />} />
            <Route path="/invite/:token" element={<InvitationPage />} />
            <Route path="/family-member" element={<FamilyMemberDetailsPage />} />
            <Route path="/branches/:branchId" element={<BranchExplorePage />} />
            <Route path="/news/:id" element={<PublicPostDetailsPage />} />
            <Route path="/lastNews" element={<Navigate to="/?tab=lastNews" replace />} />
            <Route path="/bookings/share/:shareToken" element={<JoinBookingPage />} />
            <Route path="/security/bookings" element={<SecurityDashboardPage />} />

            {/* Protected Routes - Staff */}
            <Route
              path="/staff/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "SPORTS_DIRECTOR", "SPORTS_OFFICER", "FINANCIAL_DIRECTOR", "REGISTRATION_STAFF", "TEAM_MANAGER", "SUPPORT", "AUDITOR", "STAFF"]}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Routes - Admin Only Specific (if any, example) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Member Dashboard — active members only (pending members are intercepted by ProtectedRoute) */}
            <Route
              path="/member/dashboard/*"
              element={
                <ProtectedRoute allowedRoles={["MEMBER"]}>
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/payment"
              element={
                <ProtectedRoute allowedRoles={["MEMBER"]}>
                  <MemberSportPaymentPage />
                </ProtectedRoute>
              }
            />

            {/* Pending member holding page */}
            <Route
              path="/member/pending"
              element={
                <ProtectedRoute allowedRoles={["MEMBER"]}>
                  <MemberPendingPage />
                </ProtectedRoute>
              }
            />

            {/* Team Member Dashboard */}
            <Route
              path="/team-member/dashboard"
              element={
                <ProtectedRoute allowedRoles={["TEAM_MEMBER"]}>
                  <TeamMemberDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/team-member/payment"
              element={
                <ProtectedRoute allowedRoles={["TEAM_MEMBER"]}>
                  <TeamMemberSportPaymentPage />
                </ProtectedRoute>
              }
            />

            <Route path="/unauthorized" element={<ForbiddenPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Router;

