import { Toaster } from "../Component/StaffPagesComponents/ui/toaster";
import { Toaster as Sonner } from "../Component/StaffPagesComponents/ui/sonner";
import { TooltipProvider } from "../Component/StaffPagesComponents/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../Component/StaffPagesComponents/layout/MainLayout";
import DashboardPage from "./DashboardPage";
import SportsPage from "./SportsPage";
import MembershipsPage from "./MemberShipsPage";
import RegistrationManagementPage from "./RegistrationManagementPage";
import MembershipFormPage from "./MembershipFormPage";
import FinancePage from "./FinancePage";
// import TaskApprovalPage from "./TaskApprovalPage";
import AdminPrivilegesPage from "./AdminPrivilegesPage";
import NotFound from "./NotFound";
import './staffDashboard.css'
import AuditLogPage from "./AuditLogPage";
import MediaGalleryDashboard, { MediaGalleryPostPage } from "./MediaGalleryDashboard";
import AddNewStaffPage from "./AddNewStaffPage";
import StaffListPage from "./StaffListPage";
import StaffManagementPage from "./StaffManagementPage";
import StaffProfile from "./StaffProfile";
import ProtectedRoute from "../Component/ProtectedRoute";
import PrivilegePackageAdminPage from "./PrivilegePackageAdminPage";
import AssignStaffPrivilegesPage from "./AssignStaffPrivilegesPage";
import RevokePrivilegesPage from "./RevokePrivilegesPage";
import { CredentialChangeModal } from "../components/CredentialChangeModal";
import MemberManagementPage from "./MemberManagementPage";
import StaffAddMemberPage from "./StaffAddMemberPage";
import StaffAddTeamMemberPage from "./StaffAddTeamMemberPage";
import SportsMembersPage from "./SportsMembersPage";
import SportManagementPage from "./SportManagementPage";
import SportsRequestsPage from "./SportsRequestsPage";
import CourtsManagementPage from "./CourtsManagementPage";
import CourtBookingsPage from "./CourtBookingsPage";
import AttendancePage from "./AttendancePage";
import TeamsManagementPage from "./TeamsManagementPage";
import SubscriptionsPage from "./SubscriptionsPage";
import { useAuth } from "../context/AuthContext";
import CardPrintPage from "./CardPrintPage";
import ManageInvitationsPage from "./ManageInvitationsPage";
import FacultyManagementPage from "./FacultyManagementPage";
import BranchManagementPage from "./BranchManagementPage";
import ProfessionManagementPage from "./ProfessionManagementPage";

const queryClient = new QueryClient();

// ─── Ordered list of fallback pages for non-dashboard users ──────────────────
// When a user does NOT have dashboard.view, we redirect them to the first page
// in this list that they have access to. The profile page has no privilege
// requirement so it is always the ultimate fallback.
const FALLBACK_PAGES: Array<{ path: string; privilege?: string }> = [
  { path: "/staff/dashboard/registrations", privilege: "MANAGE_MEMBERSHIP_REQUEST" },
  { path: "/staff/dashboard/members/manage", privilege: "VIEW_MEMBERS" },
  { path: "/staff/dashboard/members/new", privilege: "CREATE_MEMBER" },
  { path: "/staff/dashboard/members/new-team-member", privilege: "ADD_TEAM_MEMBER" },
  { path: "/staff/dashboard/sports", privilege: "VIEW_SPORTS" },
  { path: "/staff/dashboard/memberships", privilege: "VIEW_MEMBERSHIP_PLANS" },
  { path: "/staff/dashboard/finance/subscriptions", privilege: "VIEW_FINANCE" },
  // { path: "/staff/dashboard/tasks", privilege: "VIEW_TASKS" },
  { path: "/staff/dashboard/media-gallery", privilege: "media.view" },
  { path: "/staff/dashboard/audit-log", privilege: "VIEW_AUDIT_LOGS" },
  { path: "/staff/dashboard/faculties", privilege: "VIEW_FACULTIES" },
  { path: "/staff/dashboard/branches", privilege: "VIEW_BRANCHES" },
  { path: "/staff/dashboard/professions", privilege: "VIEW_PROFESSIONS" },
  { path: "/staff/dashboard/admin/staff/manage", privilege: "VIEW_STAFF" },
  { path: "/staff/dashboard/profile"                 /* always accessible */ },
];

/** Redirects admin/senior staff to DashboardPage; others to their first accessible page. */
function SmartIndexRedirect() {
  const { hasPrivilege } = useAuth();

  if (hasPrivilege("dashboard.view")) {
    return <DashboardPage />;
  }

  const target = FALLBACK_PAGES.find(
    (p) => !p.privilege || hasPrivilege(p.privilege)
  );

  return <Navigate to={target?.path ?? "/staff/dashboard/profile"} replace />;
}

