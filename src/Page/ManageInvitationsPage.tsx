import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  Search,
  RefreshCw,
  Loader2,
  CalendarCheck,
  X,
  User,
  Phone,
  ArrowRight,
  ShieldAlert,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

import { RoleGuard } from "../Component/StaffPagesComponents/RoleGuard";

import { useToast } from "../hooks/use-toast";
import api from "../api/axios";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import { Input } from "../Component/StaffPagesComponents/ui/input";
import { Badge } from "../Component/StaffPagesComponents/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../Component/StaffPagesComponents/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Component/StaffPagesComponents/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../Component/StaffPagesComponents/ui/dialog";

// ─── Types ───────────────────────────────────────────────────────────────────

type Participant = {
  id: string;
  full_name: string;
  phone_number: string | null;
  email: string | null;
  is_creator: boolean;
  registered_at: string;
};

type Invitation = {
  booking_id: string;
  share_token: string;
  share_url: string;
  booker: {
    name: string;
    type: string | null;
    phone: string | null;
    email: string | null;
  };
  booking_date: string;
  booking_time: {
    start: string;
    end: string;
    duration_minutes: number;
  };
  sport: {
    name_ar?: string;
    name_en?: string;
  };
  field: {
    name_ar?: string;
    name_en?: string;
  };
  participants: Participant[];
  stats: {
    expected_participants: number;
    registered_count: number;
    remaining_slots: number;
    is_full: boolean;
  };
  status: "pending_payment" | "payment_completed" | "in_progress" | "completed" | "cancelled" | "confirmed";
  payment_status: "pending" | "completed";
  created_at: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Invitation["status"] }) {
  switch (status) {
    case "confirmed":
    case "payment_completed":
    case "completed":
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">مؤكد / مكتمل</Badge>;
    case "pending_payment":
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200">قيد الدفع</Badge>;
    case "cancelled":
      return <Badge variant="outline" className="text-muted-foreground w-fit">ملغي</Badge>;
    case "in_progress":
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">جارٍ</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function truncate(str: string, length = 8) {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
}

function formatTime(timeStr: string) {
  if (!timeStr) return "";
  try {
    const [h, m] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(h, 10), parseInt(m, 10), 0);
    return format(date, "h:mm a", { locale: ar });
  } catch {
    return timeStr;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ManageInvitationsPage() {
  const { toast } = useToast();

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 15, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Dialogs & Panels
  const [selectedInv, setSelectedInv] = useState<Invitation | null>(null);
  const [cancelDialog, setCancelDialog] = useState<Invitation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Data
  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
      });
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await api.get<{ success: boolean; data: Invitation[]; pagination: Pagination }>(
        `/bookings/admin/invitations?${params.toString()}`
      );
      
      if (res.data?.success) {
        setInvitations(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تحميل الدعوات المتاحة.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, toast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, statusFilter, fetchData]);

  // Actions
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "تم النسخ", description: "تم نسخ الرابط بنجاح." });
  };

  const handleCancelBooking = async () => {
    if (!cancelDialog) return;
    setIsDeleting(true);
    try {
      await api.delete(`/bookings/${cancelDialog.booking_id}`);
      toast({ title: "تم", description: "تم إلغاء الحجز بنجاح." });
      setCancelDialog(null);
      fetchData(pagination.page);
      if (selectedInv?.booking_id === cancelDialog.booking_id) {
        setSelectedInv(null);
      }
    } catch (error) {
      toast({ title: "خطأ", description: "حدث خطأ أثناء إلغاء الحجز.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 min-h-screen relative" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#1a365d] flex items-center gap-2">
            <Link2 className="h-6 w-6 text-primary" />
            إدارة الدعوات
          </h2>
          <p className="text-muted-foreground mt-1">
            مشاهدة وإدارة روابط الدعوات لحجوزات الملاعب والمشاركين.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => fetchData(pagination.page)} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
      </div>

      {/* Controls: Filters & Pagination */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full xl:w-auto">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="بحث بالاسم أو رقم الحجز..." 
              className="pl-3 pr-9 w-full rounded-lg bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-lg bg-slate-50 border-slate-200 font-medium focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder="تصفية حسب الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="confirmed">مؤكد</SelectItem>
              <SelectItem value="pending_payment">قيد الدفع</SelectItem>
              <SelectItem value="cancelled">ملغي</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Top-Left Pagination */}
        {pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center gap-3 xl:mr-auto">
            <span className="text-sm font-medium text-slate-500">
              صفحة {pagination.page} من {pagination.pages}
            </span>
            <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-md px-3 text-sm font-semibold hover:bg-white hover:shadow-sm hover:text-primary transition-all"
                disabled={pagination.page <= 1}
                onClick={() => fetchData(pagination.page - 1)}
              >
                السابق
              </Button>
              
              <div className="hidden sm:flex items-center gap-1 mx-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (pagination.pages > 5) {
                     if (pagination.page > 3) {
                       pageNum = pagination.page - 2 + i;
                     }
                     if (pageNum > pagination.pages) {
                       pageNum = pagination.pages - (4 - i);
                     }
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? "default" : "ghost"}
                      size="sm"
                      className={`h-8 w-8 p-0 rounded-md font-bold transition-all ${
                        pagination.page === pageNum 
                          ? 'shadow-md ring-1 ring-primary/50' 
                          : 'hover:bg-white hover:shadow-sm text-slate-600 hover:text-primary'
                      }`}
                      onClick={() => fetchData(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-md px-3 text-sm font-semibold hover:bg-white hover:shadow-sm hover:text-primary transition-all"
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchData(pagination.page + 1)}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-slate-700 px-5 py-4 w-[200px]">صاحب الحجز</TableHead>
                <TableHead className="font-bold text-slate-700 py-4 w-[140px]">رقم الهاتف</TableHead>
                <TableHead className="font-bold text-slate-700 py-4 w-[180px]">تاريخ ووقت الحجز</TableHead>
                <TableHead className="font-bold text-slate-700 py-4">الملعب / الرياضة</TableHead>
                <TableHead className="font-bold text-slate-700 py-4 text-center w-[120px]">المشاركون</TableHead>
                <TableHead className="font-bold text-slate-700 py-4 w-[140px]">الحالة</TableHead>
                <TableHead className="font-bold text-slate-700 py-4 text-center w-[140px]">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && invitations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin mb-3 text-primary/60" />
                    <p className="font-medium text-slate-500">جاري تحميل الدعوات...</p>
                  </TableCell>
                </TableRow>
              ) : invitations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-500 text-lg">لا توجد دعوات مسجلة</p>
                    <p className="text-sm text-slate-400 mt-1">لم يتم العثور على نتائج تطابق بحثك الحالي.</p>
                  </TableCell>
                </TableRow>
              ) : (
                invitations.map((inv) => (
                  <TableRow key={inv.booking_id} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group">
                    <TableCell className="px-5 py-4 align-top">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="text-[15px] font-bold text-slate-800 leading-none">{inv.booker?.name || "غير محدد"}</span>
                        {inv.booker?.type && (
                          <Badge variant="secondary" className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 border-blue-200/60 shadow-sm px-2 py-0.5">
                            {inv.booker.type === "member" ? "عضو نادي" : "لاعب فريق"}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-4 align-top">
                      {inv.booker?.phone ? (
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium bg-slate-50 px-2 py-1 rounded-md w-fit border border-slate-100">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-sm tracking-wide" dir="ltr">{inv.booker.phone}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground bg-slate-50 px-2 py-1 rounded-md w-fit inline-block">لا يوجد رقم</span>
                      )}
                    </TableCell>
                    
                    <TableCell className="py-4 align-top">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold bg-slate-50 rounded-md px-2 py-1 w-fit border border-slate-100">
                          <CalendarDays className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm">
                            {inv.booking_date ? format(new Date(inv.booking_date), "d MMM yyyy", { locale: ar }) : "—"}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 px-1">
                          <CalendarCheck className="h-3.5 w-3.5 text-slate-400" />
                          {formatTime(inv.booking_time?.start)} - {formatTime(inv.booking_time?.end)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 align-top">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-sm text-[#1a365d]">{inv.field?.name_ar || inv.field?.name_en || "ملعب غير محدد"}</span>
                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md w-fit">{inv.sport?.name_ar || inv.sport?.name_en || "رياضة غير محددة"}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center py-4 align-middle">
                      <div className="inline-flex items-center gap-1.5 bg-white border shadow-sm rounded-full px-3 py-1.5 text-sm font-bold text-slate-700 group-hover:border-primary/30 group-hover:shadow transition-all">
                        <User className="h-4 w-4 text-primary" />
                        <span>{inv.stats?.registered_count} <span className="text-slate-400 font-medium">/</span> {inv.stats?.expected_participants}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 align-middle">
                      <StatusBadge status={inv.status} />
                    </TableCell>

                    <TableCell className="py-4 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 shadow-sm text-primary border-primary/20 hover:bg-primary hover:text-white transition-colors"
                          onClick={() => setSelectedInv(inv)}
                          title="عرض التفاصيل"
                        >
                          <span className="hidden sm:inline-block ml-1.5">التفاصيل</span>
                          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 hover:shadow-sm border border-transparent hover:border-primary/20 transition-all rounded-md"
                          onClick={() => copyToClipboard(inv.share_url)}
                          title="نسخ الرابط"
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Slide-over Detail Panel */}
      <AnimatePresence>
        {selectedInv && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInv(null)}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "-100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 bottom-0 left-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden border-r"
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Link2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a365d]">تفاصيل الدعوة</h3>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{truncate(selectedInv.booking_id, 12)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSelectedInv(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                
                {/* Meta Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">التاريخ</span>
                    </div>
                    <div className="font-semibold text-sm">
                      {selectedInv.booking_date ? format(new Date(selectedInv.booking_date), "d MMM yyyy", { locale: ar }) : "—"}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <CalendarCheck className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">الوقت</span>
                    </div>
                    <div className="font-semibold text-sm">
                      {formatTime(selectedInv.booking_time?.start)} - {formatTime(selectedInv.booking_time?.end)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm border-b pb-1">معلومات الحجز</h4>
                    <StatusBadge status={selectedInv.status} />
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الملعب:</span>
                      <span className="font-medium text-left">{selectedInv.field?.name_ar || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الرياضة:</span>
                      <span className="font-medium text-left">{selectedInv.sport?.name_ar || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">رابط المشاركة:</span>
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1.5" onClick={() => copyToClipboard(selectedInv.share_url)}>
                        <Link2 className="h-3 w-3" />نسخ الرابط
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <h4 className="font-semibold text-sm border-b pb-1">صاحب الحجز</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs py-0.5">الاسم:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{selectedInv.booker?.name || "—"}</span>
                        {selectedInv.booker?.type && (
                          <Badge variant="secondary" className="text-[10px] h-5">{selectedInv.booker.type === "member" ? "عضو" : "لاعب"}</Badge>
                        )}
                      </div>
                    </div>
                    {selectedInv.booker?.phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-xs py-0.5">الهاتف:</span>
                        <div className="flex gap-2">
                          <span className="font-medium" dir="ltr">{selectedInv.booker.phone}</span>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(selectedInv.booker?.phone || "")}>
                            <Phone className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center border-b pb-1">
                    <h4 className="font-semibold text-sm">قائمة المشاركين</h4>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                      {selectedInv.stats?.registered_count} / {selectedInv.stats?.expected_participants} مسجل
                    </span>
                  </div>
                  
                  {(!selectedInv.participants || selectedInv.participants.length === 0) ? (
                    <div className="text-center py-6 text-sm text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                      لم ينضم أي مشارك حتى الآن.
                    </div>
                  ) : (
                    <div className="space-y-3 mt-3">
                      {selectedInv.participants.map((p, i) => (
                        <div key={p.id || i} className="flex flex-col gap-1 p-3 rounded-lg border border-slate-100 bg-white shadow-sm relative overflow-hidden">
                          {p.is_creator && (
                            <div className="absolute top-0 right-0 w-1 bg-primary h-full rounded-r-lg"></div>
                          )}
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-sm text-[#1a365d] flex items-center gap-1.5">
                              {p.is_creator && <User className="h-3.5 w-3.5 text-primary" />}
                              {p.full_name}
                            </span>
                            {p.is_creator && (
                              <Badge variant="outline" className="text-[10px] h-4 leading-none py-0 px-1 border-primary/30 text-primary">منشئ الحجز</Badge>
                            )}
                          </div>
                          
                          {(p.phone_number || p.email) && (
                            <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                              {p.phone_number && <span dir="ltr">{p.phone_number}</span>}
                              {p.email && <span>{p.email}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
              
              {/* Footer Actions */}
              <div className="p-6 border-t bg-slate-50 mt-auto">
                {selectedInv.status !== "cancelled" && (
                  <RoleGuard privilege="SCHEDULE_MATCH">
                    <Button 
                      variant="destructive" 
                      className="w-full gap-2"
                      onClick={() => setCancelDialog(selectedInv)}
                    >
                      <ShieldAlert className="h-4 w-4" />
                      إلغاء الحجز والدعوة نهائياً
                    </Button>
                  </RoleGuard>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={(open) => !open && setCancelDialog(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              تأكيد إلغاء الحجز
            </DialogTitle>
            <DialogDescription className="pt-2">
              هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟
              سيتم إبطال رابط الدعوة ولن يتمكن المشاركون من التسجيل أو الحضور.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm font-semibold border-r-2 border-border pr-2 bg-slate-50 py-1 rounded-sm">
              الحجز: {cancelDialog?.field?.name_ar} يوم {cancelDialog?.booking_date ? format(new Date(cancelDialog.booking_date), "d MMM yyyy", { locale: ar }) : ""}
            </p>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button variant="outline" onClick={() => setCancelDialog(null)} disabled={isDeleting}>
              تراجع
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
              نعم، ألغ الحجز
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
