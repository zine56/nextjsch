// src/app/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { DocumentData, collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { ProductoType } from '@/interfaces/ProductoType';
import Catalogo from '@/pages/catalogo';
import { VariantType } from '@/interfaces/VariantType';

const PRODUCTS_PER_PAGE = 100;

export default function Home() {
  const [productos, setProductos] = useState<ProductoType[]>([]);
  const [lastVisible, setLastVisible] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchProductos = async (lastDoc: DocumentData | null = null) => {
    setLoading(true);
    try {
      const productosCollection = collection(db, 'products');
      let productosQuery = query(productosCollection, orderBy('name'), limit(PRODUCTS_PER_PAGE));

      if (lastDoc) {
        productosQuery = query(productosCollection, orderBy('name'), startAfter(lastDoc), limit(PRODUCTS_PER_PAGE));
      }

      const productosSnapshot = await getDocs(productosQuery);
      const productosList = productosSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nombre: data.name,
          descripcion: data.description,
          precio: data.price,
          imagen: data.image,
          category: data.category,
          variants: data.variants && Array.isArray(data.variants) ? data.variants.map((variant: VariantType) => ({
            id: variant.id,
            size: variant.size,
            color: variant.color,
            stock: variant.stock
          })) : []
        };
      });

      setProductos(prevProductos => lastDoc ? [...prevProductos, ...productosList] : productosList);
      setLastVisible(productosSnapshot.docs[productosSnapshot.docs.length - 1]);
      setHasMore(productosSnapshot.docs.length === PRODUCTS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching productos: ', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchProductos(lastVisible);
    }
  };

  return (
    <div>
      <h1>Bienvenido a Nuestra Tienda</h1>
      <p>Mostrando {productos.length} productos</p>
      <Catalogo productos={productos}  categorias={['Todas','accesorios_auto','accesorios_camaras','celulares','computacion','mascotas_accesorios']} />
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Cargando...' : 'Cargar más productos'}
        </button>
      )}
    </div>
  );
}