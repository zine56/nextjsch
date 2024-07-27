// src/layouts/MainLayout/index.tsx
"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { cart } = useCart();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Mi Tienda</h1>
        <Link href="/carrito">
          🛒 ({cart.reduce((total, item) => total + item.cantidad, 0)})
        </Link>
      </header>
      <main>{children}</main>
      <footer className={styles.footer}>
        <p>Todos los derechos reservados &copy; 2024</p>
      </footer>
    </div>
  );
}
