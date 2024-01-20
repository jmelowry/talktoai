import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'talking to ai',
  description: 'experimental',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
