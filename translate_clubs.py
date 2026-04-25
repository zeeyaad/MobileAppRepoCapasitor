import re
import json

path = 'd:/GPProjectRepo/src/Component/LandingPageComponents/Clubs.tsx'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

if 'useTranslation' not in code:
    code = code.replace('import React', 'import { useTranslation } from \'react-i18next\';\nimport React')

if 'const { t } = useTranslation(' not in code:
    code = code.replace('const Clubs: React.FC<ClubsProps> = ({ onNavigate }) => {', 'const Clubs: React.FC<ClubsProps> = ({ onNavigate }) => {\n  const { t } = useTranslation("landing");')

# Move clubsData inside component if possible or just use i18n directly.
# Better to wrap the strings in the render directly. 
# Look for currentClub.nameAr
code = code.replace('currentClub.nameAr', 't(`clubs.names.${currentClub.id}`, currentClub.nameAr)')
code = code.replace('club.nameAr', 't(`clubs.names.${club.id}`, club.nameAr)')
code = code.replace('currentService.nameAr', 't(`clubs.services.${selectedService}.name`, currentService.nameAr)')
code = code.replace('currentService.descriptionAr', 't(`clubs.services.${selectedService}.desc`, currentService.descriptionAr)')

# Other strings
replacements = [
    (r'>الفروع<', '>{t("clubs.title", "الفروع")}<'),
    (r'>اختر الفرع<', '>{t("clubs.select_branch", "اختر الفرع")}<'),
    (r'>العنوان<', '>{t("common.address", "العنوان")}<'),
    (r'>ملاعب<', '>{t("clubs.courts", "ملاعب")}<'),
    (r'>حمامات سباحة<', '>{t("clubs.pools", "حمامات سباحة")}<'),
    (r'>مطاعم<', '>{t("clubs.restaurants", "مطاعم")}<'),
    (r'>منطقة أطفال<', '>{t("clubs.kids_area", "منطقة أطفال")}<'),
    (r'>الأكاديميات الرياضية<', '>{t("clubs.academies_title", "الأكاديميات الرياضية")}<'),
    (r'>كرة القدم<', '>{t("sports.names.football", "كرة القدم")}<'),
    (r'>التنس<', '>{t("sports.names.tennis", "التنس")}<'),
    (r'>السباحة<', '>{t("sports.names.swimming", "السباحة")}<'),
    (r'>كرة السلة<', '>{t("sports.names.basketball", "كرة السلة")}<'),
    (r'>لاعبين<', '>{t("clubs.players", "لاعبين")}<'),
    (r'>مدربين<', '>{t("clubs.coaches", "مدربين")}<'),
    (r'>الأكاديمية هي واحدة من أكبر أكاديميات كرة القدم في المنطقة\. يبدأ التسجيل من 4 سنوات لكلا الجنسين\. يتم تقييم اللاعبين على أساس ربع سنوي\.<', '>{t("clubs.academy_desc", "الأكاديمية هي واحدة من أكبر أكاديميات كرة القدم في المنطقة. يبدأ التسجيل من 4 سنوات لكلا الجنسين. يتم تقييم اللاعبين على أساس ربع سنوي.")}<'),
    (r'>كن عضوا<', '>{t("clubs.become_member", "كن عضوا")}<'),
    (r'>المزيد من التفاصيل<', '>{t("clubs.more_details", "المزيد من التفاصيل")}<'),
    (r'>صالة الألعاب الرياضية<', '>{t("clubs.gym.title", "صالة الألعاب الرياضية")}<'),
    (r'>صالة الألعاب الرياضية لدينا مزودة بأحدث المعدات والمدربين الشخصيين المحترفين، جاهزة لمساعدتك على تحقيق أحلامك الصحية والبدنية والعيش بنمط حياة صحي\.<', '>{t("clubs.gym.desc", "صالة الألعاب الرياضية لدينا مزودة بأحدث المعدات والمدربين الشخصيين المحترفين، جاهزة لمساعدتك على تحقيق أحلامك الصحية والبدنية والعيش بنمط حياة صحي.")}<'),
    (r'>اشترك الآن<', '>{t("clubs.subscribe_now", "اشترك الآن")}<'),
    (r'>خدمات أخرى<', '>{t("clubs.other_services", "خدمات أخرى")}<'),
    (r'>منطقة اجتماعية<', '>{t("clubs.services.social.name", "منطقة اجتماعية")}<'),
    (r'>منطقة الأطفال<', '>{t("clubs.services.kids.name", "منطقة الأطفال")}<'),
    (r'>وادي الفنون<', '>{t("clubs.services.wadi.name", "وادي الفنون")}<'),
    (r'>المطاعم<', '>{t("clubs.services.restaurants.name", "المطاعم")}<'),
    (r'>المكتبة<', '>{t("clubs.services.library.name", "المكتبة")}<'),
    (r'dir="rtl"', ''),
]

for pat, rep in replacements:
    code = re.sub(pat, rep, code)