const StaffDashboard = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CredentialChangeModal />
        <MainLayout>
          <Routes>
            <Route index element={<SmartIndexRedirect />} />
            <Route path="sports" element={<ProtectedRoute requiredPrivilege="VIEW_SPORTS"><SportsPage /></ProtectedRoute>} />
            {/* <Route path="sports/requests" element={<ProtectedRoute requiredPrivilege="VIEW_SPORTS"><SportsRequestsPage /></ProtectedRoute>} /> */}
            <Route path="sports/courts" element={<ProtectedRoute requiredPrivilege="VIEW_FIELDS"><CourtsManagementPage /></ProtectedRoute>} />
            <Route path="sports/bookings" element={<ProtectedRoute requiredPrivilege="VIEW_SPORTS"><CourtBookingsPage /></ProtectedRoute>} />
            <Route path="sports/invitations" element={<ProtectedRoute requiredPrivilege="VIEW_SPORTS"><ManageInvitationsPage /></ProtectedRoute>} />
            {/* <Route path="sports/attendance" element={<ProtectedRoute requiredPrivilege="VIEW_SPORTS"><AttendancePage /></ProtectedRoute>} /> */}
            <Route path="sports/teams" element={<ProtectedRoute requiredPrivilege="VIEW_TEAMS"><TeamsManagementPage /></ProtectedRoute>} />
            <Route path="profile" element={<StaffProfile />} />
            <Route path="memberships" element={<ProtectedRoute requiredPrivilege="VIEW_MEMBERSHIP_PLANS"><MembershipsPage /></ProtectedRoute>} />
            <Route path="registrations" element={<ProtectedRoute requiredPrivilege="MANAGE_MEMBERSHIP_REQUEST"><RegistrationManagementPage /></ProtectedRoute>} />
            {/* <Route path="membership-form" element={<ProtectedRoute requiredPrivilege="VIEW_MEMBERS"><MembershipFormPage /></ProtectedRoute>} /> */}
            <Route path="finance/subscriptions" element={<ProtectedRoute requiredPrivilege="VIEW_FINANCE"><SubscriptionsPage /></ProtectedRoute>} />
            <Route path="admin/privileges" element={<ProtectedRoute requiredPrivilege="VIEW_PRIVILEGES"><AdminPrivilegesPage /></ProtectedRoute>} />
            <Route path="admin/privilege-packages" element={<ProtectedRoute requiredPrivilege="VIEW_PRIVILEGES"><PrivilegePackageAdminPage /></ProtectedRoute>} />
            <Route path="audit-log" element={<ProtectedRoute requiredPrivilege="VIEW_AUDIT_LOGS"><AuditLogPage /></ProtectedRoute>} />
            <Route path="admin/staff/new" element={<ProtectedRoute requiredPrivilege="CREATE_STAFF"><AddNewStaffPage /></ProtectedRoute>} />
            <Route path="admin/staff/list" element={<ProtectedRoute requiredPrivilege="VIEW_STAFF"><StaffListPage /></ProtectedRoute>} />
            <Route path="admin/staff/manage" element={<ProtectedRoute requiredPrivilege="VIEW_STAFF"><StaffManagementPage /></ProtectedRoute>} />
            <Route path="admin/staff/assign-privileges" element={<ProtectedRoute requiredPrivilege="VIEW_PRIVILEGES"><AssignStaffPrivilegesPage /></ProtectedRoute>} />
            <Route path="admin/staff/revoke-privileges" element={<ProtectedRoute requiredPrivilege="VIEW_PRIVILEGES"><RevokePrivilegesPage /></ProtectedRoute>} />
            <Route path="members/manage" element={<ProtectedRoute requiredPrivilege="VIEW_MEMBERS"><MemberManagementPage /></ProtectedRoute>} />
            <Route path="members/sports" element={<ProtectedRoute requiredPrivilege="ASSIGN_SPORT_TO_MEMBER"><SportsMembersPage /></ProtectedRoute>} />
            <Route path="members/sports-view" element={<ProtectedRoute requiredPrivilege="VIEW_TEAM_MEMBERS"><SportManagementPage /></ProtectedRoute>} />
            <Route path="members/new" element={<ProtectedRoute requiredPrivilege="CREATE_MEMBER"><StaffAddMemberPage /></ProtectedRoute>} />
            <Route path="members/new-team-member" element={<ProtectedRoute requiredPrivilege="ADD_TEAM_MEMBER"><StaffAddTeamMemberPage /></ProtectedRoute>} />
            <Route path="members/card-print" element={<ProtectedRoute requiredPrivilege="VIEW_MEMBERS"><CardPrintPage /></ProtectedRoute>} />
            <Route path="media-gallery" element={<ProtectedRoute requiredPrivilege="media.view"><MediaGalleryDashboard /></ProtectedRoute>} />
            <Route path="media-gallery/:id" element={<ProtectedRoute requiredPrivilege="media.view"><MediaGalleryPostPage /></ProtectedRoute>} />
            <Route path="faculties" element={<ProtectedRoute requiredPrivilege="VIEW_FACULTIES"><FacultyManagementPage /></ProtectedRoute>} />
            <Route path="branches" element={<ProtectedRoute requiredPrivilege="VIEW_BRANCHES"><BranchManagementPage /></ProtectedRoute>} />
            <Route path="professions" element={<ProtectedRoute requiredPrivilege="VIEW_PROFESSIONS"><ProfessionManagementPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default StaffDashboard;

