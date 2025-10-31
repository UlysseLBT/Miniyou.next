// app/login/page.tsx
import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function Page() {
  // La boundary Suspense DOIT entourer le composant qui utilise useSearchParams
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
