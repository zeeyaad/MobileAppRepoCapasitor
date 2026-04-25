import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Save, Check, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StaffService } from "../services/staffService";

import api from "../api/axios";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../Component/StaffPagesComponents/ui/card";
import { Input } from "../Component/StaffPagesComponents/ui/input";
import { Label } from "../Component/StaffPagesComponents/ui/label";
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
import { useToast } from "../hooks/use-toast";

type StaffType = {
  id: number;
  code?: string;
  name_ar?: string;
  name_en?: string;
  title_ar?: string;
  title_en?: string;
};

type StaffRow = {
  id: string;
  firstNameEn?: string;
  firstNameAr?: string;
  lastNameEn?: string;
  lastNameAr?: string;
  email?: string;
  nationalId: string;
  phone: string;
  address?: string;
  staffTypeId: number;
  staffTypeLabel: string;
  status?: string;
  createdAt?: string;
  employmentStartDate?: string;
  employmentEndDate?: string | null;
};

type StaffApiItem = {
  id: number;
  first_name_en?: string;
  first_name_ar?: string;
  last_name_en?: string;
  last_name_ar?: string;
  email?: string;
  national_id?: string;
  phone?: string;
  address?: string;
  staff_type_id?: number | string;
  staff_type?: string;
  status?: string;
  created_at?: string;
  employment_start_date?: string;
  employment_end_date?: string | null;
};

