# Manager Dashboard Mobile — دليل التشغيل

## 1. تثبيت المتطلبات

```bash
cd /Users/hashemahmed/Downloads/manager-dashboard-mobile
npm install
```

## 2. ضبط عنوان API

افتح الملف:
```
src/api/config.ts
```
غيّر السطر:
```ts
BASE_URL: 'https://YOUR_ERP_SERVER/api',
```
إلى عنوان سيرفر الـ ERP الفعلي.

## 3. تشغيل التطبيق

```bash
# iOS
npx expo start --ios

# Android
npx expo start --android

# أو Metro bundler فقط
npx expo start
```

## 4. هيكل المشروع

```
src/
├── api/           ← كل الـ API calls (39 endpoint)
├── constants/     ← الألوان والكروت (نفس الويب بالضبط)
├── context/       ← ThemeContext + AppContext (state management)
├── i18n/          ← ترجمة عربي + إنجليزي (نفس مفاتيح ar.json)
├── components/
│   ├── cards/     ← 13 كارت
│   ├── common/    ← DataTable, Spinner, SparklineChart, KpiRow
│   ├── dashboard/ ← Header, PeriodFilter, CardSettings
│   ├── brief/     ← DailyBrief (AI)
│   └── ai/        ← AIChat
├── popups/        ← 13 popup (full-screen modals)
├── screens/       ← LoginScreen + DashboardScreen
└── utils/         ← formatNum, formatDate, periodLabels
```

## 5. المطابقة مع الويب

| الخاصية | الويب (Angular) | الموبايل (React Native) |
|---------|----------------|------------------------|
| الألوان | SCSS variables | colors.ts (نفس الـ hex) |
| الكروت | 13 card | 13 CardComponent |
| الـ Popups | Angular Modal | Full-screen Modal |
| الـ Charts | PrimeNG/Chart.js | react-native-gifted-charts |
| الترجمة | ngx-translate | i18next |
| الكاشينج | Map per FilterType | Map per FilterType (نفس المنطق) |
| Race conditions | loadToken | loadToken (نفس الفكرة) |
| UserPrefs | API + localStorage | API + AsyncStorage |
| Daily Brief | شريط أعلى الصفحة | شريط قابل للتمرير |
| AI Chat | Side panel | Bottom sheet |
