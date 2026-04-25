/**
 * Internationalization (i18n) Module
 * Handles multilingual support for English and Arabic
 */

import { Request } from 'express';

type Language = 'en' | 'ar';

interface LocalizationMessages {
  [key: string]: {
    en: string;
    ar: string;
  };
}

const messages: LocalizationMessages = {
  // Student Member Messages
  STUDENT_STATUS_OPTIONS_SUCCESS: {
    en: 'Student status options retrieved successfully',
    ar: 'تم استرجاع خيارات حالة الطالب بنجاح',
  },
  STUDENT_STATUS_OPTIONS_ERROR: {
    en: 'Error retrieving student status options',
    ar: 'خطأ في استرجاع خيارات حالة الطالب',
  },
  RELATIONSHIP_TYPES_SUCCESS: {
    en: 'Relationship types retrieved successfully',
    ar: 'تم استرجاع أنواع العلاقات بنجاح',
  },
  RELATIONSHIP_TYPES_ERROR: {
    en: 'Error retrieving relationship types',
    ar: 'خطأ في استرجاع أنواع العلاقات',
  },
  ACTIVE_MEMBERS_SUCCESS: {
    en: 'Active members retrieved successfully',
    ar: 'تم استرجاع الأعضاء النشطين بنجاح',
  },
  ACTIVE_MEMBERS_ERROR: {
    en: 'Error retrieving active members',
    ar: 'خطأ في استرجاع الأعضاء النشطين',
  },
  STUDENT_DETAILS_SUCCESS: {
    en: 'Student member details submitted successfully',
    ar: 'تم تقديم بيانات عضو الطالب بنجاح',
  },
  STUDENT_DETAILS_ERROR: {
    en: 'Error submitting student member details',
    ar: 'خطأ في تقديم بيانات عضو الطالب',
  },
  PRICE_CALCULATED_SUCCESS: {
    en: 'Student membership price calculated successfully',
    ar: 'تم حساب سعر عضوية الطالب بنجاح',
  },
  PRICE_CALCULATED_ERROR: {
    en: 'Error calculating membership price',
    ar: 'خطأ في حساب سعر العضوية',
  },
  MEMBERSHIP_CREATED_SUCCESS: {
    en: 'Student membership created successfully',
    ar: 'تم إنشاء عضوية الطالب بنجاح',
  },
  MEMBERSHIP_CREATED_ERROR: {
    en: 'Error creating student membership',
    ar: 'خطأ في إنشاء عضوية الطالب',
  },
  DEPENDENT_PRICE_CALCULATED_SUCCESS: {
    en: 'Dependent membership price calculated successfully',
    ar: 'تم حساب سعر عضوية المعال بنجاح',
  },
  DEPENDENT_PRICE_CALCULATED_ERROR: {
    en: 'Error calculating dependent membership price',
    ar: 'خطأ في حساب سعر عضوية المعال',
  },
  DEPENDENT_MEMBERSHIP_CREATED_SUCCESS: {
    en: 'Student dependent membership created successfully',
    ar: 'تم إنشاء عضوية المعال للطالب بنجاح',
  },
  DEPENDENT_MEMBERSHIP_CREATED_ERROR: {
    en: 'Error creating student dependent membership',
    ar: 'خطأ في إنشاء عضوية المعال للطالب',
  },
  STUDENT_STATUS_RETRIEVED_SUCCESS: {
    en: 'Student member status retrieved successfully',
    ar: 'تم استرجاع حالة عضو الطالب بنجاح',
  },
  STUDENT_STATUS_RETRIEVED_ERROR: {
    en: 'Error retrieving student member status',
    ar: 'خطأ في استرجاع حالة عضو الطالب',
  },

  // Validation Messages
  MISSING_REQUIRED_FIELDS: {
    en: 'Missing required fields',
    ar: 'حقول مطلوبة مفقودة',
  },
  INVALID_STUDENT_STATUS: {
    en: 'Invalid student_status. Must be STUDENT or GRADUATE',
    ar: 'حالة الطالب غير صحيحة. يجب أن تكون STUDENT أو GRADUATE',
  },
  INVALID_GRADUATION_YEAR: {
    en: 'Invalid graduation year',
    ar: 'سنة التخرج غير صحيحة',
  },
  INVALID_MEMBER_ID: {
    en: 'Invalid member_id',
    ar: 'معرف العضو غير صحيح',
  },
  INVALID_RELATIONSHIP_TYPE: {
    en: 'Invalid relationship_type. Must be one of: spouse, child, parent, orphan',
    ar: 'نوع العلاقة غير صحيح. يجب أن يكون أحد: spouse, child, parent, orphan',
  },
  MEMBER_NOT_FOUND: {
    en: 'Member not found',
    ar: 'العضو غير موجود',
  },
  RELATED_MEMBER_NOT_FOUND: {
    en: 'Related member not found or has no active membership',
    ar: 'العضو المرتبط غير موجود أو لا يملك عضوية نشطة',
  },

  // Working Member Messages
  WORKING_DETAILS_SUCCESS: {
    en: 'Working member details submitted successfully',
    ar: 'تم تقديم بيانات عضو العاملين بنجاح',
  },
  WORKING_DETAILS_ERROR: {
    en: 'Error submitting working member details',
    ar: 'خطأ في تقديم بيانات عضو العاملين',
  },
  WORKING_MEMBERSHIP_CREATED_SUCCESS: {
    en: 'Working membership created successfully',
    ar: 'تم إنشاء عضوية العاملين بنجاح',
  },
  WORKING_MEMBERSHIP_CREATED_ERROR: {
    en: 'Error creating working membership',
    ar: 'خطأ في إنشاء عضوية العاملين',
  },

  // Retired Member Messages
  RETIRED_DETAILS_SUCCESS: {
    en: 'Retired member details submitted successfully',
    ar: 'تم تقديم بيانات عضو المتقاعدين بنجاح',
  },
  RETIRED_DETAILS_ERROR: {
    en: 'Error submitting retired member details',
    ar: 'خطأ في تقديم بيانات عضو المتقاعدين',
  },
  RETIRED_MEMBERSHIP_CREATED_SUCCESS: {
    en: 'Retired membership created successfully',
    ar: 'تم إنشاء عضوية المتقاعدين بنجاح',
  },
  RETIRED_MEMBERSHIP_CREATED_ERROR: {
    en: 'Error creating retired membership',
    ar: 'خطأ في إنشاء عضوية المتقاعدين',
  },

  // Dependent Member Messages
  DEPENDENT_SUBTYPE_SUCCESS: {
    en: 'Dependent subtypes retrieved successfully',
    ar: 'تم استرجاع أنواع المعالين بنجاح',
  },
  DEPENDENT_SUBTYPE_ERROR: {
    en: 'Error retrieving dependent subtypes',
    ar: 'خطأ في استرجاع أنواع المعالين',
  },
  DEPENDENT_MEMBERSHIP_SUCCESS: {
    en: 'Dependent membership created successfully',
    ar: 'تم إنشاء عضوية المعال بنجاح',
  },
  DEPENDENT_MEMBERSHIP_ERROR: {
    en: 'Error creating dependent membership',
    ar: 'خطأ في إنشاء عضوية المعال',
  },
  DEPENDENT_STATUS_SUCCESS: {
    en: 'Dependent member status retrieved successfully',
    ar: 'تم استرجاع حالة عضو المعال بنجاح',
  },
  DEPENDENT_STATUS_ERROR: {
    en: 'Error retrieving dependent member status',
    ar: 'خطأ في استرجاع حالة عضو المعال',
  },

  // Visitor Member Messages
  VISITOR_MEMBERSHIP_CREATED_SUCCESS: {
    en: 'Visitor membership created successfully',
    ar: 'تم إنشاء عضوية الزائر بنجاح',
  },
  VISITOR_MEMBERSHIP_CREATED_ERROR: {
    en: 'Error creating visitor membership',
    ar: 'خطأ في إنشاء عضوية الزائر',
  },

  // General Messages
  INTERNAL_SERVER_ERROR: {
    en: 'Internal server error',
    ar: 'خطأ داخلي في الخادم',
  },
  SUCCESS: {
    en: 'Success',
    ar: 'نجاح',
  },
  ERROR: {
    en: 'Error',
    ar: 'خطأ',
  },
};

