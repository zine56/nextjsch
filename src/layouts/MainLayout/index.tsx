// src/layouts/MainLayout/index.tsx
"use client";

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import styles from './MainLayout.module.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig'; // Asegúrate de que esta sea la ruta correcta a tu configuración de Firebase

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
    return <div>Cargando...</div>; // O usa un componente Loader aquí
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Mi Tienda</h1>
        <nav>
          <ul className={styles.navList}>
            {categories.map((category) => (
              <li key={category.id} className={styles.navItem}>
                <Link href={`/category/${category.link}`}>
                  {category.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
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
