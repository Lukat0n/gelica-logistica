import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Panel Logístico',
  description: 'Gestión de pedidos y envíos de la empresa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
