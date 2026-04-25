import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Search, RefreshCw, Trophy, ChevronRight, ChevronLeft, Loader2, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../Component/StaffPagesComponents/ui/dialog";
import { Input } from "../Component/StaffPagesComponents/ui/input";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import { Badge } from "../Component/StaffPagesComponents/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Component/StaffPagesComponents/ui/select";
import api from "../services/api";
import { useToast } from "../hooks/use-toast";

// ─── Types ────────────────────────────────────────────────────────────────────

type SportItem = { id: number; name: string };

type SportApiItem = {
  id: number;
  name?: string;
  name_ar?: string;
  name_en?: string;
};

type MemberTeamSubscriptionResponse = {
  id: number;
  member_id: number;
  team_id: string;
  status: string;
  team?: {
    id: string;
    name_ar?: string;
    name_en?: string;
    sport?: {
      id: number;
      name_ar?: string;
      name_en?: string;
      name?: string;
    };
  };
};

type MemberApiItem = {
  id: string;
  first_name_ar: string;
  last_name_ar: string;
  first_name_en?: string;
  last_name_en?: string;
  national_id: string;
  status: string;
};

type MemberRow = {
  id: string;
  firstNameAr: string;
  lastNameAr: string;
  firstNameEn: string;
  lastNameEn: string;
  nationalId: string;
  status: string;
  isTeamPlayer: boolean;
  sports: SportItem[];
};

const PAGE_SIZE = 10;
const MAX_SPORTS_PER_MEMBER = 4;

const isActiveStatus = (status: string) => status === "active";

// ─── Component ────────────────────────────────────────────────────────────────