type StaffListResponse = {
  success: boolean;
  data: StaffApiItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

type StaffDetailsResponse = {
  success: boolean;
  data: {
    id: number;
    first_name_en?: string;
    first_name_ar?: string;
    last_name_en?: string;
    last_name_ar?: string;
    email?: string;
    national_id?: string;
    phone?: string;
    address?: string;
    staff_type_id?: number | string;
    employment_start_date?: string;
    employment_end_date?: string | null;
    status?: string;
    assigned_packages?: Array<{ id: number; code: string; name_en?: string; name_ar?: string }>;
    privileges?: Array<{ id: number; code: string; name_en?: string; name_ar?: string }>;
  };
};

type PrivilegeApiItem = {
  id: number;
  code: string;
  name_en?: string;
  name_ar?: string;
  module?: string;
};

type PackageApiItem = {
  id: number;
  code?: string;
  name_ar?: string;
  name_en?: string;
  description_ar?: string;
  description_en?: string;
};

type PackageOption = {
  key: string;
  backendId: number | null;
  source: "backend" | "local";
  code: string;
  name: string;
  description?: string;
  privilegeCodes: string[];
};

const LOCAL_PACKAGES_STORAGE_KEY = "huc_local_privilege_packages";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getLocalPackagePrivilegeCodes = (payload: Record<string, unknown>): string[] => {
  const directCodes = Array.isArray(payload.privilege_codes)
    ? payload.privilege_codes.map((code) => String(code ?? "").trim())
    : [];

  const nestedCodes = Array.isArray(payload.privileges)
    ? payload.privileges
      .map((item) => {
        if (!isRecord(item)) return "";
        return String(item.code ?? item.id ?? "").trim();
      })
    : [];

  return Array.from(new Set([...directCodes, ...nestedCodes].filter(Boolean)));
};

const readLocalPackageOptions = (): PackageOption[] => {
  const stored = localStorage.getItem(LOCAL_PACKAGES_STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    const options: PackageOption[] = [];
    parsed.forEach((item, index) => {
      if (!isRecord(item)) return;

      const localRawId = String(item.local_id ?? item.id ?? `pkg_${index + 1}`);
      const name = String(item.name_ar ?? item.name_en ?? item.name ?? `Local Package ${index + 1}`).trim();
      const code = String(item.code ?? `LOCAL_${index + 1}`).trim() || `LOCAL_${index + 1}`;
      const descriptionValue = String(item.description_ar ?? item.description_en ?? "").trim();

      options.push({
        key: `local:${localRawId}`,
        backendId: null,
        source: "local",
        code,
        name: name || `Local Package ${index + 1}`,
        description: descriptionValue || undefined,
        privilegeCodes: getLocalPackagePrivilegeCodes(item),
      });
    });

    return options;
  } catch {
    return [];
  }
};

const normalizePrivilegesResponse = (response: unknown): PrivilegeApiItem[] => {
  if (!isRecord(response)) return [];
  const payload = response.data;

  if (Array.isArray(payload)) {
    const privileges: PrivilegeApiItem[] = [];
    payload.forEach((item) => {
      if (!isRecord(item)) return;
      const id = Number(item.id);
      const code = String(item.code ?? "").trim();
      if (!Number.isFinite(id) || !code) return;
      privileges.push({
        id,
        code,
        name_en: String(item.name_en ?? ""),
        name_ar: String(item.name_ar ?? ""),
        module: String(item.module ?? "General"),
      });
    });
    return privileges;
  }

  if (!isRecord(payload)) return [];

  const privileges: PrivilegeApiItem[] = [];
  Object.entries(payload).forEach(([moduleName, list]) => {
    if (!Array.isArray(list)) return;

    list.forEach((item) => {
      if (!isRecord(item)) return;
      const id = Number(item.id);
      const code = String(item.code ?? "").trim();
      if (!Number.isFinite(id) || !code) return;

      privileges.push({
        id,
        code,
        name_en: String(item.name_en ?? ""),
        name_ar: String(item.name_ar ?? ""),
        module: String((item.module ?? moduleName) || "General"),
      });
    });
  });

  return privileges;
};

const normalizePackagePrivilegeCodes = (response: unknown): string[] => {
  const rawList = isRecord(response) && Array.isArray(response.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

  return Array.from(
    new Set(
      rawList
        .map((item) => {
          if (!isRecord(item)) return "";
          return String(item.code ?? "").trim();
        })
        .filter(Boolean),
    ),
  );
};

const STATIC_STAFF_TYPES: StaffType[] = [
  { id: 1, code: "ADMIN", name_en: "Admin", name_ar: "المسئول" },
  { id: 2, code: "CEO", name_en: "Executive Director", name_ar: "المدير التنفيذى" },
  { id: 3, code: "DEPUTY_CEO", name_en: "Deputy Executive Director", name_ar: "نائب المدير التنفيذى" },
  { id: 4, code: "EVENTS_MANAGER", name_en: "Events and Activities Manager", name_ar: "مدير الفاعليات والاحداث" },
  { id: 5, code: "EXEC_SECRETARY_MANAGER", name_en: "Executive Secretariat Manager", name_ar: "مدير السكرتارية التنفيذىة" },
  { id: 6, code: "MEDIA_CENTER_MANAGER", name_en: "Media Center Manager", name_ar: "مدير المركز الاعلامى" },
  { id: 7, code: "SPORT_ACTIVITY_SPECIALIST", name_en: "Sports Activity Specialist", name_ar: "اخصائى النشاط الرياضى" },
  { id: 8, code: "FINANCE_MANAGER", name_en: "Finance Manager", name_ar: "مدير الشئون المالية" },
  { id: 9, code: "HR_MEMBERSHIP_MANAGER", name_en: "HR and Membership Affairs Manager", name_ar: "مدير الموارد البشرية وشئون العضوية" },
  { id: 10, code: "CONTRACTS_MANAGER", name_en: "Contracts Manager", name_ar: "مدير التعاقدات" },
  { id: 11, code: "MAINTENANCE_MANAGER", name_en: "Maintenance Manager", name_ar: "مدير الصيانة" },
  { id: 12, code: "SPORT_ACTIVITY_MANAGER", name_en: "Sports Activity Manager", name_ar: "مدير النشاط الرياضى" },
  { id: 13, code: "SOCIAL_ACTIVITY_MANAGER", name_en: "Social Activity Manager", name_ar: "مدير النشاط الاجتماعى" },
  { id: 14, code: "PR_MANAGER", name_en: "Public Relations Manager", name_ar: "مدير العلاقات العامة" },
  { id: 15, code: "MEDIA_CENTER_SPECIALIST", name_en: "Media Center Specialist", name_ar: "اخصائى المركز الاعلامى" },
  { id: 16, code: "MAINTENANCE_OFFICER", name_en: "Maintenance Officer", name_ar: "مسئول الصيانة" },
  { id: 17, code: "ADMIN_OFFICER", name_en: "Administrative Affairs Officer", name_ar: "مسئول الشئون الادارية" },
  { id: 18, code: "SUPPORT_SERVICES", name_en: "Support Services", name_ar: "خدمات معاونة" },
  { id: 19, code: "SPORT_MANAGER", name_en: "Sport Activity Manager", name_ar: "مدير الأنشطة الرياضية" },
  { id: 20, code: "SPORT_SPECIALIST", name_en: "Sport Activity Specialist", name_ar: "أخصائي الأنشطة الرياضية" },
];

export default function AddNewStaffPage() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [firstNameEn, setFirstNameEn] = useState("");
  const [firstNameAr, setFirstNameAr] = useState("");
  const [lastNameEn, setLastNameEn] = useState("");
  const [lastNameAr, setLastNameAr] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [staffTypeId, setStaffTypeId] = useState<string>("");
  const [employmentStartDate, setEmploymentStartDate] = useState("");
  const [employmentEndDate, setEmploymentEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Package & Privilege State
  const [backendPackages, setBackendPackages] = useState<PackageApiItem[]>([]);
  const [localPackages, setLocalPackages] = useState<PackageOption[]>([]);
  const [selectedPackageKeys, setSelectedPackageKeys] = useState<string[]>([]);
  const [allPrivileges, setAllPrivileges] = useState<PrivilegeApiItem[]>([]);
  const [selectedExtraPrivilegeIds, setSelectedExtraPrivilegeIds] = useState<number[]>([]);
  const [packagePrivilegeCodesByKey, setPackagePrivilegeCodesByKey] = useState<Record<string, string[]>>({});
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [loadingPrivileges, setLoadingPrivileges] = useState(false);

  // Credentials Dialog State
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

  const [staffRows, setStaffRows] = useState<StaffRow[]>([]);
  const [staffPage, setStaffPage] = useState(1);
  const [staffLimit] = useState(10);
  const [staffTotal, setStaffTotal] = useState(0);
  const [staffPages, setStaffPages] = useState(1);
  const [staffLoading, setStaffLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffRow | null>(null);
  const [selectedStaffDetails, setSelectedStaffDetails] = useState<StaffDetailsResponse["data"] | null>(null);
  const [staffDetailsLoading, setStaffDetailsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaffRow | null>(null);

  const [editTarget, setEditTarget] = useState<StaffRow | null>(null);
  const [editFirstNameEn, setEditFirstNameEn] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Dynamic Staff Types State
  const [staffTypes, setStaffTypes] = useState<StaffType[]>(STATIC_STAFF_TYPES);

  useEffect(() => {
    const loadStaffTypes = async () => {
      try {
        const res = await StaffService.getStaffTypes();
        // Expected response format: { success: true, count: N, data: [...] }
        if (res.success && Array.isArray(res.data)) {
          setStaffTypes(res.data);
        }
      } catch (error) {
        console.error("Failed to load staff types", error);
        // Fallback to static types is already set
      }
    };
    loadStaffTypes();
  }, []);

  const staffTypeOptions = useMemo(
    () =>
      staffTypes.map((t) => ({
        id: t.id,
        label: t.name_ar || t.title_ar || t.name_en || t.title_en || `#${t.id}`,
      })),
    [staffTypes],
  );

  const staffTypeLabelById = useMemo(() => {
    const map = new Map<number, string>();
    for (const opt of staffTypeOptions) map.set(opt.id, opt.label);
    return map;
  }, [staffTypeOptions]);

  const packageOptions = useMemo<PackageOption[]>(() => {
    const backendOptions = backendPackages.map((pkg) => {
      const key = `backend:${pkg.id}`;
      return {
        key,
        backendId: pkg.id,
        source: "backend" as const,
        code: pkg.code || `PKG_${pkg.id}`,
        name: pkg.name_ar || pkg.name_en || pkg.code || `Package #${pkg.id}`,
        description: pkg.description_ar || pkg.description_en,
        privilegeCodes: packagePrivilegeCodesByKey[key] || [],
      };
    });

    return [...backendOptions, ...localPackages];
  }, [backendPackages, localPackages, packagePrivilegeCodesByKey]);

  const selectedPackages = useMemo(
    () => packageOptions.filter((pkg) => selectedPackageKeys.includes(pkg.key)),
    [packageOptions, selectedPackageKeys],
  );

  const privilegeIdByCode = useMemo(() => {
    const map = new Map<string, number>();
    allPrivileges.forEach((privilege) => {
      map.set(privilege.code, privilege.id);
    });
    return map;
  }, [allPrivileges]);

  const privilegeCodeById = useMemo(() => {
    const map = new Map<number, string>();
    allPrivileges.forEach((privilege) => {
      map.set(privilege.id, privilege.code);
    });
    return map;
  }, [allPrivileges]);

  const selectedPackagePrivilegeCodes = useMemo(() => {
    const codeSet = new Set<string>();
    selectedPackages.forEach((pkg) => {
      pkg.privilegeCodes.forEach((code) => codeSet.add(code));
    });
    return codeSet;
  }, [selectedPackages]);

  const groupedPrivileges = useMemo(() => {
    const groupMap = new Map<string, PrivilegeApiItem[]>();

    allPrivileges.forEach((privilege) => {
      const moduleName = privilege.module || "General";
      const current = groupMap.get(moduleName) || [];
      current.push(privilege);
      groupMap.set(moduleName, current);
    });

    return Array.from(groupMap.entries())
      .map(([module, items]) => ({
        module,
        items: [...items].sort((a, b) =>
          (a.name_ar || a.name_en || a.code).localeCompare(b.name_ar || b.name_en || b.code),
        ),
      }))
      .sort((a, b) => a.module.localeCompare(b.module));
  }, [allPrivileges]);

  const fetchStaffList = useCallback(
    async (page: number) => {
      setStaffLoading(true);
      try {
        const res = await api.get<StaffListResponse>("/staff", {
          params: { page, limit: staffLimit },
        });

        const payload = res.data;
        const rows: StaffRow[] = (payload?.data || []).map((item) => {
          const rawTypeId = item.staff_type_id ?? 0;
          const typeIdNum = Number(rawTypeId);
          const typeId = Number.isFinite(typeIdNum) ? typeIdNum : 0;

          const typeLabelFromApi = item.staff_type;
          return {
            id: String(item.id),
            firstNameEn: item.first_name_en,
            firstNameAr: item.first_name_ar,
            lastNameEn: item.last_name_en,
            lastNameAr: item.last_name_ar,
            email: item.email,
            nationalId: item.national_id || "-",
            phone: item.phone || "-",
            address: item.address,
            staffTypeId: typeId,
            staffTypeLabel:
              staffTypeLabelById.get(typeId) ||
              typeLabelFromApi ||
              (typeId ? String(typeId) : "-"),
            status: item.status,
            createdAt: item.created_at,
            employmentStartDate: item.employment_start_date,
            employmentEndDate: item.employment_end_date ?? null,
          };
        });

        setStaffRows(rows);
        setStaffTotal(payload?.pagination?.total ?? 0);
        setStaffPages(payload?.pagination?.pages ?? 1);
      } catch (err) {
        const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
        toast({
          title: "تعذر تحميل قائمة الموظفين",
          description: message,
          variant: "destructive",
        });
        setStaffRows([]);
        setStaffTotal(0);
        setStaffPages(1);
      } finally {
        setStaffLoading(false);
      }
    },
    [staffLimit, staffTypeLabelById, toast],
  );

  useEffect(() => {
    void fetchStaffList(staffPage);
  }, [fetchStaffList, staffPage]);

  const loadLocalPackages = useCallback(() => {
    setLocalPackages(readLocalPackageOptions());
  }, []);

  useEffect(() => {
    loadLocalPackages();

    const handleStorage = () => loadLocalPackages();
    window.addEventListener("focus", handleStorage);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, [loadLocalPackages]);

  useEffect(() => {
    const loadPackages = async () => {
      setLoadingPackages(true);
      try {
        const response = await StaffService.getPackages();
        if (response.success && Array.isArray(response.data)) {
          setBackendPackages(response.data);
        } else {
          setBackendPackages([]);
        }
      } catch (error) {
        console.error("Failed to load backend packages", error);
        setBackendPackages([]);
      } finally {
        setLoadingPackages(false);
      }
    };

    void loadPackages();
  }, []);

  useEffect(() => {
    const loadPrivileges = async () => {
      setLoadingPrivileges(true);
      try {
        const response = await StaffService.getAllPrivileges();
        setAllPrivileges(normalizePrivilegesResponse(response));
      } catch (error) {
        console.error("Failed to load privileges", error);
        setAllPrivileges([]);
      } finally {
        setLoadingPrivileges(false);
      }
    };

    void loadPrivileges();
  }, []);

  useEffect(() => {
    const validPackageKeys = new Set(packageOptions.map((pkg) => pkg.key));

    setSelectedPackageKeys((prev) => {
      const filtered = prev.filter((key) => validPackageKeys.has(key));
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [packageOptions]);

  useEffect(() => {
    const missingBackendPackages = selectedPackages.filter(
      (pkg) => pkg.source === "backend" && pkg.backendId !== null && !packagePrivilegeCodesByKey[pkg.key],
    );

    if (missingBackendPackages.length === 0) return;

    let cancelled = false;

    const loadMissingPackagePrivileges = async () => {
      const updates: Record<string, string[]> = {};

      await Promise.all(
        missingBackendPackages.map(async (pkg) => {
          try {
            const response = await StaffService.getPackagePrivileges(Number(pkg.backendId));
            updates[pkg.key] = normalizePackagePrivilegeCodes(response);
          } catch (error) {
            console.error(`Failed to load privileges for package ${pkg.backendId}`, error);
            updates[pkg.key] = [];
          }
        }),
      );

      if (cancelled || Object.keys(updates).length === 0) return;
      setPackagePrivilegeCodesByKey((prev) => ({ ...prev, ...updates }));
    };

    void loadMissingPackagePrivileges();

    return () => {
      cancelled = true;
    };
  }, [packagePrivilegeCodesByKey, selectedPackages]);

  useEffect(() => {
    setSelectedExtraPrivilegeIds((prev) => {
      const filtered = prev.filter((id) => {
        const code = privilegeCodeById.get(id);
        return !code || !selectedPackagePrivilegeCodes.has(code);
      });
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [privilegeCodeById, selectedPackagePrivilegeCodes]);

  const togglePackage = (packageKey: string) => {
    setSelectedPackageKeys((prev) =>
      prev.includes(packageKey)
        ? prev.filter((key) => key !== packageKey)
        : [...prev, packageKey],
    );
  };

  const toggleExtraPrivilege = (privilegeId: number) => {
    setSelectedExtraPrivilegeIds((prev) =>
      prev.includes(privilegeId)
        ? prev.filter((id) => id !== privilegeId)
        : [...prev, privilegeId],
    );
  };

  const handleViewStaff = useCallback(
    async (row: StaffRow) => {
      setSelectedStaff(row);
      setSelectedStaffDetails(null);
      setShowDetails(true);

      setStaffDetailsLoading(true);
      try {
        const res = await api.get<StaffDetailsResponse>(`/staff/${row.id}`);
        setSelectedStaffDetails(res.data.data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
        toast({
          title: "تعذر تحميل تفاصيل الموظف",
          description: message,
          variant: "destructive",
        });
      } finally {
        setStaffDetailsLoading(false);
      }
    },
    [toast],
  );

  const openEditDialog = useCallback(
    (row: StaffRow) => {
      setEditTarget(row);

      const detailsForRow = selectedStaffDetails && String(selectedStaffDetails.id) === row.id ? selectedStaffDetails : null;

      setEditFirstNameEn(detailsForRow?.first_name_en ?? row.firstNameEn ?? "");
      setEditPhone(detailsForRow?.phone ?? row.phone ?? "");
      setEditAddress(detailsForRow?.address ?? row.address ?? "");
    },
    [selectedStaffDetails],
  );

  const handleUpdateStaff = useCallback(
    async () => {
      if (!editTarget) return;

      const body: Record<string, string> = {};
      if (editFirstNameEn.trim()) body.first_name_en = editFirstNameEn.trim();
      if (editPhone.trim()) body.phone = editPhone.trim();
      if (editAddress.trim()) body.address = editAddress.trim();

      if (Object.keys(body).length === 0) {
        toast({
          title: "لا توجد تغييرات",
          description: "قم بتعديل حقل واحد على الأقل قبل الحفظ",
        });
        return;
      }

      setEditSubmitting(true);
      try {
        const res = await api.put<any>(`/staff/${editTarget.id}`, body);

        toast({
          title: "تم التحديث",
          description: res?.data?.message || "تم تحديث بيانات الموظف بنجاح",
        });

        setEditTarget(null);

        if (selectedStaffDetails && String(selectedStaffDetails.id) === editTarget.id) {
          setSelectedStaffDetails((prev) => (prev ? { ...prev, ...body } : prev));
        }

        await fetchStaffList(staffPage);
      } catch (err) {
        const message = err instanceof Error ? err.message : "حدث خطأ غير متوقع";
        toast({
          title: "فشل التحديث",
          description: message,
          variant: "destructive",
        });
      } finally {
        setEditSubmitting(false);
      }
    },
    [editAddress, editFirstNameEn, editPhone, editTarget, fetchStaffList, selectedStaffDetails, staffPage, toast],
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !firstNameEn.trim() ||
      !lastNameEn.trim() ||
      !nationalId.trim() ||
      !phone.trim() ||
      !staffTypeId.trim() ||
      !employmentStartDate.trim()
    ) {
      toast({
        title: "بيانات غير مكتملة",
        description: "يرجى إدخال جميع الحقول الأساسية (الاسم الإنجليزي، الرقم القومي، الهاتف، الوظيفة، تاريخ البدء)",
        variant: "destructive",
      });
      return;
    }

    const staffTypeIdNum = Number(staffTypeId);
    if (!Number.isFinite(staffTypeIdNum) || staffTypeIdNum <= 0) {
      toast({
        title: "قيمة غير صحيحة",
        description: "يرجى إدخال staff_type_id رقم صحيح",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const registerData = {
        first_name_en: firstNameEn,
        first_name_ar: firstNameAr,
        last_name_en: lastNameEn,
        last_name_ar: lastNameAr,
        national_id: nationalId,
        phone,
        address,
        staff_type_id: staffTypeIdNum,
        employment_start_date: employmentStartDate,
        employment_end_date: employmentEndDate.trim() ? employmentEndDate : null,
      };

      const result = await StaffService.registerStaff(registerData);

      if (result.success && result.staff_id) {
        const currentSelectedPackages = [...selectedPackages];

        const backendPackageIdsForAssign = currentSelectedPackages
          .filter((pkg) => pkg.source === "backend" && pkg.backendId !== null)
          .map((pkg) => Number(pkg.backendId));

        const backendPackageCodes = new Set<string>();
        const localPackageCodes = new Set<string>();

        for (const pkg of currentSelectedPackages) {
          if (pkg.source === "local") {
            pkg.privilegeCodes.forEach((code) => localPackageCodes.add(code));
            continue;
          }

          let resolvedCodes = pkg.privilegeCodes;

          if (resolvedCodes.length === 0 && pkg.backendId !== null) {
            try {
              const response = await StaffService.getPackagePrivileges(Number(pkg.backendId));
              resolvedCodes = normalizePackagePrivilegeCodes(response);
              setPackagePrivilegeCodesByKey((prev) => ({
                ...prev,
                [pkg.key]: resolvedCodes,
              }));
            } catch (error) {
              console.error(`Failed to fetch privileges for package ${pkg.backendId}`, error);
              resolvedCodes = [];
            }
          }

          resolvedCodes.forEach((code) => backendPackageCodes.add(code));
        }

        if (backendPackageIdsForAssign.length > 0) {
          try {
            await StaffService.assignPackages(result.staff_id, backendPackageIdsForAssign);
          } catch (pkgError) {
            console.error("Failed to assign packages", pkgError);
            toast({
              title: "تنبيه",
              description: "تم إنشاء الموظف ولكن فشل تعيين الحزم",
              variant: "destructive",
            });
          }
        }

        const unresolvedLocalCodes: string[] = [];
        const localPackagePrivilegeIds = Array.from(localPackageCodes).flatMap((code) => {
          const privilegeId = privilegeIdByCode.get(code);
          if (!privilegeId) {
            unresolvedLocalCodes.push(code);
            return [];
          }
          return [privilegeId];
        });

        const extraPrivilegeIds = selectedExtraPrivilegeIds.filter((privilegeId) => {
          const code = privilegeCodeById.get(privilegeId);
          return !code || !backendPackageCodes.has(code);
        });

        const privilegeIdsToGrant = Array.from(
          new Set([...localPackagePrivilegeIds, ...extraPrivilegeIds]),
        );

        if (privilegeIdsToGrant.length > 0) {
          try {
            await StaffService.grantPrivileges(
              result.staff_id,
              privilegeIdsToGrant,
              "Assigned during staff creation",
            );
          } catch (grantError) {
            console.error("Failed to grant extra privileges", grantError);
            toast({
              title: "تنبيه",
              description: "تم إنشاء الموظف ولكن فشل تعين بعض الصلاحيات الإضافية",
              variant: "destructive",
            });
          }
        }

        if (unresolvedLocalCodes.length > 0) {
          const preview = unresolvedLocalCodes.slice(0, 3).join(", ");
          toast({
            title: "Package mapping notice",
            description: `Some local package privileges could not be mapped to backend IDs: ${preview}`,
            variant: "destructive",
          });
        }

        // Show Credentials Dialog
        setCreatedCredentials({
          email: `staff.${nationalId}@helwan-club.local`,
          password: nationalId
        });

        toast({
          title: "تم إنشاء الموظف",
          description: "تمت إضافة الموظف بنجاح",
        });

        await fetchStaffList(staffPage);

        // Reset Form
        setFirstNameEn("");
        setFirstNameAr("");
        setLastNameEn("");
        setLastNameAr("");
        setNationalId("");
        setPhone("");
        setAddress("");
        setStaffTypeId("");
        setEmploymentStartDate("");
        setEmploymentEndDate("");
        setSelectedPackageKeys([]);
        setSelectedExtraPrivilegeIds([]);
      }
    } catch (err: any) {
      // Handle both standard Error objects and custom API error objects
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        (err instanceof Error ? err.message : "حدث خطأ غير متوقع");

      toast({
        title: "فشل إنشاء الموظف",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إضافة موظف جديد</h1>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle>بيانات الموظف</CardTitle>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>الاسم الأول (EN)</Label>
                  <Input
                    value={firstNameEn}
                    onChange={(e) => setFirstNameEn(e.target.value)}
                    placeholder="John"
                    dir="ltr"
                    className="text-left"
                  />
                </div>

                <div>
                  <Label>الاسم الأول (AR)</Label>
                  <Input
                    value={firstNameAr}
                    onChange={(e) => setFirstNameAr(e.target.value)}
                    placeholder="جون"
                  />
                </div>

                <div>
                  <Label>اسم العائلة (EN)</Label>
                  <Input
                    value={lastNameEn}
                    onChange={(e) => setLastNameEn(e.target.value)}
                    placeholder="Doe"
                    dir="ltr"
                    className="text-left"
                  />
                </div>

                <div>
                  <Label>اسم العائلة (AR)</Label>
                  <Input
                    value={lastNameAr}
                    onChange={(e) => setLastNameAr(e.target.value)}
                    placeholder="دو"
                  />
                </div>

                <div>
                  <Label>الرقم القومي</Label>
                  <Input
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="أدخل الرقم القومي"
                    dir="ltr"
                    className="text-left"
                    inputMode="numeric"
                  />
                </div>

                <div>
                  <Label>رقم الهاتف</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20123456789"
                    dir="ltr"
                    className="text-left"
                    type="tel"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>العنوان</Label>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="أدخل العنوان"
                  />
                </div>

                <div>
                  <Label>نوع الموظف</Label>
                  <Select
                    value={staffTypeId}
                    onValueChange={setStaffTypeId}
                    disabled={staffTypeOptions.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          staffTypeOptions.length === 0
                            ? "لا توجد أنواع موظفين"
                            : "اختر نوع الموظف"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {staffTypeOptions.length === 0 ? (
                        <SelectItem value="__empty" disabled>
                          لا توجد بيانات
                        </SelectItem>
                      ) : (
                        staffTypeOptions.map((opt) => (
                          <SelectItem key={opt.id} value={String(opt.id)}>
                            {opt.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>تاريخ بداية العمل</Label>
                  <Input
                    value={employmentStartDate}
                    onChange={(e) => setEmploymentStartDate(e.target.value)}
                    type="date"
                  />
                </div>

                <div>
                  <Label>تاريخ نهاية العمل (اختياري)</Label>
                  <Input
                    value={employmentEndDate}
                    onChange={(e) => setEmploymentEndDate(e.target.value)}
                    type="date"
                  />
                </div>

                {/* Package Selection Section */}
                <div className="md:col-span-2 pt-6 mt-2 border-t border-border space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Label className="text-base font-semibold block text-primary">
                      صلاحيات النظام (Packages)
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Selected packages: {selectedPackageKeys.length}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => navigate("/staff/dashboard/admin/staff/assign-privileges")}
                      >
                        Assign Privileges Page
                      </Button>
                    </div>
                  </div>

                  {loadingPackages && packageOptions.length === 0 ? (
                    <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg border border-dashed text-center">
                      Loading packages...
                    </div>
                  ) : packageOptions.length === 0 ? (
                    <div className="text-sm text-muted-foreground bg-muted/30 p-6 rounded-lg text-center border border-dashed flex flex-col items-center gap-2">
                      <span className="text-muted-foreground/50">⚠️</span>
                      <span>لا توجد حزم صلاحيات متاحة حالياً</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {packageOptions.map((pkg) => {
                        const isSelected = selectedPackageKeys.includes(pkg.key);
                        return (
                          <div
                            key={pkg.key}
                            className={`
                              relative flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 select-none
                              ${isSelected
                                ? "bg-primary/5 border-primary ring-1 ring-primary/20 shadow-sm"
                                : "bg-card hover:bg-muted/50 border-input hover:border-muted-foreground/30"
                              }
                            `}
                            onClick={() => togglePackage(pkg.key)}
                          >
                            <div className={`
                              mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors
                              ${isSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-muted-foreground peer-checked:bg-primary"
                              }
                            `}>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                            <div className="flex flex-col gap-1 min-w-0">
                              <span className={`text-sm font-medium leading-none truncate ${isSelected ? "text-primary" : ""}`}>
                                {pkg.name}
                              </span>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1 rounded w-fit">{pkg.code}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${pkg.source === "local" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`}>
                                  {pkg.source === "local" ? "LOCAL" : "BACKEND"}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {pkg.privilegeCodes.length} privileges
                                </span>
                              </div>
                              {pkg.description && (
                                <span className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                                  {pkg.description}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Label className="text-sm font-semibold">
                        Extra Privileges (on top of selected package)
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        Selected: {selectedExtraPrivilegeIds.length}
                      </span>
                    </div>

                    {selectedPackages.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Select at least one package first, then add extra privileges.
                      </p>
                    ) : loadingPrivileges ? (
                      <p className="text-xs text-muted-foreground">Loading privileges...</p>
                    ) : allPrivileges.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No privilege list available from backend.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {groupedPrivileges.map((group) => (
                          <div key={group.module} className="rounded border border-border bg-background p-3 space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground">{group.module}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {group.items.map((privilege) => {
                                const displayName = privilege.name_ar || privilege.name_en || privilege.code;
                                const inSelectedPackage = selectedPackagePrivilegeCodes.has(privilege.code);
                                const isSelected = selectedExtraPrivilegeIds.includes(privilege.id);

                                return (
                                  <label
                                    key={privilege.id}
                                    className={`flex items-start gap-2 rounded border p-2 ${inSelectedPackage ? "bg-emerald-50 border-emerald-200" : "bg-card border-input"}`}
                                  >
                                    <input
                                      type="checkbox"
                                      className="mt-0.5"
                                      checked={isSelected || inSelectedPackage}
                                      disabled={inSelectedPackage}
                                      onChange={() => toggleExtraPrivilege(privilege.id)}
                                    />
                                    <span className="min-w-0 flex-1 space-y-0.5">
                                      <span className="block text-xs font-medium truncate">{displayName}</span>
                                      <span className="block text-[10px] font-mono text-muted-foreground truncate">{privilege.code}</span>
                                      {inSelectedPackage && (
                                        <span className="block text-[10px] text-emerald-700">
                                          Included in selected package
                                        </span>
                                      )}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="justify-end gap-3">
              <Button type="submit" className="gap-2" disabled={isSubmitting}>
                <Save className="h-4 w-4" />
                {isSubmitting ? "جارٍ الحفظ..." : "حفظ"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>الموظفون</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">نوع الموظف</TableHead>
                <TableHead className="text-right">رقم الهاتف</TableHead>
                <TableHead className="text-center w-[240px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                    جارٍ تحميل البيانات...
                  </TableCell>
                </TableRow>
              ) : staffRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                    لا يوجد موظفون مسجلون
                  </TableCell>
                </TableRow>
              ) : (
                staffRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-semibold">
                      {(row.firstNameAr || row.firstNameEn || "-")}{" "}
                      {(row.lastNameAr || row.lastNameEn || "")}
                    </TableCell>
                    <TableCell>{row.staffTypeLabel}</TableCell>
                    <TableCell dir="ltr" className="text-left">
                      {row.phone}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            void handleViewStaff(row);
                          }}
                        >
                          عرض
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            openEditDialog(row);
                          }}
                        >
                          تعديل
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteTarget(row)}
                        >
                          حذف
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="justify-between flex-wrap gap-3">
          <div className="text-sm text-muted-foreground">
            الإجمالي: {staffTotal} | الصفحة {staffPage} من {staffPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={staffLoading || staffPage <= 1}
              onClick={() => setStaffPage((p) => Math.max(1, p - 1))}
            >
              السابق
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={staffLoading || staffPage >= staffPages}
              onClick={() => setStaffPage((p) => Math.min(staffPages, p + 1))}
            >
              التالي
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الموظف</DialogTitle>
            <DialogDescription>عرض بيانات الموظف</DialogDescription>
          </DialogHeader>

          {staffDetailsLoading ? (
            <div className="text-sm text-muted-foreground">جارٍ تحميل التفاصيل...</div>
          ) : selectedStaffDetails ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>الاسم (AR)</Label>
                  <div className="mt-1 text-sm font-semibold">
                    {selectedStaffDetails.first_name_ar || "-"} {selectedStaffDetails.last_name_ar || ""}
                  </div>
                </div>
                <div>
                  <Label>الاسم (EN)</Label>
                  <div className="mt-1 text-sm font-semibold" dir="ltr">
                    {selectedStaffDetails.first_name_en || "-"} {selectedStaffDetails.last_name_en || ""}
                  </div>
                </div>
                <div>
                  <Label>البريد الإلكتروني</Label>
                  <div className="mt-1 text-sm font-semibold" dir="ltr">
                    {selectedStaffDetails.email || "-"}
                  </div>
                </div>
                <div>
                  <Label>الحالة</Label>
                  <div className="mt-1 text-sm font-semibold">{selectedStaffDetails.status || "-"}</div>
                </div>
                <div>
                  <Label>الرقم القومي</Label>
                  <div className="mt-1 text-sm font-semibold" dir="ltr">
                    {selectedStaffDetails.national_id || "-"}
                  </div>
                </div>
                <div>
                  <Label>رقم الهاتف</Label>
                  <div className="mt-1 text-sm font-semibold" dir="ltr">
                    {selectedStaffDetails.phone || "-"}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <Label>العنوان</Label>
                  <div className="mt-1 text-sm font-semibold">{selectedStaffDetails.address || "-"}</div>
                </div>
                <div>
                  <Label>نوع الموظف</Label>
                  <div className="mt-1 text-sm font-semibold">
                    {(() => {
                      const typeIdNum = Number(selectedStaffDetails.staff_type_id ?? 0);
                      const typeId = Number.isFinite(typeIdNum) ? typeIdNum : 0;
                      return staffTypeLabelById.get(typeId) || (typeId ? String(typeId) : "-");
                    })()}
                  </div>
                </div>
                <div>
                  <Label>بداية العمل</Label>
                  <div className="mt-1 text-sm font-semibold" dir="ltr">
                    {selectedStaffDetails.employment_start_date || "-"}
                  </div>
                </div>
                <div>
                  <Label>نهاية العمل</Label>
                  <div className="mt-1 text-sm font-semibold" dir="ltr">
                    {selectedStaffDetails.employment_end_date || "-"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>الحزم المخصصة</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(selectedStaffDetails.assigned_packages || []).length === 0 ? (
                      <span className="text-sm text-muted-foreground">لا يوجد</span>
                    ) : (
                      selectedStaffDetails.assigned_packages?.map((pkg) => (
                        <span
                          key={pkg.id}
                          className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold"
                          dir="ltr"
                        >
                          {pkg.code}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <Label>الصلاحيات</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(selectedStaffDetails.privileges || []).length === 0 ? (
                      <span className="text-sm text-muted-foreground">لا يوجد</span>
                    ) : (
                      selectedStaffDetails.privileges?.map((p) => (
                        <span
                          key={p.id}
                          className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold"
                          dir="ltr"
                        >
                          {p.code}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : selectedStaff ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>الاسم (AR)</Label>
                <div className="mt-1 text-sm font-semibold">
                  {selectedStaff.firstNameAr} {selectedStaff.lastNameAr}
                </div>
              </div>
              <div>
                <Label>الاسم (EN)</Label>
                <div className="mt-1 text-sm font-semibold" dir="ltr">
                  {selectedStaff.firstNameEn} {selectedStaff.lastNameEn}
                </div>
              </div>
              <div>
                <Label>الرقم القومي</Label>
                <div className="mt-1 text-sm font-semibold" dir="ltr">
                  {selectedStaff.nationalId}
                </div>
              </div>
              <div>
                <Label>رقم الهاتف</Label>
                <div className="mt-1 text-sm font-semibold" dir="ltr">
                  {selectedStaff.phone}
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label>العنوان</Label>
                <div className="mt-1 text-sm font-semibold">{selectedStaff.address}</div>
              </div>
              <div>
                <Label>نوع الموظف</Label>
                <div className="mt-1 text-sm font-semibold">{selectedStaff.staffTypeLabel}</div>
              </div>
              <div>
                <Label>بداية العمل</Label>
                <div className="mt-1 text-sm font-semibold" dir="ltr">
                  {selectedStaff.employmentStartDate}
                </div>
              </div>
              <div>
                <Label>نهاية العمل</Label>
                <div className="mt-1 text-sm font-semibold" dir="ltr">
                  {selectedStaff.employmentEndDate ?? "-"}
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDetails(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => (open ? null : setDeleteTarget(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>هل أنت متأكد أنك تريد حذف هذا الموظف؟</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                if (!deleteTarget) return;
                const id = deleteTarget.id;
                try {
                  await api.patch(`/staff/${id}/deactivate`);
                  setStaffRows((prev) => prev.filter((r) => r.id !== id));
                  setDeleteTarget(null);
                  toast({ title: "تم الحذف", description: "تم حذف الموظف بنجاح" });
                } catch (error) {
                  console.error("Failed to delete staff", error);
                  toast({
                    title: "فشل الحذف",
                    description: "حدث خطأ أثناء محاولة حذف الموظف",
                    variant: "destructive",
                  });
                }
              }}
            >
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(open) => (open ? null : setEditTarget(null))}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الموظف</DialogTitle>
            <DialogDescription>سيتم تحديث البيانات باستخدام API: PUT /staff/:id</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label>الاسم الأول (EN)</Label>
              <Input
                value={editFirstNameEn}
                onChange={(e) => setEditFirstNameEn(e.target.value)}
                placeholder="Jane"
                dir="ltr"
                className="text-left"
              />
            </div>

            <div>
              <Label>رقم الهاتف</Label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="+20198765432"
                dir="ltr"
                className="text-left"
                type="tel"
              />
            </div>

            <div>
              <Label>العنوان</Label>
              <Input
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="456 New Street"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditTarget(null)} disabled={editSubmitting}>
              إلغاء
            </Button>
            <Button type="button" onClick={() => void handleUpdateStaff()} disabled={editSubmitting}>
              {editSubmitting ? "جارٍ الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Display Dialog */}
      <Dialog open={!!createdCredentials} onOpenChange={(open) => !open && setCreatedCredentials(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              تم إنشاء الحساب بنجاح
            </DialogTitle>
            <DialogDescription>
              يرجى حفظ بيانات الدخول التالية وإرسالها للموظف.
            </DialogDescription>
          </DialogHeader>

          {createdCredentials && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg border space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">البريد الإلكتروني (Email)</Label>
                  <div className="flex items-center justify-between bg-background p-2 rounded border">
                    <code className="text-sm font-mono">{createdCredentials.email}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        navigator.clipboard.writeText(createdCredentials.email);
                        toast({ description: "تم نسخ البريد الإلكتروني" });
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">كلمة المرور (Password)</Label>
                  <div className="flex items-center justify-between bg-background p-2 rounded border">
                    <code className="text-sm font-mono">{createdCredentials.password}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        navigator.clipboard.writeText(createdCredentials.password);
                        toast({ description: "تم نسخ كلمة المرور" });
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-200">
                ⚠️ يرجى التنبيه على الموظف بتغيير كلمة المرور عند تسجيل الدخول لأول مرة.
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setCreatedCredentials(null)} className="w-full">
              تم، فهمت
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


