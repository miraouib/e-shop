import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import CartHeader from "@/components/CartHeader";
import { Toaster } from "react-hot-toast";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Custom Shop - E-Commerce",
  description: "Boutique en ligne Custom Shop",
};

async function getSettings() {
  try {
    const res = await fetch("http://127.0.0.1:8000/api/settings", { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    const members = data['hydra:member'] || data['member'] || [];
    return members.length > 0 ? members[0] : null;
  } catch (e) {
    return null;
  }
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const settings = await getSettings();
  const messages = await getMessages();
  const t = await getTranslations('Navigation');

  const themeStyle = {
    ...(settings?.primaryColor ? { "--color-primary": settings.primaryColor } as any : {}),
    ...(settings?.secondaryColor ? { "--color-secondary": settings.secondaryColor } as any : {}),
  };

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} style={themeStyle}>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
        <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
        {/* Header placeholder */}
        <header className="bg-primary text-white p-4 shadow-md sticky top-0 z-50">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">{settings?.siteName || "Custom Shop"}</h1>
            <nav className="hidden md:flex gap-4 items-center">
              <Link href={`/${locale}`} className="hover:underline">{t('home')}</Link>
              <Link href={`/${locale}/shop`} className="hover:underline">{t('shop')}</Link>
              <CartHeader />
              <LanguageSwitcher currentLocale={locale} />
            </nav>
            <div className="md:hidden flex items-center gap-4">
              <CartHeader />
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto p-4">
          {children}
        </main>
        </NextIntlClientProvider>

        <footer className="bg-gray-900 text-white p-6 mt-8">
          <div className="container mx-auto text-center">
            <p>&copy; 2026 {settings?.siteName || "Custom Shop"}. Tous droits réservés.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
