import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import InstallPrompt from '@/components/ui/InstallPrompt';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'Grain Size Analysis Tool',
  description: 'Professional sedimentology analysis',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GSAT',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta name="theme-color" content="#1e40af" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GSAT" />
        <link rel="apple-touch-icon" href="/icon/sediment.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-screen bg-gray-100 text-gray-800">
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
