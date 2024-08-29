// src/app/page.tsx
"use client";
import { useEffect, useState } from 'react';
import { db } from '../../firebaseConfig';
import { DocumentData, collection, getDocs } from 'firebase/firestore';
import Producto from '../components/Producto';
import { ProductoType } from '@/interfaces/ProductoType';
import Catalogo from '@/pages/catalogo';

export default function Home() {
  const [productos, setProductos] = useState<ProductoType[]>([]);;

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const productosCollection = collection(db, 'products');
        const productosSnapshot = await getDocs(productosCollection);
        const productosList = productosSnapshot.docs.map(doc => ({
          id: doc.id,
          nombre: doc.data().name,
          descripcion: doc.data().description,
          precio: doc.data().price,
          imagen: doc.data().image }));
        console.log(productosList);
        setProductos(productosList);
      } catch (error) {
        console.error('Error fetching productos: ', error);
      }
    };

    fetchProductos();
  }, []);

  return (
    <div>
      <h1>Bienvenido a Nuestra Tienda</h1>
      <Catalogo productos={productos} />
    </div>
  );
}