import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Be a Pickle Baller',
  description: 'Pickleball Matchmaking Platform',
};

export const fetchCache = 'force-no-store';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

// Main layout component
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link rel="icon" href={`${basePath}/favicon-logo.png`} />
        <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
      </head>
      <body className={`${inter.className} bg-lightGreen`}>
        {children}
      </body>
    </html>
  );
}
