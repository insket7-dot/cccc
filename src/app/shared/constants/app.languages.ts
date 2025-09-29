import { MenuItem } from '@rydeen/angular-framework';

export type LanguageItem = MenuItem & {
    short?: string;
};

export const SUPPORT_LANGUAGES: LanguageItem[] = [
    { id: 'zh-cn', name: '中文（简体）', short: '中', available: true },
    { id: 'zh-tw', name: '中文（繁體）', available: false },
    { id: 'en-us', name: 'English', short: 'En', available: true },
    { id: 'ja-jp', name: '日本語' },
    { id: 'ko-kr', name: '한국어' },
    { id: 'ru-ru', name: 'Русский' },
    { id: 'fr-fr', name: 'Français' },
    { id: 'de-de', name: 'Deutsch' },
    { id: 'es-es', name: 'Español' },
    { id: 'it-it', name: 'Italiano' },
    { id: 'pt-pt', name: 'Português' },
    { id: 'vi-vn', name: 'Tiếng Việt' },
    { id: 'th-th', name: 'ไทย' },
    { id: 'ms-my', name: 'Bahasa Melayu' },
    { id: 'id-id', name: 'Bahasa Indonesia' },
    { id: 'ar-sa', name: 'العربية' },
    { id: 'tr-tr', name: 'Türkçe' },
    { id: 'hi-in', name: 'हिन्दी' },
    { id: 'bn-bd', name: 'বাংলা' },
    { id: 'ur-pk', name: 'اردو' },
    { id: 'fa-ir', name: 'فارسی' },
    { id: 'sw-ke', name: 'Kiswahili' },
    { id: 'am-et', name: 'አማርኛ' },
    { id: 'fil-ph', name: 'Filipino' },
    { id: 'my-mm', name: 'မြန်မာ' },
    { id: 'km-kh', name: 'ភាសាខ្មែរ' },
    { id: 'lo-la', name: 'ພາສາລາວ' },
    { id: 'ne-np', name: 'नेपाली' },
];
