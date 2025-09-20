'use client';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import { useEffect } from 'react';
import Script from 'next/script';
import Navbar from '../components/Navbar';

export default function RootLayout({ children }) {
  // Ensure Bootstrap JS loads (tooltips, modals, etc.)
  useEffect(() => {
    // No-op; Next/Script below will handle bootstrap bundle
  }, []);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>RMS Blog</title>
        <meta name="description" content="RMS Blog built with Next.js and Bootstrap" />
      </head>
      <body>
        <Navbar />
        <main className="container py-4">{children}</main>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
