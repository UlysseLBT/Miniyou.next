// app/layout.tsx
import { Suspense } from 'react';
import './globals.css';
import Navbar from '@/components/Navbar'; // si tu as une navbar ou un header

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {/* TOUT composant qui utilise useSearchParams doit être sous Suspense */}
        <Suspense fallback={null}>
          {/* Si ta Navbar/Topbar/Whatever appelle useSearchParams, garde-la ici */}
          <Navbar />
        </Suspense>

        {children}
      </body>
    </html>
  );
}
