import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../Component/StaffPagesComponents/ui/table";
import { Badge } from "../Component/StaffPagesComponents/ui/badge";
import { Input } from "../Component/StaffPagesComponents/ui/input";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../Component/StaffPagesComponents/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Component/StaffPagesComponents/ui/select";
import { RoleGuard } from "../Component/StaffPagesComponents/RoleGuard";
import { Pencil, Search, Trash2, Eye, Power, Plus } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import api from "../api/axios";


type MembershipApiItem = {
  id: number;
  member_type_id: number;
  plan_code: string;
  name_en: string;
  name_ar: string;
  description_en?: string | null;
  description_ar?: string | null;
  price: string;
  currency: string;
  duration_months: number;
  renewal_price: string;
  is_installable: boolean;
  max_installments?: number | null;
  is_active: boolean;
  is_for_foreigner: boolean;
  min_age?: number | null;
  max_age?: number | null;
  created_at?: string;
  updated_at?: string;
};

type MembershipTypeItem = {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
};

type MembershipsResponse = {
  success?: boolean;
  message?: string;
  data?: MembershipApiItem[];
};

type MemberTypesResponse = {
  success?: boolean;
  data?: MembershipTypeItem[];
};

const PAGE_SIZE = 10;

export default function MembershipsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [memberships, setMemberships] = useState<MembershipApiItem[]>([]);
  const [memberTypes, setMemberTypes] = useState<MembershipTypeItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipApiItem | null>(null);
  const [editPlan, setEditPlan] = useState<MembershipApiItem | null>(null);
  const [deletePlan, setDeletePlan] = useState<MembershipApiItem | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    member_type_id: "",
    plan_code: "",
    name_ar: "",
    name_en: "",
    price: "",
    currency: "EGP",
    duration_months: "",
    renewal_price: "",
    is_active: true,
  });
  const [creating, setCreating] = useState(false);
  const [editForm, setEditForm] = useState({
    plan_code: "",
    name_ar: "",
    name_en: "",
    price: "",
    currency: "EGP",
    duration_months: "",
    renewal_price: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [resParams, resTypes] = await Promise.all([
          api.get<MembershipsResponse>("/membership-plans"),
          api.get<MemberTypesResponse>("/member-types")
        ]);

        const list = resParams?.data?.data;
        if (Array.isArray(list)) {
          setMemberships(list);
        } else if (Array.isArray(resParams?.data)) {
          setMemberships(resParams.data as MembershipApiItem[]);
        } else {
          setMemberships([]);
        }

        if (resTypes?.data?.data && Array.isArray(resTypes.data.data)) {
          setMemberTypes(resTypes.data.data);
        }

      } catch (err) {
        const message = err instanceof Error ? err.message : "تعذر تحميل البيانات";
        toast({ title: "خطأ في التحميل", description: message, variant: "destructive" });
        setMemberships([]);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [toast]);

  const refreshPlans = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<MembershipsResponse>("/membership-plans");
      const list = res?.data?.data;
      if (Array.isArray(list)) {
        setMemberships(list);
      } else if (Array.isArray(res?.data)) {
        setMemberships(res.data as MembershipApiItem[]);
      } else {
        setMemberships([]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "تعذر تحميل خطط العضوية";
      toast({ title: "تعذر تحميل خطط العضوية", description: message, variant: "destructive" });
      setMemberships([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setCreateForm({
      member_type_id: "",
      plan_code: "",
      name_ar: "",
      name_en: "",
      price: "",
      currency: "EGP",
      duration_months: "",
      renewal_price: "",
      is_active: true,
    });
    setCreateOpen(true);
  };

  const saveCreate = async () => {
    setCreating(true);
    try {
      const payload: Record<string, unknown> = {
        member_type_id: createForm.member_type_id,
        plan_code: createForm.plan_code,
        name_ar: createForm.name_ar,
        name_en: createForm.name_en,
        price: createForm.price,
        currency: createForm.currency,
        duration_months: createForm.duration_months,
        renewal_price: createForm.renewal_price,
        is_active: createForm.is_active,
      };

      const res = await api.post<{ message: string }>("/membership-plans", payload);
      toast({ title: "تمت الإضافة", description: res?.data?.message || "تم إنشاء خطة العضوية" });
      setCreateOpen(false);
      await refreshPlans();
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل إنشاء خطة العضوية";
      toast({ title: "فشل الإضافة", description: message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (plan: MembershipApiItem) => {
    setEditPlan(plan);
    setEditForm({
      plan_code: plan.plan_code,
      name_ar: plan.name_ar,
      name_en: plan.name_en,
      price: String(plan.price ?? ""),
      currency: plan.currency ?? "EGP",
      duration_months: String(plan.duration_months ?? ""),
      renewal_price: String(plan.renewal_price ?? ""),
      is_active: !!plan.is_active,
    });
  };

  const saveEdit = async () => {
    if (!editPlan) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        plan_code: editForm.plan_code,
        name_ar: editForm.name_ar,
        name_en: editForm.name_en,
        price: Number(editForm.price),
        currency: editForm.currency,
        duration_months: editForm.duration_months,
        renewal_price: editForm.renewal_price,
        is_active: editForm.is_active,
      };

      const res = await api.put<{ message: string }>(`/membership-plans/${editPlan.id}`, payload);
      toast({ title: "تم الحفظ", description: res?.data?.message || "تم تحديث الخطة بنجاح" });
      setEditPlan(null);
      await refreshPlans();
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل تحديث الخطة";
      toast({ title: "فشل الحفظ", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletePlan) return;
    setDeleting(true);
    try {
      const res = await api.delete<{ message: string }>(`/membership-plans/${deletePlan.id}`);
      toast({ title: "تم الحذف", description: res?.data?.message || "تم حذف الخطة بنجاح" });
      setDeletePlan(null);
      await refreshPlans();
    } catch (err: unknown) {
      // Improved Error Handling for 409 Conflict
      const error = err as Record<string, unknown>;
      if (error && typeof error === "object" && "response" in error) {
        const response = error.response as Record<string, unknown>;
        if (response?.status === 409) {
          toast({
            title: "لا يمكن الحذف",
            description: "هذه الخطة مرتبطة باشتراكات أعضاء نشطة. يرجى تعطيل الخطة بدلاً من حذفها.",
            variant: "destructive",
          });
        } else {
          const message = err instanceof Error ? err.message : "فشل حذف الخطة";
          toast({ title: "فشل الحذف", description: message, variant: "destructive" });
        }
      } else {
        const message = err instanceof Error ? err.message : "فشل حذف الخطة";
        toast({ title: "فشل الحذف", description: message, variant: "destructive" });
      }
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (plan: MembershipApiItem) => {
    setToggling(plan.id);
    try {
      const res = await api.patch<{ message: string }>(`/membership-plans/${plan.id}/status`, { is_active: !plan.is_active });
      toast({ title: "تم التحديث", description: res?.data?.message || "تم تغيير حالة الخطة" });
      await refreshPlans();
    } catch (err) {
      const message = err instanceof Error ? err.message : "فشل تغيير الحالة";
      toast({ title: "فشل التحديث", description: message, variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return memberships;
    return memberships.filter((m) => {
      return (
        (m.plan_code || "").toLowerCase().includes(q) ||
        (m.name_ar || "").toLowerCase().includes(q) ||
        (m.name_en || "").toLowerCase().includes(q)
      );
    });
  }, [memberships, search]);

  // Reset to page 1 when search changes
  useEffect(() => { setPage(1); }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Helper to find member type name
  const getMemberTypeName = (id: number) => {
    const type = memberTypes.find(t => t.id === id);
    return type ? (type.name_ar || type.name_en) : id;
  };

  return (
    <RoleGuard privilege="VIEW_MEMBERSHIP_PLANS">
      <div className="h-full flex flex-col overflow-y-auto p-6 space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">خطط العضوية</h1>
          <RoleGuard privilege="CREATE_MEMBERSHIP_PLAN">
            <Button className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              إضافة خطة عضوية
            </Button>
          </RoleGuard>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث بالكود أو الاسم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 text-right"
              dir="rtl"
            />
          </div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الكود</TableHead>
                <TableHead>نوع العضوية</TableHead>
                <TableHead>الاسم</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>المدة (شهر)</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="w-[260px] text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((m) => (
                  <TableRow key={m.id} className="border-b border-border hover:bg-accent/10">
                    <TableCell className="font-poppins">{m.plan_code}</TableCell>
                    <TableCell>{getMemberTypeName(m.member_type_id)}</TableCell>
                    <TableCell className="font-medium">{m.name_ar}</TableCell>
                    <TableCell className="font-poppins">{m.price} {m.currency}</TableCell>
                    <TableCell className="font-poppins">{m.duration_months}</TableCell>
                    <TableCell>
                      <Badge className={m.is_active ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}>
                        {m.is_active ? "نشط" : "غير نشط"}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => setSelectedPlan(m)} className="gap-1">
                          <Eye className="h-3 w-3" /> عرض
                        </Button>

                        <RoleGuard privilege="UPDATE_MEMBERSHIP_PLAN">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-accent border-accent hover:bg-accent hover:text-accent-foreground"
                            onClick={() => openEdit(m)}
                          >
                            <Pencil className="h-3 w-3" /> تعديل
                          </Button>
                        </RoleGuard>

                        <RoleGuard privilege="DELETE_MEMBERSHIP_PLAN">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => setDeletePlan(m)}
                          >
                            <Trash2 className="h-3 w-3" /> حذف
                          </Button>
                        </RoleGuard>

                        <RoleGuard privilege="CHANGE_MEMBERSHIP_PLAN_STATUS">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => void toggleStatus(m)}
                            disabled={toggling === m.id}
                          >
                            <Power className="h-3 w-3" />
                            {toggling === m.id ? "..." : (m.is_active ? "تعطيل" : "تفعيل")}
                          </Button>
                        </RoleGuard>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    لا يوجد خطط عضوية مطابقة للبحث
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2" dir="rtl">
            <p className="text-sm text-muted-foreground">
              عرض {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} من {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>السابق</Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button key={p} size="sm" variant={p === page ? "default" : "outline"} onClick={() => setPage(p)}>{p}</Button>
              ))}
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>التالي</Button>
            </div>
          </div>
        )}

        <Dialog open={selectedPlan !== null} onOpenChange={() => setSelectedPlan(null)}>
          <DialogContent className="w-[95vw] sm:max-w-2xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base sm:text-lg">تفاصيل خطة العضوية</DialogTitle>
              <DialogDescription className="text-[11px] sm:text-sm">عرض البيانات الكاملة للخطة</DialogDescription>
            </DialogHeader>

            {selectedPlan && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2">
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">الكود</div>
                  <div className="font-poppins font-semibold text-sm sm:text-base">{selectedPlan.plan_code}</div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">نوع العضوية</div>
                  <div className="font-medium text-sm sm:text-base">{getMemberTypeName(selectedPlan.member_type_id)}</div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">الحالة</div>
                  <div className="font-medium text-sm sm:text-base">{selectedPlan.is_active ? "نشط" : "غير نشط"}</div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">الاسم (AR)</div>
                  <div className="font-medium text-sm sm:text-base">{selectedPlan.name_ar}</div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">الاسم (EN)</div>
                  <div className="font-medium text-sm sm:text-base" dir="ltr">{selectedPlan.name_en}</div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">السعر</div>
                  <div className="font-poppins font-semibold text-sm sm:text-base">{selectedPlan.price} {selectedPlan.currency}</div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">المدة (شهر)</div>
                  <div className="font-poppins font-semibold text-sm sm:text-base">{selectedPlan.duration_months}</div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">سعر التجديد</div>
                  <div className="font-poppins font-semibold text-sm sm:text-base">{selectedPlan.renewal_price} {selectedPlan.currency}</div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">قابل للتقسيط</div>
                  <div className="font-medium text-sm sm:text-base">{selectedPlan.is_installable ? "نعم" : "لا"}</div>
                </div>
              </div>
            )}

            <DialogFooter className="mt-4">
              <Button variant="outline" size="sm" onClick={() => setSelectedPlan(null)} className="h-8 sm:h-10 text-xs sm:text-sm">إغلاق</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editPlan !== null} onOpenChange={() => setEditPlan(null)}>
          <DialogContent className="w-[95vw] sm:max-w-2xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base sm:text-lg">تعديل خطة العضوية</DialogTitle>
              <DialogDescription className="text-[11px] sm:text-sm">قم بتحديث بيانات الخطة ثم احفظ</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2">
              <div>
                <div className="mb-1 text-[11px] sm:text-sm font-medium">الكود</div>
                <Input className="h-8 sm:h-10 text-[11px] sm:text-sm" value={editForm.plan_code} onChange={(e) => setEditForm((p) => ({ ...p, plan_code: e.target.value }))} />
              </div>
              <div>
                <div className="mb-1 text-[11px] sm:text-sm font-medium">العملة</div>
                <Input className="h-8 sm:h-10 text-[11px] sm:text-sm" value={editForm.currency} onChange={(e) => setEditForm((p) => ({ ...p, currency: e.target.value }))} dir="ltr" className="text-left" />
              </div>
              <div>
                <div className="mb-1 text-[11px] sm:text-sm font-medium">الاسم (AR)</div>
                <Input className="h-8 sm:h-10 text-[11px] sm:text-sm" value={editForm.name_ar} onChange={(e) => setEditForm((p) => ({ ...p, name_ar: e.target.value }))} />
              </div>
              <div>
                <div className="mb-1 text-[11px] sm:text-sm font-medium">الاسم (EN)</div>
                <Input className="h-8 sm:h-10 text-[11px] sm:text-sm" value={editForm.name_en} onChange={(e) => setEditForm((p) => ({ ...p, name_en: e.target.value }))} dir="ltr" className="text-left" />
              </div>
              <div>
                <div className="mb-1 text-[11px] sm:text-sm font-medium">السعر</div>
                <Input className="h-8 sm:h-10 text-[11px] sm:text-sm" type="number" value={editForm.price} onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))} />
              </div>
              <div>
                <div className="mb-1 text-[11px] sm:text-sm font-medium">سعر التجديد</div>
                <Input className="h-8 sm:h-10 text-[11px] sm:text-sm" type="number" value={editForm.renewal_price} onChange={(e) => setEditForm((p) => ({ ...p, renewal_price: e.target.value }))} />
              </div>
              <div>
                <div className="mb-1 text-[11px] sm:text-sm font-medium">المدة (شهر)</div>
                <Input className="h-8 sm:h-10 text-[11px] sm:text-sm" type="number" value={editForm.duration_months} onChange={(e) => setEditForm((p) => ({ ...p, duration_months: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm((p) => ({ ...p, is_active: e.target.checked }))}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 accent-[hsl(var(--huc-accentBlue))]"
                />
                <span className="text-[11px] sm:text-sm font-medium">نشط</span>
              </div>
            </div>

            <DialogFooter className="mt-4 flex-row gap-2 justify-end">
              <Button size="sm" className="h-8 sm:h-10 text-xs sm:text-sm flex-1 sm:flex-none" onClick={() => void saveEdit()} disabled={saving}>{saving ? "جارٍ الحفظ..." : "حفظ"}</Button>
              <Button size="sm" variant="outline" className="h-8 sm:h-10 text-xs sm:text-sm flex-1 sm:flex-none" onClick={() => setEditPlan(null)} disabled={saving}>إلغاء</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent className="w-[95vw] sm:max-w-2xl p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base sm:text-lg">إضافة خطة عضوية</DialogTitle>
              <DialogDescription className="text-[11px] sm:text-sm">أدخل بيانات الخطة الجديدة ثم اضغط حفظ</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-2">
              <div>
                <div className="mb-1 text-[11px] sm:text-sm font-medium">نوع العضوية</div>
                <Select
                  value={String(createForm.member_type_id)}
                  onValueChange={(val) => setCreateForm((p) => ({ ...p, member_type_id: val }))}
                >
                  <SelectTrigger className="h-8 sm:h-10 text-[11px] sm:text-sm">
                    <SelectValue placeholder="اختر نوع العضوية" />
                  </SelectTrigger>
                  <SelectContent>
                    {memberTypes.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name_ar} ({type.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="mb-1 text-[11px] sm:text-sm font-medium">العملة</div>
                <Input
                  className="h-8 sm:h-10 text-[11px] sm:text-sm"
                  value={createForm.currency}
                  onChange={(e) => setCreateForm((p) => ({ ...p, currency: e.target.value }))}
                  dir="ltr"
                  className="text-left"
                />
              </div>
              <div>
                <div className="mb-1 text-[11px] sm:text-sm font-medium">الكود</div>
                <Input className="h-8 sm:h-10 text-[11px] sm:text-sm" value={createForm.plan_code} onChange={(e) => setCreateForm((p) => ({ ...p, plan_code: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={createForm.is_active}
                  onChange={(e) => setCreateForm((p) => ({ ...p, is_active: e.target.checked }))}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 accent-[hsl(var(--huc-accentBlue))]"
                />
                <span className="text-[11px] sm:text-sm font-medium">نشط</span>
              </div>
              <div>
                <div className="mb-1 text-[11px] sm:text-sm font-medium">الاسم (AR)</div>
                <Input className="h-8 sm:h-10 text-[11px] sm:text-sm" value={createForm.name_ar} onChange={(e) => setCreateForm((p) => ({ ...p, name_ar: e.target.value }))} />
              </div>
              <div>
                <div className="mb-1 text-[11px] sm:text-sm font-medium">الاسم (EN)</div>
                <Input
                  className="h-8 sm:h-10 text-[11px] sm:text-sm"
                  value={createForm.name_en}
                  onChange={(e) => setCreateForm((p) => ({ ...p, name_en: e.target.value }))}
                  dir="ltr"
                  className="text-left"
                />
              </div>
              <div>
                <div className="mb-1 text-[11px] sm:text-sm font-medium">السعر</div>
                <Input className="h-8 sm:h-10 text-[11px] sm:text-sm" type="number" value={createForm.price} onChange={(e) => setCreateForm((p) => ({ ...p, price: e.target.value }))} />
              </div>
              <div>
                <div className="mb-1 text-[11px] sm:text-sm font-medium">سعر التجديد</div>
                <Input
                  className="h-8 sm:h-10 text-[11px] sm:text-sm"
                  type="number"
                  value={createForm.renewal_price}
                  onChange={(e) => setCreateForm((p) => ({ ...p, renewal_price: e.target.value }))}
                />
              </div>
              <div>
                <div className="mb-1 text-[11px] sm:text-sm font-medium">المدة (شهر)</div>
                <Input
                  className="h-8 sm:h-10 text-[11px] sm:text-sm"
                  type="number"
                  value={createForm.duration_months}
                  onChange={(e) => setCreateForm((p) => ({ ...p, duration_months: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter className="mt-4 flex-row gap-2 justify-end">
              <Button size="sm" className="h-8 sm:h-10 text-xs sm:text-sm flex-1 sm:flex-none" onClick={() => void saveCreate()} disabled={creating}>
                {creating ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
              <Button size="sm" variant="outline" className="h-8 sm:h-10 text-xs sm:text-sm flex-1 sm:flex-none" onClick={() => setCreateOpen(false)} disabled={creating}>إلغاء</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deletePlan !== null} onOpenChange={() => setDeletePlan(null)}>
          <DialogContent className="w-[95vw] sm:max-w-lg p-4 sm:p-6">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base sm:text-lg">تأكيد الحذف</DialogTitle>
              <DialogDescription className="text-[11px] sm:text-sm">
                هل أنت متأكد من حذف خطة العضوية {deletePlan?.name_ar}؟ لا يمكن التراجع عن هذا الإجراء.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-4 flex-row gap-2 justify-end">
              <Button size="sm" variant="destructive" className="h-8 sm:h-10 text-xs sm:text-sm flex-1 sm:flex-none" onClick={() => void confirmDelete()} disabled={deleting}>
                {deleting ? "جارٍ الحذف..." : "حذف"}
              </Button>
              <Button size="sm" variant="outline" className="h-8 sm:h-10 text-xs sm:text-sm flex-1 sm:flex-none" onClick={() => setDeletePlan(null)} disabled={deleting}>إلغاء</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RoleGuard>
  );
}
