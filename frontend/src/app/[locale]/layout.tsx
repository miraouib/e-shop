import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "react-hot-toast";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import Header from '@/components/Header';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Custom Shop - E-Commerce",
  description: "Boutique en ligne Custom Shop",
};

async function getGlobalData() {
  try {
    const [settingsRes, themesRes] = await Promise.all([
      fetch("http://127.0.0.1:8000/api/settings", { next: { revalidate: 0 } }),
      fetch("http://127.0.0.1:8000/api/themes?isActive=true", { next: { revalidate: 0 } })
    ]);

    let settings = null;
    let activeTheme = null;

    if (settingsRes.ok) {
      const data = await settingsRes.json();
      const members = data['hydra:member'] || data['member'] || [];
      settings = members.length > 0 ? members[0] : null;
    }

    if (themesRes.ok) {
      const data = await themesRes.json();
      const members = data['hydra:member'] || data['member'] || [];
      activeTheme = members.length > 0 ? members[0] : null;
    }

    return { settings, activeTheme };
  } catch (e) {
    return { settings: null, activeTheme: null };
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
  const { settings, activeTheme } = await getGlobalData();
  const messages = await getMessages();

  const themeStyle = {
    "--color-primary": activeTheme?.primaryColor || settings?.primaryColor || "#ef4444",
    "--color-secondary": activeTheme?.secondaryColor || settings?.secondaryColor || "#fca5a5",
    "--color-tertiary": activeTheme?.tertiaryColor || settings?.tertiaryColor || "#f3f4f6",
    "--card-bg": activeTheme?.cardColor || settings?.cardColor || "#ffffff",
    "--form-bg": activeTheme?.formBgColor || settings?.formBgColor || "#111827",
    "--form-text": activeTheme?.formTextColor || settings?.formTextColor || "#ffffff",
    "--header-text": activeTheme?.headerTextColor || settings?.headerTextColor || "#ffffff",
    "--footer-text": activeTheme?.footerTextColor || settings?.footerTextColor || "#ffffff",
  } as any;

  const siteName = settings?.translations?.[locale]?.siteName || settings?.siteName || "Custom Shop";
  // shopName: dedicated boutique name, falls back to siteName
  const shopName = settings?.translations?.[locale]?.shopName || siteName;
  const companyName = settings?.translations?.[locale]?.companyName || settings?.companyName || siteName;
  const companyAddress = settings?.translations?.[locale]?.companyAddress || settings?.companyAddress;

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} style={themeStyle}>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
        <Toaster position="top-center" toastOptions={{ style: { background: '#333', color: '#fff' } }} />
        <Header locale={locale} siteName={shopName} />

        <main className="flex-1 container mx-auto p-4">
          {children}
        </main>
        </NextIntlClientProvider>

        <footer className="bg-tertiary p-8 mt-8 border-t dark:border-gray-800" style={{ color: "var(--footer-text)" }}>
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{companyName}</h3>
              {companyAddress && <p className="text-gray-400 mb-2">{companyAddress}</p>}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              {settings?.companyPhone && <p className="text-gray-400 mb-2">Tél : {settings.companyPhone}</p>}
              {settings?.companyEmail && <p className="text-gray-400 mb-2">Email : {settings.companyEmail}</p>}
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Liens Utiles</h3>
              <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                <li><Link href={`/${locale}`} className="hover:text-primary transition">Accueil</Link></li>
                <li><Link href={`/${locale}/shop`} className="hover:text-primary transition">Boutique</Link></li>
              </ul>
            </div>
          </div>
          <div className="container mx-auto text-center mt-8 pt-8 border-t border-gray-800 text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} {companyName}. Tous droits réservés.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
