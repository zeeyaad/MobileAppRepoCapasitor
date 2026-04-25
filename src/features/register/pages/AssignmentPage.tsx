import { motion } from 'framer-motion';
import { CheckCircle, Home, Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';
const HUCLogo = "/assets/HUC logo.jpeg";

/**
 * AssignmentPage Component
 * 
 * Final success page in the registration flow.
 * Displays the assignment form with download and print functionality.
 */
export const AssignmentPage = () => {



    /**
     * Navigate back to landing page
     */
    const handleDone = () => {
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen bg-slate-50 font-['Cairo']" dir="rtl">
            <div className="container mx-auto px-4 max-w-5xl py-12">
                {/* Logo Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex justify-center mb-8 no-print"
                >
                    <img
                        src={HUCLogo}
                        alt="نادي جامعة حلوان"
                        className="h-20 w-auto object-contain"
                    />
                </motion.div>

                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'circOut' }}
                    className="text-center mb-12"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6"
                    >
                        <CheckCircle className="w-16 h-16 text-green-600" strokeWidth={2.5} />
                    </motion.div>

                    <h1 className="text-4xl font-bold text-[#1a5f7a] mb-3">
                        تم التسجيل بنجاح!
                    </h1>
                    <p className="text-xl text-gray-600 mt-4 font-semibold">
                        يرجى التوجه إلى المقر لاستكمال الإجراءات
                    </p>
                </motion.div>

                {/* Navigation - Done Button */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-center mt-8"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleDone}
                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#2596be] hover:bg-[#1a7a9a] text-white font-bold rounded-xl shadow-lg shadow-[#2596be]/20 transition-all"
                    >
                        <Home className="w-5 h-5" />
                        العودة إلى الصفحة الرئيسية
                    </motion.button>
                </motion.div>


            </div>

            {/* Footer */}
            <footer className="bg-[#0e1c38] text-white pt-16 pb-10 rounded-t-[3rem] mt-16 no-print">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">

                        {/* Club Info Section */}
                        <div className="max-w-sm">
                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    src={HUCLogo}
                                    alt="نادي جامعة حلوان"
                                    className="w-16 h-16 object-contain bg-white rounded-lg p-2"
                                />
                                <div>
                                    <h3 className="font-bold text-2xl">نادي جامعة حلوان</h3>
                                    <p className="text-[#f8941c] font-medium">عراقة.. رياضة.. حياة</p>
                                </div>
                            </div>
                            <p className="text-gray-400 leading-relaxed font-normal">
                                وجهتك الأولى للرياضة والترفيه. نقدم لك مجتمع رياضي متكامل بخدمات عالمية تناسب كل أفراد الأسرة.
                            </p>
                        </div>

                        {/* Quick Links & Contact */}
                        <div className="grid grid-cols-2 gap-12">
                            {/* Quick Links */}
                            <div>
                                <h4 className="font-bold text-lg mb-6 text-white">روابط سريعة</h4>
                                <ul className="space-y-4 text-gray-400">
                                    <li>
                                        <button
                                            onClick={() => window.location.href = '/'}
                                            className="hover:text-indigo-400 transition-colors"
                                        >
                                            الرئيسية
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => window.location.href = '/re'}
                                            className="hover:text-indigo-400 transition-colors"
                                        >
                                            التسجيل
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => window.location.href = '/login'}
                                            className="hover:text-indigo-400 transition-colors"
                                        >
                                            تسجيل الدخول
                                        </button>
                                    </li>
                                </ul>
                            </div>

                            {/* Contact Info */}
                            <div>
                                <h4 className="font-bold text-lg mb-6 text-white">تواصل معنا</h4>
                                <ul className="space-y-4 text-gray-400 text-sm">
                                    <li className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-[#2596be]" />
                                        <a href="https://maps.app.goo.gl/QHexupLs17Y7u7rF6" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">الموقع على الخريطة</a>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-[#2596be]" />
                                        1913641
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-[#2596be]" />
                                        huc@hq.helwan.edu.eg
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-gray-500 text-sm">
                            © {new Date().getFullYear()} نادي جامعة حلوان — جميع الحقوق محفوظة
                        </p>

                        {/* Social Media Icons */}
                        <div className="flex gap-4">
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1877F2] transition-colors"
                                aria-label="Facebook"
                            >
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#E4405F] transition-colors"
                                aria-label="Instagram"
                            >
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#1DA1F2] transition-colors"
                                aria-label="Twitter"
                            >
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>


        </div>
    );
};

export default AssignmentPage;
