import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import '@livekit/components-styles';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { IdentityOnboardingModal } from '@/components/IdentityOnboardingModal';

const sansFont = Plus_Jakarta_Sans({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const monoFont = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'StationTalk — Voice Rooms',
  description:
    'Station-based group voice rooms. Join a station, listen in, and speak up.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#07090e',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${sansFont.variable} ${monoFont.variable} antialiased bg-[#07090e] text-white min-h-screen flex flex-col font-sans selection:bg-teal-500 selection:text-gray-950`}
      >
        <Navbar />
        <div className="flex-1 flex flex-col">{children}</div>
        <IdentityOnboardingModal />
      </body>
    </html>
  );
}
