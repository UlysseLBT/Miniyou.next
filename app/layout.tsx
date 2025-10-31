import './globals.css';
import { Suspense } from 'react';
// ⬇️ utilise le chemin relatif depuis app/ vers components/
// Si tu n'as pas encore de Navbar.tsx, commente simplement la ligne suivante.
import Navbar from '../components/NavBar';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        {/* Protège tout composant qui utilise useSearchParams/usePathname */}
        <Suspense fallback={null}>
          {/* Si tu n'as pas de Navbar, supprime ce bloc */}
          <Navbar />
        </Suspense>

        {children}
      </body>
    </html>
  );
}
