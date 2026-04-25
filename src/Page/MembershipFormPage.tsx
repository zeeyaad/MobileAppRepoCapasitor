import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import { Input } from "../Component/StaffPagesComponents/ui/input";
import { Label } from "../Component/StaffPagesComponents/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Component/StaffPagesComponents/ui/select";
import { Save, Printer, Loader2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import api from "../api/axios";

type MemberTypeItem = {
  id: number;
  code: string;
  name_en: string;
  name_ar: string;
};

export default function MembershipFormPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [memberTypes, setMemberTypes] = useState<MemberTypeItem[]>([]);

  // Form State matching Backend DTO
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name_ar: "",
    last_name_ar: "",
    first_name_en: "",
    last_name_en: "",
    national_id: "",
    birthdate: "",
    gender: "male",
    phone: "",
    nationality: "Egyptian",
    address: "",
    confirm_password: "",
    member_type_id: "",
  });

  // Fetch Member Types
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await api.get("/member-types");
        if (res.data && Array.isArray(res.data.data)) {
          setMemberTypes(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch member types", error);
      }
    };
    fetchTypes();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.email || !formData.password || !formData.national_id) {
      toast({ title: "بيانات ناقصة", description: "يرجى تعبئة البريد الإلكتروني، كلمة المرور، والرقم القومي", variant: "destructive" });
      return false;
    }
    if (formData.password !== formData.confirm_password) {
      toast({ title: "خطأ", description: "كلمة المرور غير متطابقة", variant: "destructive" });
      return false;
    }
    if (!formData.first_name_ar || !formData.last_name_ar) {
      toast({ title: "بيانات ناقصة", description: "يرجى إدخال الاسم بالعربية", variant: "destructive" });
      return false;
    }
    if (!formData.first_name_en || !formData.last_name_en) {
      toast({ title: "بيانات ناقصة", description: "يرجى إدخال الاسم بالإنجليزية", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const payload = {
        ...formData,
        member_type_id: Number(formData.member_type_id) || 1, // Default to 1 if not selected
      };

      const res = await api.post("/members", payload);

      if (res.status === 201) {
        toast({ title: "تم الحفظ", description: "تم تسجيل العضو بنجاح" });
        // Reset form or redirect
        setFormData({
          email: "",
          password: "",
          first_name_ar: "",
          last_name_ar: "",
          first_name_en: "",
          last_name_en: "",
          national_id: "",
          birthdate: "",
          gender: "male",
          phone: "",
          nationality: "Egyptian",
          address: "",
          confirm_password: "",
          member_type_id: "",
        });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "فشل التسجيل";
      toast({ title: "خطأ", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">تسجيل عضوية جديدة</h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg bg-card shadow-sm border p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <span className="text-[120px] font-bold text-primary font-poppins">HUC</span>
        </div>

        <div className="grid grid-cols-1 gap-8 relative">

          {/* Account Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">بيانات الحساب</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-destructive">* البريد الإلكتروني</Label>
                <Input name="email" value={formData.email} onChange={handleChange} placeholder="example@domain.com" dir="ltr" className="text-left" />
              </div>
              <div>
                {/* Empty for layout or maybe Status */}
              </div>
              <div>
                <Label className="text-destructive">* كلمة المرور</Label>
                <Input type="password" name="password" value={formData.password} onChange={handleChange} dir="ltr" className="text-left" />
              </div>
              <div>
                <Label className="text-destructive">* تأكيد كلمة المرور</Label>
                <Input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} dir="ltr" className="text-left" />
              </div>
            </div>
          </div>

          {/* Personal Info Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">البيانات الشخصية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Arabic Name */}
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-destructive">* الاسم الأول (عربي)</Label>
                  <Input name="first_name_ar" value={formData.first_name_ar} onChange={handleChange} placeholder="الاسم الأول" />
                </div>
                <div>
                  <Label className="text-destructive">* الاسم الأخير (عربي)</Label>
                  <Input name="last_name_ar" value={formData.last_name_ar} onChange={handleChange} placeholder="اسم العائلة" />
                </div>
              </div>

              {/* English Name */}
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-destructive">* First Name (EN)</Label>
                  <Input name="first_name_en" value={formData.first_name_en} onChange={handleChange} placeholder="First Name" dir="ltr" className="text-left" />
                </div>
                <div>
                  <Label className="text-destructive">* Last Name (EN)</Label>
                  <Input name="last_name_en" value={formData.last_name_en} onChange={handleChange} placeholder="Last Name" dir="ltr" className="text-left" />
                </div>
              </div>

              {/* National ID & Birthdate */}
              <div className="col-span-2">
                <Label className="text-destructive">* الرقم القومي</Label>
                <Input name="national_id" value={formData.national_id} onChange={handleChange} placeholder="14 رقم" maxLength={14} />
              </div>
              <div>
                <Label>تاريخ الميلاد</Label>
                <Input type="date" name="birthdate" value={formData.birthdate} onChange={handleChange} />
              </div>
              <div>
                <Label>النوع</Label>
                <Select onValueChange={(v) => handleSelectChange("gender", v)} value={formData.gender}>
                  <SelectTrigger><SelectValue placeholder="اختر" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">ذكر</SelectItem>
                    <SelectItem value="female">أنثى</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Info */}
              <div>
                <Label>رقم الهاتف / واتساب</Label>
                <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="01xxxxxxxxx" />
              </div>
              <div>
                <Label>الجنسية</Label>
                <Input name="nationality" value={formData.nationality} onChange={handleChange} />
              </div>
              <div className="col-span-2">
                <Label>العنوان</Label>
                <Input name="address" value={formData.address} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Membership Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">بيانات العضوية</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>نوع العضوية</Label>
                <Select onValueChange={(v) => handleSelectChange("member_type_id", v)} value={formData.member_type_id}>
                  <SelectTrigger><SelectValue placeholder="اختر نوع العضوية" /></SelectTrigger>
                  <SelectContent>
                    {memberTypes.map(type => (
                      <SelectItem key={type.id} value={String(type.id)}>{type.name_ar}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

        </div>

        <div className="flex items-center gap-3 mt-8 justify-end">
          <Button onClick={handleSave} disabled={loading} className="gap-2 min-w-[120px]">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {loading ? "جارٍ الحفظ..." : "حفظ العضو"}
          </Button>
          <Button onClick={() => window.print()} variant="outline" className="gap-2 bg-huc-orange text-huc-orange-foreground hover:bg-huc-orange/90 border-huc-orange">
            <Printer className="h-4 w-4" />
            طباعة
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
