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
  title: 'DocuRecover – Disaster Document Recovery',
  description: 'Recover lost or damaged Malaysian documents after a disaster',
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
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${outfit.variable}`}>
      <body
        className={`${inter.className} min-h-screen bg-milk text-stone-900 antialiased selection:bg-lime-300 selection:text-lime-950`}
      >
        {children}
      </body>
    </html>
  );
}
