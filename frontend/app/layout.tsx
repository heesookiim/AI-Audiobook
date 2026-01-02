import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bedtime Audiobook',
  description: 'Personalized bedtime stories for children',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

