import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Save, Check, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StaffService } from "../services/staffService";

import { Button } from "../Component/StaffPagesComponents/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../Component/StaffPagesComponents/ui/card";
import { Input } from "../Component/StaffPagesComponents/ui/input";
import { Label } from "../Component/StaffPagesComponents/ui/label";
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
  backendId: number;
  code: string;
  name: string;
  description?: string;
  privilegeCodes: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

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

const staffFormSchema = z.object({
  first_name_en: z.string()
    .min(1, "First Name is required")
    .max(20, "Maximum 20 characters")
    .regex(/^[a-zA-Z\s]+$/, "English letters only"),
  first_name_ar: z.string()
    .min(1, "الاسم الأول بالعربية مطلوب")
    .max(20, "الحد الأقصى 20 حرف")
    .regex(/^[\u0600-\u06FF\s]+$/, "أحرف عربية فقط"),
  last_name_en: z.string()
    .min(1, "Last Name (English) is required")
    .max(20, "Maximum 20 characters")
    .regex(/^[a-zA-Z\s]+$/, "English letters only"),
  last_name_ar: z.string()
    .max(20, "الحد الأقصى 20 حرف")
    .regex(/^[\u0600-\u06FF\s]*$/, "أحرف عربية فقط")
    .optional()
    .or(z.literal("")),
  national_id: z.string()
    .length(14, "الرقم القومي يجب أن يكون 14 رقم")
    .regex(/^[1-4]\d{13}$/, "الرقم القومي يجب أن يبدأ بـ 1 أو 2 أو 3 أو 4، وأن يحتوي على أرقام فقط"),
  phone: z.string()
    .length(11, "رقم الهاتف يجب أن يكون 11 رقم")
    .regex(/^01[0125]\d{8}$/, "رقم الهاتف غير صحيح (يجب أن يبدأ ب 010, 011, 012, أو 015)"),
  address: z.string()
    .max(100, "الحد الأقصى 100 حرف")
    .optional()
    .or(z.literal("")),
  staff_type_id: z.string()
    .min(1, "نوع الموظف مطلوب"),
  employment_start_date: z.string()
    .min(1, "تاريخ التعيين مطلوب"),
});

type StaffFormData = z.infer<typeof staffFormSchema>;

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

// Arabic display names for privilege module codes sent by the backend
const MODULE_NAMES_AR: Record<string, string> = {
  MEMBERS: "الأعضاء",
  MEMBER: "العضو",
  MEMBER_TYPES: "أنواع الأعضاء",
  TEAM_MEMBERS: "أعضاء الفريق",
  MEMBERSHIP_PLANS: "خطط العضوية",
  STAFF: "الموظفون",
  STAFF_TYPES: "أنواع الموظفين",
  FINANCE: "الشؤون المالية",
  EVENTS: "الفعاليات",
  SPORTS: "الأنشطة الرياضية",
  MAINTENANCE: "الصيانة",
  MEDIA: "الوسائط",
  MEDIA_CENTER: "المركز الإعلامي",
  MediaGallery: "معرض الوسائط",
  FACULTIES: "الكليات",
  PROFESSIONS: "المهن",
  ADMIN: "الإدارة",
  PRIVILEGE_MANAGEMENT: "إدارة الصلاحيات",
  PACKAGE_MANAGEMENT: "إدارة الحزم",
  General: "عام",
};

