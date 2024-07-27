// src/pages/_app.tsx
import type { AppProps } from 'next/app';
import { CartProvider } from '../context/CartContext';
import MainLayout from '../layouts/MainLayout';
import '../app/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </CartProvider>
  );
}

export default MyApp;
