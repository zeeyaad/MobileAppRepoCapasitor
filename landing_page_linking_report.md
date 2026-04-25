# Landing Page — Linking Analysis Report

> **Scope:** `Landingpage.tsx`, `Clubs.tsx`, `SportDetailedPG.tsx`, `router.tsx`, `banches.ts`  
> **Date:** 2026-04-18

---

## 🔴 Critical — Broken / Dead Buttons

### 1. Footer "الرياضات" → Wrong Tab Key

**File:** `Landingpage.tsx` — Line 899

```tsx
// ❌ BROKEN — lowercase "sports"
onClick={() => setActiveTab("sports")}
```

The `renderContent()` switch uses `"Sports"` (capital S, line 644) for `SportDetailedPG`.  
Lowercase `"sports"` (line 527) hits a **dead stub component** with hardcoded placeholder content.  
Clicking "الرياضات" in the footer shows a broken placeholder, **not** the real sports page.

**Fix:**
```tsx
// ✅ Correct
onClick={() => setActiveTab("Sports")}
```

---

### 2. Clubs — Sport Academy Dropdown is Completely Dead

**File:** `Clubs.tsx` — Lines 334–344

```tsx
// ❌ BROKEN — no value, no onChange
<select className="...">
  <option value="football">كرة القدم</option>
  <option value="tennis">التنس</option>
  <option value="swimming">السباحة</option>
  <option value="basketball">كرة السلة</option>
</select>
```

Selecting any sport does **nothing** — no state, no data change, no navigation is wired up.

**Fix:** Wire to a `selectedSport` state with `onChange`, or replace with navigation buttons.

---

### 3. Clubs — "اشترك الآن" (Gym Section) Button is Dead

**File:** `Clubs.tsx` — Line 426

```tsx
// ❌ BROKEN — no onClick
<button className="bg-[#FDBF00] hover:bg-[#e6ac00] ...">
  اشترك الآن
</button>
```

No `onClick`. Clicking does absolutely nothing.

**Fix:**
```tsx
<button onClick={() => window.location.href = '/re'} ...>
  اشترك الآن
</button>
```

---

### 4. Clubs — "العنوان" (Address Pin) Button is Dead

**File:** `Clubs.tsx` — Line 262

```tsx
// ❌ BROKEN — no onClick, no href, no address data per branch
<button className="...">
  {/* SVG pin icon */}
  <span>العنوان</span>
</button>
```

No action on click. The `clubsData` array has no `mapUrl` per branch so there is nothing to open.

**Fix:** Add a `mapUrl` field to each entry in `clubsData` and open it on click:
```tsx
<button onClick={() => window.open(currentClub.mapUrl, '_blank')}>
  العنوان
</button>
```

Or navigate to the branch page:
```tsx
window.location.href = `/branches/${selectedClub}`
```

---

### 5. SportDetailedPG — "تواصل معنا" Buttons Dead (×2)

**File:** `SportDetailedPG.tsx` — Lines 207 & 545

```tsx
// ❌ BROKEN — no onClick (appears twice)
<button className="border-2 border-white text-white ...">
  تواصل معنا
</button>
```

Both buttons have **no `onClick`**. They visually imply going to the Contact Us page but do nothing.

**Fix:** Pass an `onNavigate` prop (same pattern as `Clubs.tsx`) and call it:
```tsx
<button onClick={() => onNavigate?.('contact us')}>تواصل معنا</button>
```

---

### 6. SportDetailedPG — Branch Dropdown Completely Disconnected

**File:** `SportDetailedPG.tsx` — Lines 36, 230, 409

```tsx
const [selectedClub, setSelectedClub] = useState<string>('maadi');

// selectedClub updates on change but NOTHING reads it
// All content driven only by selectedSport
```

`selectedClub` state updates when you pick a branch, but **nothing in the UI reads it**.  
All content (stats, image, description, facilities) is driven only by `selectedSport`.  
Switching the club branch makes **zero visible difference**.

**Fix:** Either remove the dropdown, or add per-branch data to each sport entry and filter based on `selectedClub`.

---

## 🟡 Medium — Inconsistencies

### 7. `window.location.href` Used Instead of `navigate()`

Multiple places across `Landingpage.tsx` cause full page reloads:

| Line | Code |
|------|------|
| 278 | `window.location.href = '/re'` |
| 356 | `window.location.href = '/branches/${branch.id}'` |
| 411 | `window.location.href = '/news/${item.id}'` |
| 771 | `window.location.href = '/login'` |
| 779 | `window.location.href = '/re'` |
| 855 | `window.location.href = '/login'` |

