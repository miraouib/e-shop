"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CartHeader from "@/components/CartHeader";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslations } from "next-intl";

interface HeaderProps {
  locale: string;
  siteName: string;
  headerStyle?: React.CSSProperties;
}

export default function Header({ locale, siteName, headerStyle }: HeaderProps) {
  const t = useTranslations("Navigation");
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change or ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header
      className="bg-primary p-4 shadow-md sticky top-0 z-50"
      style={{ color: "var(--header-text)", ...headerStyle }}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo / Site Name */}
        <Link href={`/${locale}`} className="text-2xl font-bold hover:opacity-80 transition-opacity" onClick={() => setMenuOpen(false)}>
          {siteName}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-4 items-center">
          <Link href={`/${locale}`} className="hover:underline font-medium">
            {t("home")}
          </Link>
          <Link href={`/${locale}/shop`} className="hover:underline font-medium">
            {t("shop")}
          </Link>
          <CartHeader />
          <LanguageSwitcher currentLocale={locale} />
        </nav>

        {/* Mobile: Cart + Hamburger */}
        <div className="md:hidden flex items-center gap-3">
          <CartHeader />
          <button
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {menuOpen ? (
              /* X icon */
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" /><line x1="4" x2="20" y1="6" y2="6" /><line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-primary shadow-xl z-50 border-t border-white/10 animate-in slide-in-from-top-2 duration-200">
          <nav className="container mx-auto flex flex-col py-4 px-4 gap-2">
            <Link
              href={`/${locale}`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              {t("home")}
            </Link>
            <Link
              href={`/${locale}/shop`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" x2="21" y1="6" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {t("shop")}
            </Link>
            <div className="px-4 py-3 border-t border-white/10 mt-1">
              <p className="text-xs font-bold uppercase opacity-50 mb-2">Langue</p>
              <LanguageSwitcher currentLocale={locale} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
