// Import necessary libs
import React, { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import Loader from '../components/Loader'; // Importa tu componente de Loader
import { ProductoType } from '@/interfaces/ProductoType';

// Importa Producto de manera dinámica para usar con Suspense
const Producto = dynamic(() => import('../components/Producto'), {
  suspense: true,
});

export default function Catalogo({ productos: initialProductos }: { productos: ProductoType[] }) {
  const [productos, setProductos] = useState<ProductoType[]>(initialProductos);
  const [loading, setLoading] = useState(false); // Estado para manejar el loader

  useEffect(() => {
    // Simular una carga de datos para mostrar el loader
    const fetchProductos = async () => {
      setLoading(true);
      const productosCollection = collection(db, 'products');
      const productosSnapshot = await getDocs(productosCollection);
      const productosList = productosSnapshot.docs.map(doc => ({
        id: doc.id,
        nombre: doc.data().name,
        descripcion: doc.data().description,
        precio: doc.data().price,
        imagen: doc.data().image
      }));
      setProductos(productosList);
      setLoading(false);
    };

    if (!initialProductos || initialProductos.length === 0) {
      fetchProductos(); // Si no hay productos iniciales, cargar los productos
    }
  }, [initialProductos]);

  if (loading) {
    return <Loader />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {productos.map((producto) => (
          <Producto key={producto.id} producto={producto} />
        ))}
      </div>
    </Suspense>
  );
}

export async function getStaticProps() {
  const productosCollection = collection(db, 'products');
  const productosSnapshot = await getDocs(productosCollection);
  const productos = productosSnapshot.docs.map(doc => ({
    id: doc.id,
    nombre: doc.data().name,
    descripcion: doc.data().description,
    precio: doc.data().price,
    imagen: doc.data().image
  }));

  return {
    props: {
      productos
    },
    revalidate: 60 // Revalida al menos una vez por minuto
  };
}
