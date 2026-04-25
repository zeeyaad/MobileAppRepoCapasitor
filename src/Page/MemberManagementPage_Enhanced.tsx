import { useState } from "react";
import { useForm } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { memberEditSchema, type MemberEditFormValues } from "../features/admin/schemas/memberEditValidation";
import { ValidatedInput } from "../features/admin/components/ValidatedInput";
import { Button } from "../Component/StaffPagesComponents/ui/button";
import { Label } from "../Component/StaffPagesComponents/ui/label";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter,
} from "../Component/StaffPagesComponents/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../Component/StaffPagesComponents/ui/select";

// Phone number formatting function
const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7)}`;
};

// Enhanced Edit Dialog Component
const EnhancedEditDialog = ({ 
    open, 
    onOpenChange, 
    memberData, 
    onSave,
    isSaving,
    // Document/photo props
    photoFile,
    setPhotoFile,
    idFrontFile,
    setIdFrontFile,
    idBackFile,
    setIdBackFile,
    medicalFile,
    setMedicalFile,
    selectedRow,
    selectedDetail,
    getFileUrl,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    memberData: any;
    onSave: (data: MemberEditFormValues) => Promise<void>;
    isSaving: boolean;
    photoFile: File | null;
    setPhotoFile: (f: File | null) => void;
    idFrontFile: File | null;
    setIdFrontFile: (f: File | null) => void;
    idBackFile: File | null;
    setIdBackFile: (f: File | null) => void;
    medicalFile: File | null;
    setMedicalFile: (f: File | null) => void;
    selectedRow: any;
    selectedDetail: any;
    getFileUrl: (path?: string) => string | undefined;
}) => {
    const [editTab, setEditTab] = useState<'info' | 'docs'>('info');

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        setValue,
        watch,
        trigger
    } = useForm<MemberEditFormValues>({
        resolver: zodResolver(memberEditSchema),
        mode: 'onChange',
        defaultValues: {
            first_name_ar: memberData?.firstNameAr || '',
            last_name_ar: memberData?.lastNameAr || '',
            first_name_en: memberData?.firstNameEn || '',
            last_name_en: memberData?.lastNameEn || '',
            gender: memberData?.gender || '',
            phone: memberData?.phone || '',
            birthdate: memberData?.birthdate ? String(memberData.birthdate).slice(0, 10) : '',
            nationality: memberData?.nationality || '',
            address: memberData?.address || '',
            health_status: memberData?.healthStatus || '',
        }
    });

    const phone = watch('phone');

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setValue('phone', formatted.replace(/\s/g, ''));
        trigger('phone');
    };

    const onSubmit = async (data: MemberEditFormValues) => {
        await onSave(data);
    };

    // Reset tab when dialog opens
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) setEditTab('info');
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-xl" dir="rtl">
                <DialogHeader>
                    <DialogTitle>تعديل بيانات العضو</DialogTitle>
                    <DialogDescription>تعديل المعلومات الشخصية والتواصل</DialogDescription>
                </DialogHeader>

                {/* ── Tab bar ── */}
                <div className="flex gap-0 border-b border-border -mx-1">
                    {([
                        { key: 'info', label: '👤 البيانات الشخصية' },
                        { key: 'docs', label: '🖼️ الصور والمستندات' },
                    ] as const).map(tab => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setEditTab(tab.key)}
                            className={`px-5 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px
                                ${editTab === tab.key
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* ── TAB 1: Personal Info ── */}
                    {editTab === 'info' && (
                        <div className="grid grid-cols-2 gap-3 py-2">
                            <ValidatedInput
                                label="الاسم الأول (عربي)"
                                placeholder="محمد"
                                dir="rtl"
                                {...register('first_name_ar')}
                                error={errors.first_name_ar?.message}
                                isValid={!errors.first_name_ar && Boolean(watch('first_name_ar'))}
                                showValidationIcon={true}
                                required
                            />
                            <ValidatedInput
                                label="اسم العائلة (عربي)"
                                placeholder="أحمد"
                                dir="rtl"
                                {...register('last_name_ar')}
                                error={errors.last_name_ar?.message}
                                isValid={!errors.last_name_ar && Boolean(watch('last_name_ar'))}
                                showValidationIcon={true}
                                required
                            />
                            <ValidatedInput
                                label="الاسم الأول (إنجليزي)"
                                placeholder="Mohamed"
                                dir="ltr"
                                {...register('first_name_en')}
                                error={errors.first_name_en?.message}
                                isValid={!errors.first_name_en && Boolean(watch('first_name_en'))}
                                showValidationIcon={true}
                                required
                            />
                            <ValidatedInput
                                label="اسم العائلة (إنجليزي)"
                                placeholder="Ahmed"
                                dir="ltr"
                                {...register('last_name_en')}
                                error={errors.last_name_en?.message}
                                isValid={!errors.last_name_en && Boolean(watch('last_name_en'))}
                                showValidationIcon={true}
                                required
                            />

                            {/* Gender */}
                            <div>
                                <Label className="text-xs font-medium">الجنس</Label>
                                <Select
                                    value={watch('gender')}
                                    onValueChange={(value) => {
                                        setValue('gender', value as 'male' | 'female' | 'other');
                                        trigger('gender');
                                    }}
                                >
                                    <SelectTrigger className={`mt-1 h-8 text-xs ${
                                        errors.gender ? 'border-red-500 bg-red-50' :
                                        watch('gender') ? 'border-green-500 bg-green-50' : ''
                                    }`}>
                                        <SelectValue placeholder="اختر" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">ذكر</SelectItem>
                                        <SelectItem value="female">أنثى</SelectItem>
                                        <SelectItem value="other">أخرى</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.gender && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        {errors.gender.message}
                                    </p>
                                )}
                            </div>

                            <ValidatedInput
                                label="تاريخ الميلاد"
                                type="date"
                                dir="ltr"
                                {...register('birthdate')}
                                error={errors.birthdate?.message}
                                isValid={!errors.birthdate && Boolean(watch('birthdate'))}
                                showValidationIcon={true}
                                required
                            />

                            <ValidatedInput
                                label="رقم الهاتف"
                                placeholder="01x xxx xxxx"
                                dir="ltr"
                                maxLength={11}
                                value={formatPhoneNumber(phone)}
                                onChange={handlePhoneChange}
                                error={errors.phone?.message}
                                isValid={!errors.phone && Boolean(phone)}
                                showValidationIcon={true}
                                required
                            />
                            <ValidatedInput
                                label="الجنسية"
                                placeholder="Egyptian"
                                dir="ltr"
                                {...register('nationality')}
                                error={errors.nationality?.message}
                                isValid={!errors.nationality && Boolean(watch('nationality'))}
                                showValidationIcon={true}
                                required
                            />

                            <div className="col-span-2">
                                <ValidatedInput
                                    label="العنوان"
                                    placeholder="القاهرة، مصر"
                                    {...register('address')}
                                    error={errors.address?.message}
                                    isValid={!errors.address && Boolean(watch('address'))}
                                    showValidationIcon={true}
                                />
                            </div>
                            <div className="col-span-2">
                                <ValidatedInput
                                    label="الحالة الصحية"
                                    placeholder="لا توجد أمراض مزمنة"
                                    {...register('health_status')}
                                    error={errors.health_status?.message}
                                    isValid={!errors.health_status && Boolean(watch('health_status'))}
                                    showValidationIcon={true}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── TAB 2: Documents & Photos ── */}
                    {editTab === 'docs' && (
                        <div className="py-2">
                            {selectedRow?.isTeamPlayer ? (
                                <div className="py-12 text-center text-muted-foreground text-sm">
                                    لا توجد مستندات لأعضاء الفريق
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {([
                                        {
                                            label: 'الصورة الشخصية',
                                            file: photoFile,
                                            setter: setPhotoFile,
                                            existing: selectedDetail?.photo,
                                            span: 'col-span-2',
                                            height: 'h-36'
                                        },
                                        {
                                            label: 'البطاقة القومية (أمام)',
                                            file: idFrontFile,
                                            setter: setIdFrontFile,
                                            existing: selectedDetail?.national_id_front,
                                            span: '',
                                            height: 'h-24'
                                        },
                                        {
                                            label: 'البطاقة القومية (خلف)',
                                            file: idBackFile,
                                            setter: setIdBackFile,
                                            existing: selectedDetail?.national_id_back,
                                            span: '',
                                            height: 'h-24'
                                        },
                                        {
                                            label: 'التقرير الطبي',
                                            file: medicalFile,
                                            setter: setMedicalFile,
                                            existing: selectedDetail?.medical_report,
                                            span: 'col-span-2',
                                            height: 'h-28'
                                        },
                                    ] as {
                                        label: string;
                                        file: File | null;
                                        setter: (f: File | null) => void;
                                        existing?: string;
                                        span: string;
                                        height: string;
                                    }[]).map(({ label, file, setter, existing, span, height }) => {
                                        const preview = file ? URL.createObjectURL(file) : getFileUrl(existing);
                                        return (
                                            <label key={label} className={`${span} flex flex-col gap-1.5 cursor-pointer group`}>
                                                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                                                <div className={`relative w-full ${height} rounded-xl border-2 border-dashed 
                                                    ${file ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 bg-muted/10'} 
                                                    overflow-hidden flex items-center justify-center 
                                                    group-hover:border-primary/60 transition-colors`}>
                                                    {preview ? (
                                                        <img src={preview} alt={label} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1.5 text-muted-foreground/50">
                                                            <span className="text-2xl">📎</span>
                                                            <span className="text-[11px]">اضغط لرفع صورة</span>
                                                        </div>
                                                    )}
                                                    {file && (
                                                        <button
                                                            type="button"
                                                            onClick={e => { e.preventDefault(); setter(null); }}
                                                            className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full 
                                                                bg-rose-500 text-white text-[10px] flex items-center 
                                                                justify-center hover:bg-rose-600 shadow"
                                                        >✕</button>
                                                    )}
                                                </div>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={e => e.target.files?.[0] && setter(e.target.files[0])}
                                                />
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="mt-2 gap-2 border-t border-border pt-3">
                        <Button
                            type="submit"
                            disabled={isSaving || !isValid}
                            size="sm"
                            className="text-xs"
                        >
                            {isSaving ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSaving}
                            size="sm"
                            className="text-xs"
                        >
                            إلغاء
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export { EnhancedEditDialog };
