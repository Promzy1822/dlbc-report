import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DLBC Bini Region — Weekly Reports',
  description: 'Deeper Life Bible Church Weekly Summary Report System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