with open(path, 'w', encoding='utf-8') as f:
    f.write(code)

print("Replacement complete")

# Update JSON files
ar_path = 'd:/GPProjectRepo/src/locales/ar.json'
en_path = 'd:/GPProjectRepo/src/locales/en.json'

with open(ar_path, 'r', encoding='utf-8') as f:
    ar = json.load(f)
with open(en_path, 'r', encoding='utf-8') as f:
    en = json.load(f)

ar['clubs'] = {
  'title': 'الفروع',
  'select_branch': 'اختر الفرع',
  'courts': 'ملاعب',
  'pools': 'حمامات سباحة',
  'restaurants': 'مطاعم',
  'kids_area': 'منطقة أطفال',
  'academies_title': 'الأكاديميات الرياضية',
  'players': 'لاعبين',
  'coaches': 'مدربين',
  'academy_desc': 'الأكاديمية هي واحدة من أكبر أكاديميات كرة القدم في المنطقة. يبدأ التسجيل من 4 سنوات لكلا الجنسين. يتم تقييم اللاعبين على أساس ربع سنوي.',
  'become_member': 'كن عضوا',
  'more_details': 'المزيد من التفاصيل',
  'gym': {
    'title': 'صالة الألعاب الرياضية',
    'desc': 'صالة الألعاب الرياضية لدينا مزودة بأحدث المعدات والمدربين الشخصيين المحترفين، جاهزة لمساعدتك على تحقيق أحلامك الصحية والبدنية والعيش بنمط حياة صحي.'
  },
  'subscribe_now': 'اشترك الآن',
  'other_services': 'خدمات أخرى',
  'names': {
    'maadi': 'المعادي',
    'manshiyat': 'منشية ناصر',
    'matarya': 'مطرية'
  },
  'services': {
    'social': {
      'name': 'منطقة اجتماعية',
      'desc': 'استمتع بأوقات رائعة مع الأصدقاء والعائلة في منطقتنا الاجتماعية الفاخرة المجهزة بكل وسائل الراحة.'
    },
    'kids': {
      'name': 'منطقة الأطفال',
      'desc': 'منطقة آمنة وممتعة للأطفال مع أنشطة تعليمية وترفيهية متنوعة تحت إشراف متخصصين.'
    },
    'wadi': {
      'name': 'وادي الفنون',
      'desc': 'استكشف عالم الفنون والإبداع في وادي الفنون حيث يمكنك تطوير مهاراتك الفنية والثقافية.'
    },
    'restaurants': {
      'name': 'المطاعم',
      'desc': 'تمتع بتجربة طهي فريدة في مطاعمنا الراقية التي تقدم أشهى الأطباق المحلية والعالمية.'
    },
    'library': {
      'name': 'المكتبة',
      'desc': 'مكتبة حديثة تضم آلاف الكتب والمراجع في مختلف المجالات للقراءة والاستزادة من المعرفة.'
    }
  }
}

en['clubs'] = {
  'title': 'Branches',
  'select_branch': 'Select Branch',
  'courts': 'Courts',
  'pools': 'Swimming Pools',
  'restaurants': 'Restaurants',
  'kids_area': 'Kids Area',
  'academies_title': 'Sports Academies',
  'players': 'Players',
  'coaches': 'Coaches',
  'academy_desc': 'The academy is one of the largest football academies in the region. Registration starts from 4 years old for both genders. Players are evaluated quarterly.',
  'become_member': 'Become a Member',
  'more_details': 'More Details',
  'gym': {
    'title': 'Gymnasium',
    'desc': 'Our gym is equipped with the latest equipment and professional personal trainers, ready to help you achieve your health and fitness dreams and live a healthy lifestyle.'
  },
  'subscribe_now': 'Subscribe Now',
  'other_services': 'Other Services',
  'names': {
    'maadi': 'Maadi',
    'manshiyat': 'Manshiyat Naser',
    'matarya': 'Matariya'
  },
  'services': {
    'social': {
      'name': 'Social Area',
      'desc': 'Enjoy great times with friends and family in our luxurious social area equipped with all amenities.'
    },
    'kids': {
      'name': 'Kids Area',
      'desc': 'A safe and fun area for children with various educational and entertaining activities under expert supervision.'
    },
    'wadi': {
      'name': 'Arts Valley',
      'desc': 'Explore the world of arts and creativity in the Arts Valley where you can develop your artistic and cultural skills.'
    },
    'restaurants': {
      'name': 'Restaurants',
      'desc': 'Enjoy a unique culinary experience in our fine dining restaurants serving delicious local and international cuisines.'
    },
    'library': {
      'name': 'Library',
      'desc': 'A modern library containing thousands of books and references in various fields for reading and acquiring knowledge.'
    }
  }
}

with open(ar_path, 'w', encoding='utf-8') as f:
    json.dump(ar, f, ensure_ascii=False, indent=2)
with open(en_path, 'w', encoding='utf-8') as f:
    json.dump(en, f, ensure_ascii=False, indent=2)

print("JSON updated")
