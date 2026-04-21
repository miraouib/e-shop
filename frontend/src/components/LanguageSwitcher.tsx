"use client";

import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    
    // Replace the current locale in the pathname
    // e.g. /fr/shop -> /en/shop
    const currentPathWithoutLocale = pathname.replace(`/${currentLocale}`, '');
    const newPath = `/${newLocale}${currentPathWithoutLocale}`;
    
    router.push(newPath === `/${newLocale}` ? `/${newLocale}` : newPath);
    router.refresh(); // Important to refresh Server Components with new locale
  };

  return (
    <select 
      value={currentLocale} 
      onChange={handleLanguageChange}
      className="bg-transparent border border-white/30 text-white rounded px-2 py-1 outline-none focus:border-white text-sm"
    >
      <option value="fr" className="text-black">Français</option>
      <option value="en" className="text-black">English</option>
      <option value="ar" className="text-black">العربية</option>
    </select>
  );
}