The app already uses `navigate()` correctly in other places (lines 751, 841).  
All internal routes should use `navigate()` to avoid full reloads.

**Fix:**
```tsx
// Replace all internal window.location.href with:
navigate('/re')
navigate(`/branches/${branch.id}`)
navigate(`/news/${item.id}`)
navigate('/login')
```

---

### 8. Dead `case "sports"` Stub in `renderContent()`

**File:** `Landingpage.tsx` — Lines 527–544

```tsx
case "sports":   // ← lowercase, unreachable from navbar
  return (
    <div>
      {/* Hardcoded stub: كرة القدم, السباحة, كرة السلة ... no images, no data */}
    </div>
  );
```

Unreachable from the navbar (which uses `"Sports"`).  
The **footer bug (#1)** accidentally lands users here.  
After fixing bug #1, this case should be removed.

---

## 🟢 Low — Cleanup

### 9. `banches.ts` — Unused File with Wrong URLs

**File:** `src/Component/LandingPageComponents/banches.ts`

```ts
url: "#/branches/maadi"      // ← hash-based, obsolete
url: "#/branches/manshiyat"
url: "#/branches/matarya"
```

This file is **never imported anywhere** in the project.  
It also uses `#/branches/...` hash URLs which conflict with actual React Router paths `/branches/:id`.  
It also defines only 3 branches (`maadi`, `manshiyat`, `matarya`) while the landing page uses 4 (`helwan`, `maadi`, `tagamoa`, `zayed`).

**Fix:** Delete the file.

---

## ✅ What Works Correctly

| Element | Location | Status |
|---------|----------|--------|
| Navbar — all 6 tabs | `Landingpage.tsx` L682–688 | ✅ Correct keys |
| Mobile menu — all 6 tabs | `Landingpage.tsx` L811–817 | ✅ Correct keys |
| Logo → Home tab | `Landingpage.tsx` L667 | ✅ |
| Hero "سجل الآن" button | `Landingpage.tsx` L278 | ✅ → `/re` |
| Header Login / Register buttons | `Landingpage.tsx` L771, 779 | ✅ |
| User avatar → role-based dashboard | `Landingpage.tsx` L751 | ✅ `navigate()` |
| Logout button | `Landingpage.tsx` L758 | ✅ |
| Sports icons on home page | `Landingpage.tsx` L391 | ✅ → `"Sports"` tab |
| "اشترك الآن" in Sports Academy section | `Landingpage.tsx` L377 | ✅ → `"Sports"` tab |
| Branch slider "استكشف النادي" | `Landingpage.tsx` L356 | ✅ Route exists |
| News "عرض المزيد" button | `Landingpage.tsx` L425 | ✅ → `"lastNews"` tab |
| Clubs → "المزيد من التفاصيل" button | `Clubs.tsx` L390 | ✅ → `"Sports"` tab |
| Footer social links (FB / IG / X) | `Landingpage.tsx` L932–934 | ✅ Real URLs |
| Footer map link | `Landingpage.tsx` L908 | ✅ Google Maps URL |
| Footer email | `Landingpage.tsx` L920 | ✅ `mailto:` |

---

## 📋 Priority Action Plan

| # | Issue | File | Line(s) | Severity |
|---|-------|------|---------|----------|
| 1 | Footer "الرياضات" key `"sports"` → `"Sports"` | `Landingpage.tsx` | 899 | 🔴 P0 |
| 2 | Clubs sport academy dropdown — no handler | `Clubs.tsx` | 334 | 🔴 P0 |
| 3 | Clubs gym "اشترك الآن" button — no onClick | `Clubs.tsx` | 426 | 🔴 P0 |
| 4 | Clubs "العنوان" pin button — no onClick | `Clubs.tsx` | 262 | 🔴 P0 |
| 5 | SportDetailedPG "تواصل معنا" ×2 — no onClick | `SportDetailedPG.tsx` | 207, 545 | 🔴 P0 |
| 6 | SportDetailedPG club dropdown disconnected | `SportDetailedPG.tsx` | 36, 230 | 🔴 P0 |
| 7 | Replace `window.location.href` with `navigate()` | `Landingpage.tsx` | 278, 356, 411, 771, 779, 855 | 🟡 P1 |
| 8 | Remove dead `case "sports"` stub | `Landingpage.tsx` | 527–544 | 🟡 P1 |
| 9 | Delete unused `banches.ts` | `banches.ts` | — | 🟢 P2 |
