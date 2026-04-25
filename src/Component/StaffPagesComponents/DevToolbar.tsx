import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { type Role, ROLE_LABELS } from "../../types/auth";
import { Settings } from "lucide-react";

const ALL_ROLES: Role[] = [
  "ADMIN", "SPORTS_DIRECTOR", "SPORTS_OFFICER", "FINANCIAL_DIRECTOR",
  "REGISTRATION_STAFF", "TEAM_MANAGER", "SUPPORT", "AUDITOR",
];

export function DevToolbar() {
  const { user, setRole } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-2 rounded-lg border bg-card p-3 shadow-xl min-w-[200px]"
          >
            <p className="text-xs font-semibold text-muted-foreground mb-2 font-poppins">Switch Role</p>
            <div className="flex flex-col gap-1">
              {ALL_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setRole(role)}
                  className={`text-right text-sm px-3 py-1.5 rounded-md transition-colors ${
                    user.role === role
                      ? "bg-accent text-accent-foreground font-semibold"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <span className="font-cairo">{ROLE_LABELS[role]}</span>
                  <span className="text-[10px] text-muted-foreground mr-2 font-poppins">({role})</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        className="h-12 w-12 rounded-full bg-accent text-accent-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
      >
        <Settings className="h-5 w-5" />
      </button>
    </div>
  );
}
