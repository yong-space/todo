import type { Metadata } from 'next';
import { ViewportLayout } from 'next/dist/lib/metadata/types/extra-types';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: [ 'latin' ] });

export const metadata: Metadata = {
  title: 'Todo',
  description: 'Basic Todo App',
  manifest: '/manifest.json',
};

export const viewport: ViewportLayout = {
  width: 'device-width',
  initialScale: 1,
  interactiveWidget: 'resizes-content',
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full text-lg">
      <body className={`h-dvh flex flex-1 bg-teal-900 dark:bg-gray-600 dark:text-teal-50 ${inter.className}`}>
        {children}
      </body>
    </html>
  );
};
