// src/app/layout.tsx
import './globals.css';
import type { ReactNode } from 'react';
import { CartProvider } from '../context/CartContext';
import MainLayout from '../layouts/MainLayout';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <CartProvider>
          <MainLayout>{children}</MainLayout>
        </CartProvider>
      </body>
    </html>
  );
}
