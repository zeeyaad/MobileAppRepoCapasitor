export type Role =
  | "ADMIN"
  | "SPORTS_DIRECTOR"
  | "SPORTS_OFFICER"
  | "FINANCIAL_DIRECTOR"
  | "REGISTRATION_STAFF"
  | "TEAM_MANAGER"
  | "SUPPORT"
  | "AUDITOR"
  | "MEDIA"
  | "TEAM_MEMBER"   // Member type: sports player (member_type_id = Team Member)
  | "MEMBER"        // Other members (visitor, working, etc.)
  | "STAFF"         // General staff
  | "STAFF_MEMBER"; // Staff member

export interface UserToken {
  fullName: string;
  role: Role;
  privileges: string[];
  staff_id?: number;
  /** Set when user is a regular member (visitor, working, etc.). */
  member_id?: number;
  /** Set when user is a team member (sports player). Used for Team Member dashboard. */
  team_member_id?: number;
  /** Account or member status: active, pending, etc. */
  status?: string;
  /** Member type name from backend, e.g. TEAM_MEMBER. */
  member_type?: string;
  email?: string;
  photo?: string;
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "مدير النظام",
  SPORTS_DIRECTOR: "مدير الرياضة",
  SPORTS_OFFICER: "مسؤول الرياضة",
  FINANCIAL_DIRECTOR: "المدير المالي",
  REGISTRATION_STAFF: "موظف التسجيل",
  TEAM_MANAGER: "مدير الفريق",
  SUPPORT: "الدعم الفني",
  AUDITOR: "المراجع",
  MEDIA: "المسؤول الإعلامي",
  TEAM_MEMBER: "عضو فريق رياضي",
  MEMBER: "عضو",
  STAFF: "موظف",
  STAFF_MEMBER: "عضو هيئة موظفين",
};

export const ROLE_PRIVILEGES: Record<Role, string[]> = {
  ADMIN: [
    "dashboard.view",
    "VIEW_SPORTS", "CREATE_SPORT", "UPDATE_SPORT", "DELETE_SPORT", "APPROVE_SPORT",
    "VIEW_MEMBERS", "CREATE_MEMBER", "UPDATE_MEMBER", "DELETE_MEMBER", "CHANGE_MEMBER_STATUS", "MANAGE_MEMBERSHIP_REQUEST", "REVIEW_MEMBER",
    "VIEW_FINANCE", "CREATE_FINANCE", "UPDATE_FINANCE",
    "VIEW_TASKS", "APPROVE_TASK", "REJECT_TASK",
    "VIEW_PRIVILEGES", "UPDATE_PRIVILEGES",
    "VIEW_MEMBERSHIP_PLANS", "CREATE_MEMBERSHIP_PLAN", "UPDATE_MEMBERSHIP_PLAN", "DELETE_MEMBERSHIP_PLAN", "CHANGE_MEMBERSHIP_PLAN_STATUS",
    "STAFF_CREATE", "STAFF_VIEW", "STAFF_EDIT", "STAFF_DELETE",
    "audit.view",
  ],
  SPORTS_DIRECTOR: [
    "dashboard.view", "VIEW_SPORTS", "CREATE_SPORT", "UPDATE_SPORT", "APPROVE_SPORT",
    "VIEW_MEMBERS", "VIEW_TASKS", "APPROVE_TASK", "REJECT_TASK",
  ],
  SPORTS_OFFICER: [
    "dashboard.view", "VIEW_SPORTS", "UPDATE_SPORT",
    "VIEW_MEMBERS", "CREATE_MEMBER",
  ],
  FINANCIAL_DIRECTOR: [
    "dashboard.view", "VIEW_FINANCE", "CREATE_FINANCE", "UPDATE_FINANCE",
    "VIEW_MEMBERS",
  ],
  REGISTRATION_STAFF: [
    "dashboard.view", "VIEW_MEMBERS", "CREATE_MEMBER", "UPDATE_MEMBER", "CHANGE_MEMBER_STATUS", "MANAGE_MEMBERSHIP_REQUEST",
    "VIEW_MEMBERSHIP_PLANS", "CREATE_MEMBERSHIP_PLAN",
  ],
  TEAM_MANAGER: [
    "dashboard.view", "VIEW_SPORTS", "VIEW_MEMBERS",
  ],
  SUPPORT: [
    "dashboard.view", "VIEW_MEMBERS",
  ],
  AUDITOR: [
    "dashboard.view", "VIEW_SPORTS", "VIEW_MEMBERS", "VIEW_FINANCE",
  ],
  MEDIA: [
    "media.view", "media.create", "media.edit", "media.delete"
  ],
  TEAM_MEMBER: [],
  MEMBER: [],
  STAFF: ["dashboard.view"],
  STAFF_MEMBER: ["dashboard.view"],
};

export interface SidebarItem {
  title: string;
  icon: string;
  path: string;
  requiredPrivilege: string;
}
