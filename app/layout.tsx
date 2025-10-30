import './globals.css'
import NavBar from '../components/NavBar'


export const metadata = { title: 'MiniYou', description: 'Partage média' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <NavBar />
        {children}
      </body>
    </html>
  )
}
