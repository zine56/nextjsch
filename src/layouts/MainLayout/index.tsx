// src/layouts/MainLayout/index.tsx
"use client";

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import styles from './MainLayout.module.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

interface MainLayoutProps {
  children: ReactNode;
}

interface Category {
  id: string;
  nombre: string;
  link: string;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { cart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(db, 'categories');
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesList = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        setCategories(categoriesList);
      } catch (err) {
        setError('Error al cargar categorías');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <nav className={styles.nav}>
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <Link href="/">
                  Mi Tienda
                </Link>
              </li>
              {categories.map((category) => (
                <li key={category.id} className={styles.navItem}>
                  <Link href={`/category/${category.link}`}>
                    {category.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link href="/carrito" className={styles.cartLink}>
            🛒 <span className={styles.cartCount}>({cart.reduce((total, item) => total + item.cantidad, 0)})</span>
          </Link>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <p>Todos los derechos reservados &copy; 2024</p>
      </footer>
    </div>
  );
}
