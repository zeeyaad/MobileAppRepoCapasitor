import { useState } from "react";
import { motion } from "framer-motion";
import { mockPrivilegePackages } from "../data/mockData";
import { Switch } from "../Component/StaffPagesComponents/ui/switch";
import { useToast } from "../hooks/use-toast";

const MODULE_LABELS: Record<string, string> = {
  sports: "الرياضات",
  members: "الأعضاء",
  finance: "المالية",
  tasks: "المهام",
};

const PERM_LABELS: Record<string, string> = {
  view: "عرض",
  create: "إنشاء",
  edit: "تعديل",
  delete: "حذف",
  approve: "موافقة",
};

export default function AdminPrivilegesPage() {
  const [packages, setPackages] = useState(mockPrivilegePackages);
  const [selectedId, setSelectedId] = useState(packages[0]?.id);
  const { toast } = useToast();

  const selected = packages.find((p) => p.id === selectedId);

  const togglePerm = (module: string, perm: string) => {
    setPackages(packages.map((pkg) => {
      if (pkg.id !== selectedId) return pkg;
      return {
        ...pkg,
        modules: {
          ...pkg.modules,
          [module]: { ...(pkg.modules as any)[module], [perm]: !(pkg.modules as any)[module][perm] },
        },
      };
    }));
    toast({ title: "تم التحديث", description: "تم تحديث الصلاحيات" });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">صلاحيات النظام</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Package List */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg bg-card shadow-sm border p-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">حزم الصلاحيات</h2>
          <div className="space-y-1">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedId(pkg.id)}
                className={`w-full text-right px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pkg.id === selectedId ? "bg-accent text-accent-foreground font-semibold" : "hover:bg-muted"
                }`}
              >
                {pkg.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Permissions Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-3 rounded-lg bg-card shadow-sm border p-6">
          {selected ? (
            <>
              <h2 className="text-lg font-semibold mb-4">{selected.name}</h2>
              <div className="space-y-6">
                {Object.entries(selected.modules).map(([module, perms]) => (
                  <div key={module}>
                    <h3 className="text-sm font-semibold text-foreground mb-3">{MODULE_LABELS[module] || module}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {Object.entries(perms as Record<string, boolean>).map(([perm, enabled]) => (
                        <div key={perm} className="flex items-center justify-between gap-2 rounded-lg bg-muted p-3">
                          <span className="text-sm">{PERM_LABELS[perm] || perm}</span>
                          <Switch checked={enabled} onCheckedChange={() => togglePerm(module, perm)} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-center py-10">اختر حزمة صلاحيات</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
