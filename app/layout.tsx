import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Vaulltcore AI — Autonomous Software Engineering (Arrow Agent)',
  description:
    'Vaulltcore AI powered by Arrow, the autonomous software engineering agent orchestrator dispatching resilient commands, post-quantum zero-trust attestations, and sub-millisecond task automation.',
  openGraph: {
    title: 'Vaulltcore AI — Autonomous Software Engineering (Arrow Agent)',
    description:
      'Vaulltcore AI powered by Arrow, the autonomous software engineering agent orchestrator dispatching resilient commands, post-quantum zero-trust attestations, and sub-millisecond task automation.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vaulltcore AI — Autonomous Software Engineering (Arrow Agent)',
    description:
      'Vaulltcore AI powered by Arrow, the autonomous software engineering agent orchestrator dispatching resilient commands, post-quantum zero-trust attestations, and sub-millisecond task automation.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body
        suppressHydrationWarning
        className="bg-[#080A0E] text-[#E2E8F0] font-sans antialiased selection:bg-[#3B0764] selection:text-white overflow-x-hidden transition-colors duration-200"
      >
        {children}
      </body>
    </html>
  );
}