export default function AddNewStaffPage() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      first_name_en: "",
      first_name_ar: "",
      last_name_en: "",
      last_name_ar: "",
      national_id: "",
      phone: "",
      address: "",
      staff_type_id: "",
      employment_start_date: "",
    },
  });

  const staffTypeId = watch("staff_type_id");

  // Package & Privilege State
  const [backendPackages, setBackendPackages] = useState<PackageApiItem[]>([]);
  const [selectedPackageKeys, setSelectedPackageKeys] = useState<string[]>([]);
  const [allPrivileges, setAllPrivileges] = useState<PrivilegeApiItem[]>([]);
  const [selectedExtraPrivilegeIds, setSelectedExtraPrivilegeIds] = useState<number[]>([]);
  const [excludedPackagePrivilegeIds, setExcludedPackagePrivilegeIds] = useState<number[]>([]);
  const [packagePrivilegeCodesByKey, setPackagePrivilegeCodesByKey] = useState<Record<string, string[]>>({});
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [loadingPrivileges, setLoadingPrivileges] = useState(false);
  // #8 — error states for all three async fetches
  const [staffTypesError, setStaffTypesError] = useState(false);
  const [packagesError, setPackagesError] = useState(false);
  const [privilegesError, setPrivilegesError] = useState(false);

  // #7 — ref to track which backend package keys are already being fetched
  //       prevents the package-privilege effect from firing twice for the same package
  const fetchingPackageKeys = useRef(new Set<string>());

  // Credentials Dialog State
  const [createdCredentials, setCreatedCredentials] = useState<{ national_id: string } | null>(null);
  const [copiedNationalId, setCopiedNationalId] = useState(false);
  const [activePrivilegeTab, setActivePrivilegeTab] = useState<string | null>(null);

  // Dynamic Staff Types State — starts with static fallback, replaced by API on mount
  const [staffTypes, setStaffTypes] = useState<StaffType[]>(STATIC_STAFF_TYPES);
  const [staffTypesFromApi, setStaffTypesFromApi] = useState(false);

  // #5 — expose a retry so the UI can prompt the user when using fallback data
  const loadStaffTypes = useCallback(async () => {
    setStaffTypesError(false);
    try {
      const res = await StaffService.getStaffTypes();
      if (res.success && Array.isArray(res.data)) {
        setStaffTypes(res.data);
        setStaffTypesFromApi(true);
      } else {
        // API succeeded but returned unexpected shape — keep fallback, flag stale
        setStaffTypesError(true);
      }
    } catch (error) {
      console.error("Failed to load staff types", error);
      setStaffTypesError(true);
    }
  }, []);

  useEffect(() => { void loadStaffTypes(); }, [loadStaffTypes]);

  const staffTypeOptions = useMemo(
    () =>
      staffTypes.map((t) => ({
        id: t.id,
        label: t.name_ar || t.title_ar || t.name_en || t.title_en || `#${t.id}`,
      })),
    [staffTypes],
  );

  const packageOptions = useMemo<PackageOption[]>(() => {
    return backendPackages.map((pkg) => {
      const key = `backend:${pkg.id}`;
      return {
        key,
        backendId: pkg.id,
        code: pkg.code || `PKG_${pkg.id}`,
        name: pkg.name_ar || pkg.name_en || pkg.code || `Package #${pkg.id}`,
        description: pkg.description_ar || pkg.description_en,
        privilegeCodes: packagePrivilegeCodesByKey[key] || [],
      };
    });
  }, [backendPackages, packagePrivilegeCodesByKey]);

  const selectedPackages = useMemo(
    () => packageOptions.filter((pkg) => selectedPackageKeys.includes(pkg.key)),
    [packageOptions, selectedPackageKeys],
  );




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

  // #8 — packages load with error state + retry
  const loadPackages = useCallback(async () => {
    setLoadingPackages(true);
    setPackagesError(false);
    try {
      const response = await StaffService.getPackages();
      setBackendPackages(response?.data ?? []);
    } catch (error) {
      console.error("Failed to load backend packages", error);
      setBackendPackages([]);
      setPackagesError(true);
    } finally {
      setLoadingPackages(false);
    }
  }, []);

  useEffect(() => { void loadPackages(); }, [loadPackages]);

  // #8 — privileges load with error state + retry
  const loadPrivileges = useCallback(async () => {
    setLoadingPrivileges(true);
    setPrivilegesError(false);
    try {
      const response = await StaffService.getAllPrivileges();
      const normalized = normalizePrivilegesResponse(response);
      setAllPrivileges(normalized);
    } catch (error) {
      console.error("Failed to load privileges", error);
      setAllPrivileges([]);
      setPrivilegesError(true);
    } finally {
      setLoadingPrivileges(false);
    }
  }, []);

  useEffect(() => { void loadPrivileges(); }, [loadPrivileges]);

  useEffect(() => {
    const validPackageKeys = new Set(packageOptions.map((pkg) => pkg.key));

    setSelectedPackageKeys((prev) => {
      const filtered = prev.filter((key) => validPackageKeys.has(key));
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [packageOptions]);

  // Eagerly pre-fetch privilege counts for ALL packages as soon as they load
  // so the count badge is visible on the card before the user clicks anything.
  useEffect(() => {
    const unloaded = packageOptions.filter(
      (pkg) =>
        pkg.backendId !== null &&
        !packagePrivilegeCodesByKey[pkg.key] &&
        !fetchingPackageKeys.current.has(pkg.key),
    );

    if (unloaded.length === 0) return;

    unloaded.forEach((pkg) => fetchingPackageKeys.current.add(pkg.key));

    const prefetch = async () => {
      await Promise.all(
        unloaded.map(async (pkg) => {
          try {
            const response = await StaffService.getPackagePrivileges(pkg.backendId);
            const codes = normalizePackagePrivilegeCodes(response);
            setPackagePrivilegeCodesByKey((prev) => ({ ...prev, [pkg.key]: codes }));
          } catch {
            fetchingPackageKeys.current.delete(pkg.key);
          }
        }),
      );
    };

    void prefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageOptions]); // runs whenever the package list changes

  // #7 — fetch privileges for newly selected backend packages
  //       Guards against re-fetching with a ref so packagePrivilegeCodesByKey
  //       is NOT in the dependency array (that combination was the loop risk).
  useEffect(() => {
    const missingBackendPackages = selectedPackages.filter(
      (pkg) =>
        pkg.backendId !== null &&
        !packagePrivilegeCodesByKey[pkg.key] &&
        !fetchingPackageKeys.current.has(pkg.key),
    );

    if (missingBackendPackages.length === 0) return;

    // Mark as in-flight immediately to prevent duplicate fetches
    missingBackendPackages.forEach((pkg) => fetchingPackageKeys.current.add(pkg.key));

    const loadPackagePrivileges = async () => {
      const promises = missingBackendPackages.map(async (pkg) => {
        if (pkg.backendId === null) return;
        try {
          const response = await StaffService.getPackagePrivileges(pkg.backendId);
          const codes = normalizePackagePrivilegeCodes(response);
          setPackagePrivilegeCodesByKey((prev) => ({ ...prev, [pkg.key]: codes }));
        } catch (error) {
          console.error(`Failed to load privileges for package ${pkg.key}`, error);
          // Remove from ref so a manual retry can re-trigger the fetch
          fetchingPackageKeys.current.delete(pkg.key);
        }
      });

      await Promise.all(promises);
    };

    void loadPackagePrivileges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackages]); // intentionally excludes packagePrivilegeCodesByKey to prevent a feedback loop

  // Clean up excluded privileges when packages change
  useEffect(() => {
    if (excludedPackagePrivilegeIds.length === 0) return;
    
    // Get all current package privilege IDs
    const currentPackagePrivilegeIds = new Set<number>();
    selectedPackagePrivilegeCodes.forEach((code) => {
      const priv = allPrivileges.find((p) => p.code === code);
      if (priv) currentPackagePrivilegeIds.add(priv.id);
    });

    // Remove excluded privileges that are no longer in any selected package
    setExcludedPackagePrivilegeIds((prev) =>
      prev.filter((id) => currentPackagePrivilegeIds.has(id))
    );
  }, [selectedPackagePrivilegeCodes, allPrivileges]);

  const togglePackage = useCallback((pkgKey: string) => {
    setSelectedPackageKeys((prev) => {
      const isSelected = prev.includes(pkgKey);
      return isSelected ? prev.filter((k) => k !== pkgKey) : [...prev, pkgKey];
    });
  }, []);

  const togglePrivilege = useCallback((privilegeId: number, isInPackage: boolean) => {
    if (isInPackage) {
      // Toggle in excluded privileges
      setExcludedPackagePrivilegeIds((prev) => {
        const isExcluded = prev.includes(privilegeId);
        return isExcluded ? prev.filter((id) => id !== privilegeId) : [...prev, privilegeId];
      });
    } else {
      // Toggle in extra privileges
      setSelectedExtraPrivilegeIds((prev) => {
        const isSelected = prev.includes(privilegeId);
        return isSelected ? prev.filter((id) => id !== privilegeId) : [...prev, privilegeId];
      });
    }
  }, []);


  const onSubmit = async (data: StaffFormData) => {
    try {
      const staffTypeIdNum = Number(data.staff_type_id);

      const selectedBackendPackageIds = selectedPackages
        .filter((pkg) => pkg.backendId !== null)
        .map((pkg) => pkg.backendId!);

      const extraPrivileges = selectedExtraPrivilegeIds;

      const payload = {
        first_name_en: data.first_name_en,
        first_name_ar: data.first_name_ar,
        last_name_en: data.last_name_en,
        last_name_ar: data.last_name_ar || undefined,
        national_id: data.national_id,
        phone: data.phone,
        address: data.address || undefined,
        staff_type_id: staffTypeIdNum,
        employment_start_date: data.employment_start_date,
        // Note: status is set by backend based on who is creating
      };

      const response = await StaffService.registerStaff(payload);
      // Backend returns { success, staff_id, account_id, email }
      const newStaffId = response?.staff_id;

      if (!newStaffId) {
        throw new Error("Failed to get staff ID from response");
      }

      // Assign backend packages
      if (selectedBackendPackageIds.length > 0) {
        await StaffService.assignPackages(newStaffId, selectedBackendPackageIds);
      }

      // Grant individual extra privileges (outside of packages)
      if (extraPrivileges.length > 0) {
        await StaffService.grantPrivileges(
          newStaffId,
          extraPrivileges,
          "Assigned during staff creation"
        );
      }

      // Revoke excluded package privileges (create overrides with is_granted=false)
      if (excludedPackagePrivilegeIds.length > 0) {
        await StaffService.revokePrivileges(
          newStaffId,
          excludedPackagePrivilegeIds,
          "Excluded from package during staff creation"
        );
      }

      // Show Credentials Dialog
      setCreatedCredentials({
        national_id: data.national_id,
      });

      toast({
        title: "تم التسجيل",
        description: "تم تسجيل الموظف بنجاح",
      });

      // Clear Form
      reset();
      setSelectedPackageKeys([]);
      setSelectedExtraPrivilegeIds([]);
      setExcludedPackagePrivilegeIds([]);
    } catch (error) {
      console.error("Failed to register staff", error);
      toast({
        title: "فشل التسجيل",
        description: "حدث خطأ أثناء محاولة تسجيل الموظف",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 pb-8 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">إضافة موظف جديد</h1>
        <p className="text-muted-foreground mt-1">سجل موظفاً جديداً في النظام</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات الموظف</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={hookFormSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>الاسم الأول (EN) *</Label>
                <Input
                  {...register("first_name_en")}
                  placeholder="John"
                  dir="ltr"
                  className="text-left"
                  maxLength={20}
                />
                {errors.first_name_en && (
                  <p className="text-red-500 text-xs mt-1">{errors.first_name_en.message}</p>
                )}
              </div>

              <div>
                <Label>الاسم الأول (AR) *</Label>
                <Input
                  {...register("first_name_ar")}
                  placeholder="أحمد"
                  maxLength={20}
                />
                {errors.first_name_ar && (
                  <p className="text-red-500 text-xs mt-1">{errors.first_name_ar.message}</p>
                )}
              </div>

              <div>
                <Label>اسم العائلة (EN)</Label>
                <Input
                  {...register("last_name_en")}
                  placeholder="Doe"
                  dir="ltr"
                  className="text-left"
                  maxLength={20}
                />
                {errors.last_name_en && (
                  <p className="text-red-500 text-xs mt-1">{errors.last_name_en.message}</p>
                )}
              </div>

              <div>
                <Label>اسم العائلة (AR)</Label>
                <Input
                  {...register("last_name_ar")}
                  placeholder="محمد"
                  maxLength={20}
                />
                {errors.last_name_ar && (
                  <p className="text-red-500 text-xs mt-1">{errors.last_name_ar.message}</p>
                )}
              </div>

              <div>
                <Label>الرقم القومي *</Label>
                <Input
                  {...register("national_id")}
                  placeholder="29501012345678"
                  type="text"
                  dir="ltr"
                  className="text-left"
                  maxLength={14}
                  inputMode="numeric"
                />
                {errors.national_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.national_id.message}</p>
                )}
              </div>

              <div>
                <Label>رقم الهاتف *</Label>
                <Input
                  {...register("phone")}
                  placeholder="+201012345678"
                  type="tel"
                  dir="ltr"
                  className="text-left"
                  maxLength={11}
                  inputMode="numeric"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <Label>العنوان</Label>
                <Input
                  {...register("address")}
                  placeholder="123 Main Street, Cairo"
                  maxLength={100}
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <Label>نوع الموظف *</Label>
                <Select value={staffTypeId} onValueChange={(v) => setValue("staff_type_id", v, { shouldValidate: true })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الموظف" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffTypeOptions.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* #5 — show warning when API failed and list is the static fallback */}
                {staffTypesError && !staffTypesFromApi && (
                  <div className="flex items-center justify-between mt-1 px-2 py-1.5 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <span>⚠️ تعذر تحميل الأنواع من الخادم. تظهر قائمة افتراضية.</span>
                    <button type="button" onClick={() => void loadStaffTypes()} className="underline font-medium mr-2">إعادة المحاولة</button>
                  </div>
                )}
                {errors.staff_type_id && (
                  <p className="text-red-500 text-xs mt-1">{errors.staff_type_id.message}</p>
                )}
              </div>

              <div>
                <Label>تاريخ التعيين *</Label>
                <Input
                  type="date"
                  {...register("employment_start_date")}
                  dir="ltr"
                  className="text-left"
                />
                {errors.employment_start_date && (
                  <p className="text-red-500 text-xs mt-1">{errors.employment_start_date.message}</p>
                )}
              </div>
            </div>

            {/* Package Selection Section */}
            <div className="md:col-span-2 pt-6 mt-2 border-t border-border space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Label className="text-base font-semibold block text-primary">
                  صلاحيات النظام (Packages)
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    الحزم المحددة: {selectedPackageKeys.length}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => navigate("/staff/dashboard/admin/staff/assign-privileges")}
                  >
                    صفحة تعيين الصلاحيات
                  </Button>
                </div>
              </div>

              {loadingPackages && packageOptions.length === 0 ? (
                <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg border border-dashed text-center">
                  جاري تحميل الحزم...
                </div>
              ) : packagesError && packageOptions.length === 0 ? (
                /* #8 — packages fetch failed, show retry */
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <span>⚠️ تعذر تحميل حزم الصلاحيات.</span>
                  <button type="button" onClick={() => void loadPackages()} className="underline font-medium">إعادة المحاولة</button>
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
                      <button
                        key={pkg.key}
                        type="button"
                        onClick={() => togglePackage(pkg.key)}
                        className={`
                          p-3 rounded-lg border-2 text-left transition-all
                          ${isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:bg-muted/30"
                          }
                        `}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-1">
                            <div className="font-semibold text-sm">{pkg.name}</div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] px-2 py-0.5 bg-muted rounded uppercase font-mono">
                                BACKEND
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {pkg.privilegeCodes.length} صلاحية
                              </span>
                            </div>
                            {pkg.description && (
                              <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {pkg.description}
                              </div>
                            )}
                          </div>
                          <div
                            className={`
                              w-5 h-5 rounded border-2 flex items-center justify-center shrink-0
                              ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}
                            `}
                          >
                            {isSelected && <span className="text-primary-foreground text-xs">✓</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── Extra Privileges ─ Tabbed Module Picker ── */}
              <div className="rounded-xl border border-border bg-card shadow-sm">

                {/* Header */}
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-muted/30">
                  <div>
                    <p className="text-sm font-semibold">صلاحيات فردية</p>
                    <p className="text-xs text-muted-foreground mt-0.5">اختر صلاحيات إضافية مباشرة</p>
                  </div>
                  {selectedExtraPrivilegeIds.length > 0 && (
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                      {selectedExtraPrivilegeIds.length} محددة
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-6">
                  {loadingPrivileges ? (
                    <div className="flex items-center gap-2 py-6 justify-center text-sm text-muted-foreground">
                      <span className="animate-spin">⏳</span> جاري تحميل الصلاحيات...
                    </div>
                  ) : privilegesError ? (
                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <span>⚠️ تعذر تحميل قائمة الصلاحيات.</span>
                      <button type="button" onClick={() => void loadPrivileges()} className="underline font-medium">إعادة المحاولة</button>
                    </div>
                  ) : allPrivileges.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">لا توجد صلاحيات من الخادم.</p>
                  ) : (() => {
                    // Determine the active tab — default to first group
                    const currentTab = activePrivilegeTab && groupedPrivileges.some(g => g.module === activePrivilegeTab)
                      ? activePrivilegeTab
                      : groupedPrivileges[0]?.module ?? null;
                    const activeGroup = groupedPrivileges.find(g => g.module === currentTab);

                    return (
                      <div className="space-y-3">

                        {/* Tab bar */}
                        <div className="flex gap-1 flex-wrap border-b border-border pb-3">
                          {groupedPrivileges.map((group) => {
                            const extraCount = group.items.filter(
                              (p) => selectedExtraPrivilegeIds.includes(p.id)
                            ).length;
                            const isActive = group.module === currentTab;
                            return (
                              <button
                                key={group.module}
                                type="button"
                                onClick={() => setActivePrivilegeTab(group.module)}
                                className={`
                                  relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                                  transition-all duration-150
                                  ${isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                                  }
                                `}
                              >
                                {MODULE_NAMES_AR[group.module] ?? group.module}
                                {extraCount > 0 && (
                                  <span className={`
                                    text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none
                                    ${isActive ? "bg-white/20 text-white" : "bg-primary/15 text-primary"}
                                  `}>
                                    {extraCount}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Active tab content */}
                        {activeGroup && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 min-h-[260px]">
                            {activeGroup.items.map((privilege) => {
                              const inPackage = selectedPackagePrivilegeCodes.has(privilege.code);
                              const isExtra = selectedExtraPrivilegeIds.includes(privilege.id);
                              const isExcluded = excludedPackagePrivilegeIds.includes(privilege.id);
                              const isSelected = inPackage && !isExcluded;

                              return (
                                <button
                                  key={privilege.id}
                                  type="button"
                                  onClick={() => togglePrivilege(privilege.id, inPackage)}
                                  className={`
                                    group flex items-center gap-3 p-3 rounded-lg border text-right
                                    transition-all duration-150 w-full
                                    ${isSelected
                                      ? "border-emerald-200 bg-emerald-50/60"
                                      : isExcluded
                                        ? "border-red-200 bg-red-50/60"
                                        : isExtra
                                          ? "border-primary/40 bg-primary/5 shadow-sm"
                                          : "border-border bg-card hover:border-primary/30 hover:bg-muted/40"
                                    }
                                  `}
                                >
                                  {/* Checkbox indicator */}
                                  <div className={`
                                    shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center
                                    transition-colors duration-150
                                    ${isSelected
                                      ? "border-emerald-400 bg-emerald-400"
                                      : isExcluded
                                        ? "border-red-400 bg-white"
                                        : isExtra
                                          ? "border-primary bg-primary"
                                          : "border-muted-foreground/50 group-hover:border-primary/60"
                                    }
                                  `}>
                                    {isSelected && (
                                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    )}
                                    {isExcluded && (
                                      <svg className="w-2.5 h-2.5 text-red-400" fill="none" viewBox="0 0 12 12">
                                        <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                      </svg>
                                    )}
                                    {isExtra && (
                                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    )}
                                  </div>

                                  {/* Text */}
                                  <div className="flex-1 text-right min-w-0">
                                    <p className={`text-xs font-medium truncate ${isSelected ? "text-emerald-700" : isExcluded ? "text-red-700" : "text-foreground"
                                      }`}>
                                      {privilege.name_ar || privilege.name_en || privilege.code}
                                    </p>
                                    <p className="text-[10px] font-mono text-muted-foreground truncate mt-0.5">
                                      {privilege.code}
                                    </p>
                                  </div>

                                  {/* State badge */}
                                  {isSelected && (
                                    <span className="shrink-0 text-[9px] font-medium text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                      في الحزمة
                                    </span>
                                  )}
                                  {isExcluded && (
                                    <span className="shrink-0 text-[9px] font-medium text-red-600 bg-red-100 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                      مستثنى
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Footer legend */}
                        <div className="flex flex-wrap items-center gap-4 pt-2 text-[10px] text-muted-foreground border-t border-border">
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded border-2 border-emerald-400 bg-emerald-400 inline-flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                            مشمول في الحزمة
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded border-2 border-red-400 bg-white inline-flex items-center justify-center">
                              <svg className="w-2 h-2 text-red-400" fill="none" viewBox="0 0 12 12"><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                            </span>
                            مستثنى من الحزمة
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded border-2 border-primary bg-primary inline-flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                            محدد كصلاحية إضافية
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded border-2 border-muted-foreground/50 inline-block" />
                            غير محدد
                          </span>
                        </div>

                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/staff/dashboard/admin/staff/list")}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 ml-2" />
                {isSubmitting ? "جارٍ الحفظ..." : "حفظ الموظف"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Credentials Display Dialog */}
      <Dialog open={!!createdCredentials} onOpenChange={(open) => !open && setCreatedCredentials(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              تم إنشاء الحساب بنجاح
            </DialogTitle>
            <DialogDescription>
              يرجى تسليم الموظف الرقم القومي الخاص به لتسجيل الدخول.
            </DialogDescription>
          </DialogHeader>

          {createdCredentials && (
            <div className="space-y-4 py-4">
              {/* Email */}
              <div className="p-4 bg-muted rounded-lg border space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">البريد الإلكتروني (للدخول)</Label>
                  <div className="flex items-center justify-between bg-background p-2 rounded border mt-1" dir="ltr">
                    <code className="text-sm font-mono tracking-tight">
                      staff.{createdCredentials.national_id}@helwan-club.local
                    </code>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">كلمة المرور الأولية (= الرقم القومي)</Label>
                  <div className="flex items-center justify-between bg-background p-2 rounded border mt-1">
                    <code className="text-sm font-mono tracking-widest">{createdCredentials.national_id}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        navigator.clipboard.writeText(createdCredentials.national_id);
                        setCopiedNationalId(true);
                        setTimeout(() => setCopiedNationalId(false), 1500);
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          transition: "transform 0.15s ease, color 0.15s ease",
                          transform: copiedNationalId ? "scale(0.7)" : "scale(1)",
                          color: copiedNationalId ? "#16a34a" : undefined,
                        }}
                      >
                        {copiedNationalId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-xs bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-200">
                ⚠️ <strong>بيانات الدخول الأولية:</strong> الرقم القومي يُستخدم كلمة مرور مؤقتة. سيُطلب من الموظف تغييرها عند أول دخول.
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