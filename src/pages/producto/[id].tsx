// ProductoDetail.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import styles from './ProductoDetail.module.css';
import { ProductoType } from '@/interfaces/ProductoType';
import Loader from '../../components/Loader';
import { db } from '../../../firebaseConfig';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { GetStaticPaths } from 'next';

interface Props {
  producto: ProductoType | null;
}

const ProductoDetail: React.FC<Props> = ({ producto }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (producto) {
      addToCart({
        ...producto,
        precio: Number(producto.precio),
        cantidad: 1,
      });
    }
  };

  if (!producto) {
    return (
      <div className={styles.producto}>
        <Loader /> {/* Usa Loader para Suspense */}
      </div>
    );
  }

  return (
    <div className={styles.producto}>
      <h1>{producto.nombre}</h1>
      <Image src={producto.imagen} alt={producto.nombre} width={500} height={500} layout='responsive' />
      <p dangerouslySetInnerHTML={{ __html: producto.descripcion }} />
      <p className={styles.precio}>${producto.precio}</p>
      <div className={styles.actions}>
        <button onClick={handleAddToCart} className={styles['add-to-cart-button']}>
          Agregar al Carrito
        </button>
      </div>
    </div>
  );
};

// Generación de parámetros estáticos para la página de detalles
export async function generateStaticParams() {
  const productosCollection = collection(db, 'products');
  const productosSnapshot = await getDocs(productosCollection);

  const paths = productosSnapshot.docs.map((doc) => ({
    id: doc.id,
  }));

  return paths;
}

export const dynamicParams = false;

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {

  return {
      paths: [], //indicates that no page needs be created at build time
      fallback: 'blocking' //indicates the type of fallback
  }
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  const productoDoc = doc(db, 'products', params.id);
  const productoSnap = await getDoc(productoDoc);

  if (!productoSnap.exists()) {
    return { props: { producto: null } };
  }

  const producto: ProductoType = {
    id: productoSnap.id,
    nombre: productoSnap.data().name,
    descripcion: productoSnap.data().description,
    precio: productoSnap.data().price,
    imagen: productoSnap.data().image,
  };

  return {
    props: { producto },
    revalidate: 60,
  };
}

export default ProductoDetail;
