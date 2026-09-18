import type { Metadata, Viewport } from 'next';
import { Public_Sans, IBM_Plex_Mono } from 'next/font/google';
import RegisterSW from '@/components/RegisterSW';
import './globals.css';

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-ui',
  weight: ['400', '500', '600', '700', '800'],
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Board — Checklist & Calendar',
  description: 'Task checklist with auto-completing subtasks and a Notion-style calendar view.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Board',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1F5C3F',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${publicSans.variable} ${plexMono.variable}`}>
      <body>
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
