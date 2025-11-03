import './globals.css';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Suspense fallback={null}>
          {/* Navbar retirée pour corriger l'import */}
        </Suspense>
        {children}
      </body>
    </html>
  );
}
