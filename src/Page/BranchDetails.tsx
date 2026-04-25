// BranchDetails.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BRANCHES } from '../Component/BranchComponents/branchData';

interface BranchDetailsProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const BranchDetails: React.FC<BranchDetailsProps> = ({ isOpen = true, onClose }) => {
  console.log('BranchDetails component rendering with isOpen:', isOpen);

  // Default close handler - navigate back to home
  const defaultOnClose = () => {
    window.location.href = '/';
  };

  const handleClose = onClose || defaultOnClose;

  // Extract branch ID from route params (BrowserRouter: /branches/:branchId)
  const { branchId: paramBranchId } = useParams<{ branchId: string }>();
  const branchId = useMemo(() => {
    const id = paramBranchId || '';
    console.log('Extracted branch ID:', id);
    return id;
  }, [paramBranchId]);

  const branch = BRANCHES[branchId as keyof typeof BRANCHES];
  console.log('Available branches:', Object.keys(BRANCHES));
  console.log('Found branch:', branch);

  // Photo gallery state
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, handleClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Auto-play functionality for photo gallery
  useEffect(() => {
    if (!branch?.photos || branch.photos.length <= 1 || !autoPlay || !isOpen) return;

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevIndex) =>
        prevIndex === branch.photos.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change photo every 3 seconds

    return () => clearInterval(interval);
  }, [branch?.photos, autoPlay, isOpen]);

  // Reset photo index when branch changes
  useEffect(() => {
    setCurrentPhotoIndex(0);
  }, [branchId]);

  if (!isOpen) {
    console.log('Component not open, returning null');
    return null;
  }

  console.log('Component is open, proceeding with render');

  // Branch not found
  if (!branch) {
    console.log('Branch not found for ID:', branchId);
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center" dir="rtl">
        <div className="bg-white p-8 rounded-lg max-w-md w-full text-center shadow-lg">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            الفرع غير موجود
          </h2>
          <p className="text-gray-600 mb-4">
            عذراً، لم نتمكن من العثور على الفرع بالمعرف: {branchId}
          </p>
          <p className="text-sm text-gray-500 mb-4">
            الفروع المتاحة: {Object.keys(BRANCHES).join(', ')}
          </p>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  const handleCall = () => {
    window.open(`tel:${branch.phone}`);
  };

  const handleDirections = () => {
    // In a real app, this would open Google Maps with the address
    alert(`الحصول على الاتجاهات إلى ${branch.name} في ${branch.address}`);
  };

  const handleEmail = () => {
    window.open(`mailto:${branch.email}`);
  };

  // Photo gallery navigation functions
  const nextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) =>
      prevIndex === branch.photos.length - 1 ? 0 : prevIndex + 1
    );
    setAutoPlay(false); // Stop auto-play when user manually navigates
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prevIndex) =>
      prevIndex === 0 ? branch.photos.length - 1 : prevIndex - 1
    );
    setAutoPlay(false); // Stop auto-play when user manually navigates
  };

  const goToPhoto = (index: number) => {
    setCurrentPhotoIndex(index);
    setAutoPlay(false); // Stop auto-play when user manually navigates
  };

  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay);
  };

  console.log('Rendering branch details for:', branch.name);

  return (
    <div className="min-h-screen bg-gray-100 p-4" dir="rtl">
      <div className="bg-white rounded-xl max-w-4xl mx-auto shadow-lg">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">{branch.name}</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl transition-colors duration-200"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              {/* Branch Details */}
              <div className="space-y-4 mb-6">
                <DetailItem
                  icon="map-marker-alt"
                  iconColor="text-blue-500"
                  label="العنوان"
                  value={branch.address}
                />
                <DetailItem
                  icon="phone"
                  iconColor="text-green-500"
                  label="الهاتف"
                  value={branch.phone}
                />
                <DetailItem
                  icon="envelope"
                  iconColor="text-red-500"
                  label="البريد الإلكتروني"
                  value={branch.email}
                />
                <DetailItem
                  icon="user"
                  iconColor="text-purple-500"
                  label="مدير الفرع"
                  value={branch.manager || "غير محدد"}
                />
                <DetailItem
                  icon="clock"
                  iconColor="text-orange-500"
                  label="ساعات العمل"
                  value={branch.hours}
                />
              </div>

              {/* Facilities */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">المرافق</h3>
                <div className="flex flex-wrap gap-2">
                  {branch.facilities.map((facility, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">عن الفرع</h3>
                <p className="text-gray-700 leading-relaxed">
                  {branch.about}
                </p>
              </div>
            </div>

            <div>
              {/* Enhanced Photo Gallery */}
              {branch.photos && branch.photos.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-800">معرض الصور</h3>
                    {branch.photos.length > 1 && (
                      <button
                        onClick={toggleAutoPlay}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${autoPlay
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                      >
                        {autoPlay ? '⏸️ إيقاف التشغيل التلقائي' : '▶️ التشغيل التلقائي'}
                      </button>
                    )}
                  </div>

                  {/* Main Photo Display */}
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-200">
                    <img
                      src={branch.photos[currentPhotoIndex]}
                      alt={`${branch.name} - صورة ${currentPhotoIndex + 1}`}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />

                    {/* Navigation Arrows */}
                    {branch.photos.length > 1 && (
                      <>
                        <button
                          onClick={prevPhoto}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          ‹
                        </button>
                        <button
                          onClick={nextPhoto}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                          ›
                        </button>
                      </>
                    )}

                    {/* Photo Counter */}
                    {branch.photos.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                        {currentPhotoIndex + 1} / {branch.photos.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Navigation */}
                  {branch.photos.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {branch.photos.map((photo, index) => (
                        <button
                          key={index}
                          onClick={() => goToPhoto(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${index === currentPhotoIndex
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                          <img
                            src={photo}
                            alt={`${branch.name} - صورة مصغرة ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
            <ActionButton
              icon="phone"
              text="اتصل الآن"
              onClick={handleCall}
              variant="primary"
            />
            <ActionButton
              icon="map-marker-alt"
              text="احصل على الاتجاهات"
              onClick={handleDirections}
              variant="secondary"
            />
            <ActionButton
              icon="envelope"
              text="إرسال بريد إلكتروني"
              onClick={handleEmail}
              variant="secondary"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for detail items
interface DetailItemProps {
  icon: string;
  iconColor: string;
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, iconColor, label, value }) => {
  const getIconSymbol = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      'map-marker-alt': '📍',
      'phone': '📞',
      'envelope': '✉️',
      'user': '👤',
      'clock': '🕒'
    };
    return iconMap[iconName] || '•';
  };

  return (
    <div className="flex items-start space-x-reverse space-x-4">
      <div className={`w-6 h-6 flex-shrink-0 mt-0.5 ${iconColor} text-lg`}>
        {getIconSymbol(icon)}
      </div>
      <div>
        <p className="font-semibold text-gray-700">{label}</p>
        <p className="text-gray-600">{value}</p>
      </div>
    </div>
  );
};

// Sub-component for action buttons
interface ActionButtonProps {
  icon: string;
  text: string;
  onClick: () => void;
  variant: 'primary' | 'secondary';
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, text, onClick, variant }) => {
  const getIconSymbol = (iconName: string) => {
    const iconMap: { [key: string]: string } = {
      'phone': '📞',
      'map-marker-alt': '📍',
      'envelope': '✉️'
    };
    return iconMap[iconName] || '•';
  };

  const baseClasses = "flex-1 py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center";
  const variantClasses = variant === 'primary'
    ? "bg-blue-600 text-white hover:bg-blue-700"
    : "border border-gray-300 text-gray-700 hover:bg-gray-50";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      <span className="ml-2">{getIconSymbol(icon)}</span>
      {text}
    </button>
  );
};

export default BranchDetails;