import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DocuRecover – AI Document Recovery Assistant',
  description: 'AI-powered disaster document recovery platform for Malaysia',
  keywords: [
    'Malaysia disaster recovery',
    'lost MyKad replacement',
    'damaged passport recovery',
    'flood document recovery',
    'JPN birth certificate replacement',
    'JPJ driving licence',
    'NADMA disaster relief',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} dark`}>
      <body
        className={`${inter.className} min-h-screen bg-[#0A0E1A] text-[#F1F5F9] antialiased selection:bg-blue-600 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
