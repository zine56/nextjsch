import React, { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import Loader from '../components/Loader';
import { ProductoType } from '@/interfaces/ProductoType';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Head from 'next/head';
import { VariantType } from '@/interfaces/VariantType';

const Producto = dynamic(() => import('../components/Producto'), {
  suspense: true,
});

interface CatalogoProps {
  productos: ProductoType[];
  categorias: string[];
}

export default function Catalogo({ productos, categorias }: CatalogoProps) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('');

  const productosFiltrados = categoriaSeleccionada && categoriaSeleccionada !== 'Todas'
    ? productos.filter(p => p.category === categoriaSeleccionada)
    : productos;

  return (
    <Suspense fallback={<Loader />}>
      <div>
        <Head>
          <title>Catálogo de Productos</title>
          <meta name="description" content="Explora nuestro catálogo completo de productos." />
        </Head>

        {
          categorias.length > 1 && (
            <select 
              value={categoriaSeleccionada} 
              onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            >
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</option>
              ))}
            </select>
          )
        }

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {productosFiltrados.map((producto) => (
            <Producto key={producto.id} producto={producto} />
          ))}
        </div>
      </div>
    </Suspense>
  );
}

export async function getStaticProps() {
  const productosCollection = collection(db, 'products');
  const productosSnapshot = await getDocs(productosCollection);


  const productosList = productosSnapshot.docs.map(doc => ({
    id: doc.id,
    nombre: doc.data().name,
    descripcion: doc.data().description,
    precio: doc.data().price,
    imagen: doc.data().image,
    category: doc.data().category,
    variants: doc.data().variants.length > 0 ? doc.data().variants.map((variant: VariantType) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color,
      stock: variant.stock
    })) : [] 
  }));


  // Obtener categorías únicas
  const categoriasUnicas = Array.from(new Set(productosList.map(p => p.category)));
  const categorias = ['Todas', ...categoriasUnicas];

  return {
    props: {
      productos: productosList,
      categorias,
    },
    revalidate: 60, // Regenera la página cada 60 segundos
  };
}