export default function SportsMembersPage() {
  const { toast } = useToast();

  const [memberTab, setMemberTab] = useState<"members" | "team-members">("members");

  // Member list state
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sports master list
  const [allSports, setAllSports] = useState<SportItem[]>([]);

  // Modal state
  const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sportTab, setSportTab] = useState<"all" | "subscribed" | "unsubscribed">("all");
  const [sportSearch, setSportSearch] = useState("");
  const [memberSports, setMemberSports] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // sport_id → list of teams for that sport (loaded on demand)
  const [sportTeams, setSportTeams] = useState<Record<number, { id: string; name_ar: string; name_en: string }[]>>({});
  // sport_id → selected team uuid
  const [selectedTeams, setSelectedTeams] = useState<Record<number, string>>({});

  // ── Load sports master list ONCE ──────────────────────────────────────────
  useEffect(() => {
    api
      .get<{ data?: SportApiItem[] }>("/sports")
      .then((res) => {
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setAllSports(
          list.map((item) => ({
            id: item.id,
            name: item.name_ar || item.name_en || item.name || "",
          }))
        );
      })
      .catch(() => {
        toast({ title: "تحذير", description: "فشل تحميل قائمة الرياضات", variant: "destructive" });
      });
  }, [toast]);

  // ── Fetch one page of ACTIVE members ─────────────────────────────────────
  const fetchPage = useCallback(
    async (page: number, searchTerm: string, tab: "members" | "team-members") => {
      setIsLoading(true);
      try {
        if (tab === "members") {
          // GET /api/members?status=active&limit=10&page=N
          const res = await api.get("/members", {
            params: { status: "active", limit: PAGE_SIZE, page },
          });
          const raw = res.data;
          const data: MemberApiItem[] = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.data)
              ? raw.data
              : [];
          const total: number = raw?.total ?? raw?.meta?.total ?? raw?.pagination?.total ?? data.length;

          // Filter by search client-side (name or national_id)
          const q = searchTerm.trim().toLowerCase();
          const filtered = q
            ? data.filter(
              (m) =>
                `${m.first_name_ar} ${m.last_name_ar}`.includes(searchTerm.trim()) ||
                `${m.first_name_en ?? ""} ${m.last_name_en ?? ""}`.toLowerCase().includes(q) ||
                m.national_id?.includes(q)
            )
            : data;

          // For each member, fetch their sports subscriptions
          const rows: MemberRow[] = await Promise.all(
            filtered.map(async (item) => {
              let memberSportList: SportItem[] = [];
              try {
                const sRes = await api.get(`/member-teams/member/${item.id}`);
                // Backend returns: { success: true, data: [{ id, member_id, team_id, team: { id, name_ar, name_en, sport: {...} } }] }
                const subs: MemberTeamSubscriptionResponse[] = Array.isArray(sRes.data?.data) ? sRes.data.data : [];

                console.log(`[SportsMembersPage] Member ${item.id} subscriptions:`, subs);

                // Extract sport from team.sport for each subscription
                memberSportList = subs
                  .map((sub) => {
                    // Check if sub has team.sport nested object
                    if (sub.team?.sport?.id) {
                      const sport = {
                        id: sub.team.sport.id,
                        name: sub.team.sport.name_ar || sub.team.sport.name_en || sub.team.sport.name || ""
                      };
                      console.log(`[SportsMembersPage] Extracted sport:`, sport);
                      return sport;
                    }
                    console.warn(`[SportsMembersPage] No sport found in subscription:`, sub);
                    return null;
                  })
                  .filter((s): s is SportItem => s !== null);

                console.log(`[SportsMembersPage] Member ${item.id} final sports list:`, memberSportList);
              } catch (error) {
                console.error(`Error fetching subscriptions for member ${item.id}:`, error);
                // Non-fatal — member may have no subscriptions
              }
              return {
                id: item.id,
                firstNameAr: item.first_name_ar || "",
                lastNameAr: item.last_name_ar || "",
                firstNameEn: item.first_name_en || "",
                lastNameEn: item.last_name_en || "",
                nationalId: item.national_id || "",
                status: item.status || "active",
                isTeamPlayer: false,
                sports: memberSportList,
              };
            })
          );

          const activeRows = rows.filter((r) => isActiveStatus(r.status));
          setMembers(activeRows);
          setTotalCount(q ? activeRows.length : total);
        } else {
          // GET /api/team-members with active filter
          const res = await api.get("/team-members", {
            params: { status: "active", limit: PAGE_SIZE, page },
          });
          const raw = res.data;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
          const total: number = raw?.total ?? raw?.meta?.total ?? raw?.pagination?.total ?? data.length;

          const q = searchTerm.trim().toLowerCase();
          // Team members have mixed snake_case/camelCase properties, need 'any' for compatibility
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const filtered: any[] = q
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? data.filter((m: any) =>
              `${m.firstNameAr ?? m.first_name_ar ?? ""} ${m.lastNameAr ?? m.last_name_ar ?? ""}`.includes(searchTerm.trim()) ||
              (m.nationalId ?? m.national_id)?.includes(q)
            )
            : data;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rows: MemberRow[] = filtered.map((item: any) => {
            // Backend already returns sports in correct format: { id: number, name: string }
            const rawSports: Array<{ id?: number | null; name?: string }> = Array.isArray(item.sports)
              ? item.sports
              : [];
            const memberSportList: SportItem[] = rawSports
              .filter((s): s is { id: number; name: string } => s.id != null && typeof s.id === 'number' && !!s.name)
              .map(s => ({ id: s.id, name: s.name }));

            return {
              id: item.id,
              firstNameAr: item.firstNameAr || item.first_name_ar || "",
              lastNameAr: item.lastNameAr || item.last_name_ar || "",
              firstNameEn: item.firstNameEn || item.first_name_en || "",
              lastNameEn: item.lastNameEn || item.last_name_en || "",
              nationalId: item.nationalId || item.national_id || "",
              status: item.membershipStatus || item.status || "active",
              isTeamPlayer: true,
              sports: memberSportList,
            };
          });

          const activeRows = rows.filter((r) => isActiveStatus(r.status));
          setMembers(activeRows);
          setTotalCount(q ? activeRows.length : total);
        }
      } catch {
        toast({
          title: "خطأ",
          description: "فشل تحميل قائمة الأعضاء",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  // Reload when page, tab, or search changes
  useEffect(() => {
    void fetchPage(currentPage, search, memberTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search, memberTab]);

  // Reset to page 1 when tab or confirmed search changes
  const handleTabChange = (tab: "members" | "team-members") => {
    setMemberTab(tab);
    setCurrentPage(1);
    setSearch("");
  };

  const handleSearchChange = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setCurrentPage(1);
    }, 300);
  };

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // ── Sports dialog filtering ───────────────────────────────────────────────
  const filteredSports = useMemo(() => {
    let list = allSports;
    if (sportSearch.trim()) {
      list = list.filter((s) => s.name.toLowerCase().includes(sportSearch.toLowerCase()));
    }
    if (sportTab === "subscribed") list = list.filter((s) => memberSports.has(s.id));
    if (sportTab === "unsubscribed") list = list.filter((s) => !memberSports.has(s.id));
    return list;
  }, [allSports, sportSearch, sportTab, memberSports]);

  // ── Open edit dialog ──────────────────────────────────────────────────────
  const openEdit = useCallback((member: MemberRow) => {
    setSelectedMember(member);
    setMemberSports(new Set(member.sports.map((s) => s.id)));
    setSportTab("all");
    setSportSearch("");
    setShowModal(true);
    toast({
      title: "تعديل رياضات",
      description: `تم فتح نافذة تعديل رياضات ${member.firstNameAr} ${member.lastNameAr}`,
    });
  }, [toast]);

  // ── Toggle sport checkbox ─────────────────────────────────────────────────
  const toggleSport = useCallback(
    (sport: SportItem) => {
      setMemberSports((prev) => {
        const next = new Set(prev);
        if (next.has(sport.id)) {
          next.delete(sport.id);
          // Remove team selection for this sport
          setSelectedTeams(st => { const n = { ...st }; delete n[sport.id]; return n; });
          toast({ title: "تمت الإزالة", description: `تم إلغاء تحديد "${sport.name}"` });
        } else {
          if (next.size >= MAX_SPORTS_PER_MEMBER) {
            toast({
              title: "الحد الأقصى",
              description: `لا يمكن إضافة أكثر من ${MAX_SPORTS_PER_MEMBER} رياضات لكل عضو`,
              variant: "destructive",
            });
            return prev;
          }
          next.add(sport.id);
          // Fetch teams for this sport if not cached and member is a regular member
          if (!selectedMember?.isTeamPlayer && !sportTeams[sport.id]) {
            api.get<{ data?: { id: string; name_ar: string; name_en: string }[] }>(`/teams?sport_id=${sport.id}`)
              .then(res => {
                const raw = res?.data as Record<string, unknown>;
                const data = Array.isArray(raw?.data)
                  ? (raw.data as { id: string; name_ar: string; name_en: string }[])
                  : Array.isArray(raw) ? (raw as { id: string; name_ar: string; name_en: string }[]) : [];
                setSportTeams(prev2 => ({ ...prev2, [sport.id]: data }));
              })
              .catch(() => {
                setSportTeams(prev2 => ({ ...prev2, [sport.id]: [] }));
              });
          }
          toast({ title: "تمت الإضافة", description: `تم تحديد "${sport.name}"` });
        }
        return next;
      });
    },
    [toast, sportTeams, selectedMember]
  );

  // ── Save sport assignments ────────────────────────────────────────────────
  const saveAssignments = async () => {
    if (!selectedMember) return;
    // Safety guard — should never happen due to toggleSport guard, but be defensive
    if (memberSports.size > MAX_SPORTS_PER_MEMBER) {
      toast({
        title: "خطأ في التحقق",
        description: `عدد الرياضات المختارة (${memberSports.size}) يتجاوز الحد الأقصى (${MAX_SPORTS_PER_MEMBER})`,
        variant: "destructive",
      });
      return;
    }
    setIsSaving(true);
    try {
      const currentSportIds = new Set(selectedMember.sports.map((s) => s.id));
      const sportsToAdd = Array.from(memberSports).filter((id) => !currentSportIds.has(id));
      const sportsToRemove = Array.from(currentSportIds).filter((id) => !memberSports.has(id));

      const errors: string[] = [];

      if (selectedMember.isTeamPlayer) {
        for (const sportId of sportsToRemove) {
          try {
            await api.delete(`/team-members/${selectedMember.id}/sports/${sportId}`);
          } catch {
            errors.push(`فشل إزالة الرياضة ${sportId}`);
          }
        }
        for (const sportId of sportsToAdd) {
          try {
            await api.post(`/team-members/${selectedMember.id}/sports`, { sportIds: [sportId] });
          } catch {
            errors.push(`فشل إضافة الرياضة ${sportId}`);
          }
        }
      } else {
        for (const teamId of sportsToRemove) {
          try {
            await api.delete(`/member-teams/member/${selectedMember.id}/remove-sport/${teamId}`);
          } catch {
            errors.push(`فشل إزالة الرياضة ${teamId}`);
          }
        }
        for (const sportId of sportsToAdd) {
          const teamId = selectedTeams[sportId];
          if (!teamId) {
            toast({
              title: "يرجى اختيار الفريق",
              description: "اختر فريق لكل رياضة قبل الحفظ",
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
          try {
            await api.post(`/member-teams/member/${selectedMember.id}/choose-sport`, { team_id: teamId });
          } catch {
            errors.push(`فشل إضافة الرياضة ${sportId}`);
          }
        }
      }

      // Update local member row immediately
      const updatedSports = allSports.filter((s) => memberSports.has(s.id));
      setMembers((prev) =>
        prev.map((m) => (m.id === selectedMember.id ? { ...m, sports: updatedSports } : m))
      );

      if (errors.length > 0) {
        toast({
          title: "تم الحفظ جزئياً",
          description: `تم الحفظ مع ${errors.length} خطأ: ${errors[0]}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "تم الحفظ ✓",
          description: `تم تحديث الرياضات لـ ${selectedMember.firstNameAr} بنجاح`,
        });
      }

      setShowModal(false);
    } catch {
      toast({
        title: "خطأ",
        description: "فشل في حفظ التعديلات، حاول مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col" dir="rtl">

      {/* ── Header ── */}
      <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-border bg-background shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              تعيين الرياضات
            </h1>
            <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5">
              الأعضاء النشطون فقط — الصفحة {currentPage} من {totalPages} ({totalCount} عضو)
            </p>
          </div>
          <button
            onClick={() => void fetchPage(currentPage, search, memberTab)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg border border-border hover:bg-muted transition-colors text-[10px] sm:text-sm text-muted-foreground disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? "animate-spin" : ""}`} />
            تحديث
          </button>
        </div>

        {/* Member type tabs */}
        <div className="flex items-center gap-1 mt-2 sm:mt-3">
          <button
            onClick={() => handleTabChange("members")}
            className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${memberTab === "members"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
              }`}
          >
            <Users className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            أعضاء النادي
          </button>
          <button
            onClick={() => handleTabChange("team-members")}
            className={`flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${memberTab === "team-members"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
              }`}
          >
            <Trophy className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            اللاعبين
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-6 sm:py-3 border-b border-border bg-muted/20 shrink-0 flex-wrap">
        {/* Search */}
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="ابحث بالاسم أو الرقم القومي..."
            defaultValue={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pr-8 sm:pr-9 h-9 sm:h-10 text-xs sm:text-sm"
          />
        </div>
        <Badge variant="outline" className="text-[10px] sm:text-xs text-muted-foreground shrink-0">
          {totalCount} نتيجة
        </Badge>

        <div className="flex-1 min-w-[10px]" />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1 sm:gap-1.5 ml-auto">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="p-1.5 sm:p-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
              aria-label="الصفحة السابقة"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`el-${i}`} className="px-1 text-muted-foreground text-[10px] sm:text-xs">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`min-w-[28px] sm:min-w-[36px] h-7 sm:h-9 rounded-md text-[10px] sm:text-xs font-medium transition-colors border ${currentPage === p
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted text-foreground"
                      }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="p-1.5 sm:p-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
              aria-label="الصفحة التالية"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
      </div>
      {/* ── Table area ── */}
      <div
        className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-sm">جارٍ تحميل الأعضاء النشطين...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <div className="rounded-full bg-muted/30 p-6 mb-4 w-fit mx-auto">
              <Users className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              لا يوجد أعضاء نشطون
            </h3>
            <p className="text-sm">
              {search ? `لا توجد نتائج مطابقة لـ "${search}"` : "لم يتم العثور على أعضاء نشطين"}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/70 backdrop-blur border-b border-border z-10">
              <tr>
                <th className="text-right px-2 py-2 sm:px-4 sm:py-3 font-semibold text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap align-middle w-8 sm:w-10">#</th>
                <th className="text-right pr-2 pl-2 py-2 sm:pr-4 sm:pl-4 sm:py-3 font-semibold text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap align-middle">الاسم</th>
                <th className="text-center px-2 py-2 sm:px-4 sm:py-3 font-semibold text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap align-middle">الحالة</th>
                <th className="text-center px-2 py-2 sm:px-4 sm:py-3 font-semibold text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap align-middle">الرياضات</th>
                <th className="text-center px-2 py-2 sm:px-4 sm:py-3 font-semibold text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap align-middle">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member, idx) => (
                <tr
                  key={member.id}
                  className="transition-colors hover:bg-muted/40"
                >
                  {/* # */}
                  <td className="px-2 py-2 sm:px-4 sm:py-3 text-[10px] sm:text-sm text-muted-foreground font-mono align-middle">
                    {(currentPage - 1) * PAGE_SIZE + idx + 1}
                  </td>

                  {/* Name */}
                  <td className="px-2 py-2 sm:px-4 sm:py-3 align-middle">
                    <p className="font-semibold leading-tight text-xs sm:text-sm">
                      {member.firstNameAr} {member.lastNameAr}
                    </p>
                    {(member.firstNameEn || member.lastNameEn) && (
                      <p className="text-[9px] sm:text-[11px] text-muted-foreground/70 italic tracking-wide">
                        {member.firstNameEn} {member.lastNameEn}
                      </p>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-2 py-2 sm:px-4 sm:py-3 text-center align-middle">
                    <span className={`inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[9px] sm:text-[11px] font-semibold ${isActiveStatus(member.status)
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-800"
                      }`}>
                      {isActiveStatus(member.status) ? "نشط" : member.status}
                    </span>
                  </td>

                  {/* Sports count */}
                  <td className="px-2 py-2 sm:px-4 sm:py-3 text-center align-middle">
                    <span className={`inline-flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium ${member.sports.length >= MAX_SPORTS_PER_MEMBER
                      ? "text-amber-600 font-semibold"
                      : "text-muted-foreground"
                      }`}>
                      <Trophy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      {member.sports.length} / {MAX_SPORTS_PER_MEMBER}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-2 py-2 sm:px-4 sm:py-3 align-middle text-center">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-1.5 border-primary/40 text-primary hover:bg-primary/10 text-[10px] sm:text-xs"
                      onClick={() => openEdit(member)}
                    >
                      تعديل الرياضات
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}


      {/* ── Sports Assignment Modal ── */}
      <Dialog open={showModal} onOpenChange={(open) => {
        if (!isSaving) {
          setShowModal(open);
          if (!open) {
            setSelectedTeams({});
            setSportTeams({});
          }
        }
      }}>
        <DialogContent className="w-[95vw] sm:max-w-2xl p-4 sm:p-6" dir="rtl">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base sm:text-xl">
              {selectedMember
                ? `تعيين رياضات — ${selectedMember.firstNameAr} ${selectedMember.lastNameAr}`
                : "تعيين الرياضات"}
            </DialogTitle>
            <DialogDescription className="text-[11px] sm:text-sm leading-relaxed">
              اختر الرياضات التي تريد تعيينها. التغييرات تُطبَّق عند الضغط على "حفظ".
              <span className="block mt-0.5 text-amber-600 font-medium">الحد الأقصى {MAX_SPORTS_PER_MEMBER} رياضات لكل عضو</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 py-1 sm:py-2">
            {/* Sport tabs */}
            <div className="flex gap-1.5 sm:gap-2 border-b border-border overflow-x-auto scrollbar-none pb-0.5">
              {(["all", "subscribed", "unsubscribed"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSportTab(tab)}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 border-b-2 font-medium text-[11px] sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${sportTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {tab === "all"
                    ? "جميع الرياضات"
                    : tab === "subscribed"
                      ? `المشترك فيها (${memberSports.size})`
                      : "غير مشترك فيها"}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن رياضة..."
                value={sportSearch}
                onChange={(e) => setSportSearch(e.target.value)}
                className="pr-9 sm:pr-10 h-8 sm:h-10 text-xs sm:text-sm"
              />
            </div>

            {/* Sports list */}
            <div className="space-y-1 max-h-60 sm:max-h-72 overflow-y-auto border border-border rounded-lg p-1.5 sm:p-2 bg-muted/10">
              {filteredSports.length > 0 ? (
                filteredSports.map((sport) => {
                  const checked = memberSports.has(sport.id);
                  const disableUnchecked = !checked && memberSports.size >= MAX_SPORTS_PER_MEMBER;
                  return (
                    <label
                      key={sport.id}
                      className={`flex flex-col gap-1 p-2 sm:p-2.5 rounded-md transition-colors ${disableUnchecked
                          ? "opacity-40 cursor-not-allowed"
                          : checked
                            ? "bg-primary/8 hover:bg-primary/12 cursor-pointer"
                            : "hover:bg-muted/60 cursor-pointer"
                        }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disableUnchecked}
                          onChange={() => toggleSport(sport)}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-border accent-primary disabled:cursor-not-allowed"
                        />
                        <span className={`text-xs sm:text-sm font-medium flex-1 ${disableUnchecked ? "text-muted-foreground" : ""}`}>{sport.name}</span>
                        {checked && (
                          <span className="text-[9px] sm:text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            مضاف
                          </span>
                        )}
                      </div>
                      {/* Team selector for regular (non-team-player) members */}
                      {checked && selectedMember && !selectedMember.isTeamPlayer && (
                        <div className="mr-6 sm:mr-7 mt-1">
                          <Select
                            value={selectedTeams[sport.id] ?? ""}
                            onValueChange={(v) => setSelectedTeams(prev => ({ ...prev, [sport.id]: v }))}
                          >
                            <SelectTrigger className="h-7 sm:h-8 text-[10px] sm:text-xs w-full sm:w-48">
                              <SelectValue placeholder="اختر الفريق" />
                            </SelectTrigger>
                            <SelectContent>
                              {(sportTeams[sport.id] ?? []).length === 0 ? (
                                <SelectItem value="__loading" disabled className="text-[10px] sm:text-xs">جاري التحميل...</SelectItem>
                              ) : (
                                (sportTeams[sport.id] ?? []).map(team => (
                                  <SelectItem key={team.id} value={team.id} className="text-[10px] sm:text-xs">
                                    {team.name_ar || team.name_en}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </label>
                  );
                })
              ) : (
                <div className="text-center py-6 sm:py-8 text-muted-foreground text-[11px] sm:text-sm">
                  {sportTab === "subscribed"
                    ? "لا توجد رياضات مشترك فيها حالياً"
                    : sportTab === "unsubscribed"
                      ? "جميع الرياضات مشترك فيها بالفعل"
                      : "لا توجد رياضات مطابقة"}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className={`text-[10px] sm:text-xs font-semibold ${memberSports.size >= MAX_SPORTS_PER_MEMBER
                ? "text-amber-600"
                : "text-muted-foreground"
                }`}>
                {memberSports.size} / {MAX_SPORTS_PER_MEMBER} رياضات
              </span>
              <div className="flex gap-1.5 sm:gap-2 flex-1 sm:flex-none justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  disabled={isSaving}
                  className="h-8 sm:h-9 text-xs flex-1 sm:flex-none"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={() => void saveAssignments()}
                  disabled={isSaving}
                  size="sm"
                  className="h-8 sm:h-9 text-xs gap-1.5 sm:gap-2 flex-1 sm:flex-none"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                      جارٍ...
                    </>
                  ) : (
                    "حفظ"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
