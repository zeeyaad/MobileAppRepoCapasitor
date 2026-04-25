import { useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Check, UploadCloud, ChevronRight, Loader2 } from 'lucide-react';
import type { RegisterFormValues } from '../schemas/validation';
import type { FileUploadMap } from '../utils/submissionFactory';

interface Step4FilesProps {
    files: FileUploadMap;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>, key: keyof FileUploadMap) => void;
    onPrev: () => void;
    onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    isSubmitting: boolean;
}

/**
 * File Upload Box Component
 */
const FileBox = ({
    label,
    id,
    files,
    refs,
    onChange,
}: {
    label: string;
    id: keyof FileUploadMap;
    files: FileUploadMap;
    refs: React.MutableRefObject<{ [key: string]: HTMLInputElement | null }>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>, key: keyof FileUploadMap) => void;
}) => (
    <div
        onClick={() => refs.current[id]?.click()}
        className={`
      relative border-2 border-dashed p-5 rounded-2xl min-h-[160px] cursor-pointer transition-all duration-300 group
      flex flex-col items-center justify-center text-center
      ${files[id] ? 'border-[#2596be] bg-[#e8f4f8]/50' : 'border-gray-200 bg-gray-50 hover:border-[#2596be]/50 hover:bg-white'}
    `}
    >
        <input
            type="file"
            hidden
            ref={(el) => {
                refs.current[id] = el;
            }}
            onChange={(e) => onChange(e, id)}
            accept="image/*,application/pdf"
        />

        <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors
        ${files[id] ? 'bg-[#e8f4f8] text-[#2596be]' : 'bg-gray-200 text-gray-500 group-hover:bg-[#e8f4f8] group-hover:text-[#2596be]'}`}
        >
            {files[id] ? <Check size={24} /> : <UploadCloud size={24} />}
        </div>

        <p className={`font-bold text-base ${files[id] ? 'text-[#1a5f7a]' : 'text-gray-600'}`}>
            {label}
        </p>

        <p className="text-sm text-gray-400 mt-1 max-w-[180px] truncate">
            {files[id] ? files[id].name : 'اضغط لرفع الملف (PDF, JPG)'}
        </p>
    </div>
);

/**
 * Step 4: File Uploads
 * 
 * Handles category-specific document uploads.
 * Files are managed in parent state and passed down as props.
 */
export const Step4Files = ({ files, onFileChange, onPrev, onSubmit, isSubmitting }: Step4FilesProps) => {
    const { watch } = useFormContext<RegisterFormValues>();
    const category = watch('category');
    const memberRole = watch('memberRole');
    const fileRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    // Check if this is a team member (sports player)
    const isTeamMember = memberRole === 'sports_player';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl shadow-xl p-6 md:p-7 max-w-5xl mx-auto"
        >
            <h2 className="text-2xl font-bold text-[#1a5f7a] mb-5 text-center">المرفقات والمستندات</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* ===== TEAM MEMBER FILES (Sports Player) ===== */}
                {isTeamMember ? (
                    <>
                        {/* Personal Photo - Required */}
                        <div>
                            <FileBox
                                label="صورة شخصية حديثة *"
                                id="photo"
                                files={files}
                                refs={fileRefs}
                                onChange={onFileChange}
                            />
                        </div>

                        {/* National ID Front - Required */}
                        <div>
                            <FileBox
                                label="صورة البطاقة (أمام) *"
                                id="id_front"
                                files={files}
                                refs={fileRefs}
                                onChange={onFileChange}
                            />
                        </div>

                        {/* National ID Back - Required */}
                        <div>
                            <FileBox
                                label="صورة البطاقة (خلف) *"
                                id="id_back"
                                files={files}
                                refs={fileRefs}
                                onChange={onFileChange}
                            />
                        </div>

                        {/* Proof Document - Required */}
                        <div>
                            <FileBox
                                label="مستند إثبات *"
                                id="proof"
                                files={files}
                                refs={fileRefs}
                                onChange={onFileChange}
                            />
                        </div>

                        {/* Medical Report - Optional */}
                        <div>
                            <FileBox
                                label="تقرير طبي"
                                id="medical"
                                files={files}
                                refs={fileRefs}
                                onChange={onFileChange}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        {/* ===== SOCIAL MEMBER FILES ===== */}
                        {/* Personal Photo (Required for All) */}
                        <FileBox
                            label="صورة شخصية حديثة"
                            id="photo"
                            files={files}
                            refs={fileRefs}
                            onChange={onFileChange}
                        />

                        {/* Conditional: National ID or Passport */}
                        {category === 'foreigner' ? (
                            <FileBox
                                label="صورة جواز السفر"
                                id="passport"
                                files={files}
                                refs={fileRefs}
                                onChange={onFileChange}
                            />
                        ) : (
                            <>
                                <FileBox
                                    label="صورة البطاقة (أمام)"
                                    id="id_front"
                                    files={files}
                                    refs={fileRefs}
                                    onChange={onFileChange}
                                />
                                <FileBox
                                    label="صورة البطاقة (خلف)"
                                    id="id_back"
                                    files={files}
                                    refs={fileRefs}
                                    onChange={onFileChange}
                                />
                            </>
                        )}

                        {/* Category-Specific Documents */}
                        {(category === 'staff' || category === 'retired') && (
                            <FileBox
                                label="مفردات مرتب / بيان معاش"
                                id="salary_slip"
                                files={files}
                                refs={fileRefs}
                                onChange={onFileChange}
                            />
                        )}

                        {category === 'student' && (
                            <FileBox
                                label="إثبات قيد / شهادة تخرج"
                                id="student_proof"
                                files={files}
                                refs={fileRefs}
                                onChange={onFileChange}
                            />
                        )}

                        {category === 'dependent' && (
                            <FileBox
                                label="مستند إثبات القرابة"
                                id="relation_proof"
                                files={files}
                                refs={fileRefs}
                                onChange={onFileChange}
                            />
                        )}

                        {/* Medical Report (Optional for All) */}
                        <FileBox
                            label="تقرير طبي "
                            id="medical"
                            files={files}
                            refs={fileRefs}
                            onChange={onFileChange}
                        />
                    </>
                )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
                <button
                    onClick={onPrev}
                    type="button"
                    className="flex-1 px-4 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors flex items-center justify-center gap-2 text-sm sm:text-base sm:px-7"
                >
                    <ChevronRight size={20} /> السابق
                </button>
                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    type="button"
                    className="flex-[2] sm:flex-1 px-4 py-3 rounded-xl bg-[#2596be] hover:bg-[#1a7a9a] text-white font-bold shadow-lg shadow-[#2596be]/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base sm:px-9"
                >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Check size={24} />}
                    {isSubmitting ? 'جاري المعالجة...' : 'تأكيد التسجيل'}
                </button>
            </div>
        </motion.div>
    );
};
