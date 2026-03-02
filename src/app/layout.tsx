import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BrainBoard',
  description: 'AI-first Kanban for Local Projects',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
