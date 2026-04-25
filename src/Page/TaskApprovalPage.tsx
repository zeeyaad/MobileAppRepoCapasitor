import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import { StatCard } from "../Component/StaffPagesComponents/StatCard";
import { Badge } from "../Component/StaffPagesComponents/ui/badge";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import { useToast } from "../hooks/use-toast";
import api from "../api/axios";

// Helper to translate Backend TaskType to Arabic
const taskTypeMap: Record<string, string> = {
  SPORT_CREATION: "إضافة رياضة",
  FINANCE: "مالية",
  MEMBERSHIP_UPDATE: "تحديث عضوية",
  GENERAL: "عام",
};

interface Task {
  id: number;
  title: string;
  description: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  created_by: string;
  created_at: string;
}

export default function TaskApprovalPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get("/tasks");
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
      toast({ title: "خطأ", description: "فشل تحميل المهام", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const pending = tasks.filter((t) => t.status === "pending");
  const approved = tasks.filter((t) => t.status === "approved");

  const handleAction = async (id: number, action: "approved" | "rejected") => {
    try {
      await api.patch(`/tasks/${id}/status`, { status: action });

      setTasks(tasks.map((t) => t.id === id ? { ...t, status: action } : t));

      toast({
        title: action === "approved" ? "تمت الموافقة" : "تم الرفض",
        description: `تم ${action === "approved" ? "الموافقة على" : "رفض"} المهمة بنجاح`,
      });
    } catch {
      toast({ title: "خطأ", description: "فشل تحديث الحالة", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الموافقات</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="مهام معلقة" value={pending.length} icon={Clock} />
        <StatCard title="مهام تمت الموافقة" value={approved.length} icon={ClipboardCheck} />
      </div>

      {loading ? (
        <div className="text-center py-10">جارٍ التحميل...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.length === 0 ? (
            <div className="col-span-2 text-center text-muted-foreground py-10 border rounded-lg bg-card">
              لا توجد مهام حالياً
            </div>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-card shadow-sm border overflow-hidden"
              >
                <div className="bg-primary px-4 py-3 flex justify-between items-center">
                  <h3 className="text-primary-foreground font-semibold">{task.title}</h3>
                  <Badge variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
                    {taskTypeMap[task.type] || task.type}
                  </Badge>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">بواسطة: {task.created_by || "غير محدد"}</span>
                    <span className="text-xs text-muted-foreground">{new Date(task.created_at).toLocaleDateString('ar-EG')}</span>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Badge className={
                      task.status === "pending" ? "bg-huc-orange text-huc-orange-foreground"
                        : task.status === "approved" ? "bg-success text-success-foreground"
                          : "bg-destructive text-destructive-foreground"
                    }>
                      {task.status === "pending" ? "معلق" : task.status === "approved" ? "موافق عليه" : "مرفوض"}
                    </Badge>
                  </div>

                  {task.status === "pending" && (
                    <div className="flex items-center gap-2 pt-3 border-t">
                      <Button size="sm" className="bg-success hover:bg-success/90 text-success-foreground w-full gap-2" onClick={() => handleAction(task.id, "approved")}>
                        <CheckCircle className="h-4 w-4" /> موافقة
                      </Button>
                      <Button size="sm" variant="destructive" className="w-full gap-2" onClick={() => handleAction(task.id, "rejected")}>
                        <XCircle className="h-4 w-4" /> رفض
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