/**
 * Get message in specified language
 * @param key - Message key
 * @param language - Language code ('en' or 'ar')
 * @returns Localized message string
 */
export function getMessage(key: string, language: Language = 'en'): string {
  if (!messages[key]) {
    console.warn(`Missing translation for key: ${key}`);
    return key;
  }
  return messages[key][language] || messages[key]['en'];
}

/**
 * Extract language from request headers
 * Checks 'Accept-Language' or 'X-Language' header
 * Defaults to 'en' if not specified
 * @param req - Express Request object
 * @returns Language code ('en' or 'ar')
 */
export function getLanguageFromRequest(req: any): Language {
  // Check custom header first
  const customLang = req.headers['x-language'] as string;
  if (customLang === 'ar' || customLang === 'en') {
    return customLang;
  }

  // Check Accept-Language header
  const acceptLanguage = req.headers['accept-language'] as string;
  if (acceptLanguage) {
    if (acceptLanguage.includes('ar')) return 'ar';
    if (acceptLanguage.includes('en')) return 'en';
  }

  // Check query parameter
  const queryLang = req.query.lang as string;
  if (queryLang === 'ar' || queryLang === 'en') {
    return queryLang;
  }

  // Default to English
  return 'en';
}

/**
 * Create localized response
 * @param success - Success status
 * @param messageKey - Message key for localization
 * @param language - Language code
 * @param data - Response data
 * @returns Localized response object
 */
export function createLocalizedResponse(
  success: boolean,
  messageKey: string,
  language: Language = 'en',
  data?: any
): object {
  return {
    success,
    message: getMessage(messageKey, language),
    ...(data && { data }),
  };
}

/**
 * Create localized error response
 * @param messageKey - Error message key
 * @param language - Language code
 * @param error - Optional error details
 * @returns Localized error response object
 */
export function createLocalizedError(
  messageKey: string,
  language: Language = 'en',
  error?: any
): object {
  return {
    success: false,
    message: getMessage(messageKey, language),
    ...(error && { error: error.message || error }),
  };
}

export const i18n = {
  getMessage,
  getLanguageFromRequest,
  createLocalizedResponse,
  createLocalizedError,
};
