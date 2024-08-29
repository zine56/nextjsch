// src/pages/category/[id].tsx

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig'; // Asegúrate de que esta sea la ruta correcta a tu configuración de Firebase
import { ProductoType } from '@/interfaces/ProductoType';
import Catalogo from '../catalogo';

interface Product {
  id: string;
  name: string;
}

interface Category {
  id: string;
  nombre: string;
}

export default function CategoryPage({ initialCategory, initialProducts }: { initialCategory: Category; initialProducts: Product[] }) {
  const router = useRouter();
  const { id } = router.query;

  const [category, setCategory] = useState<Category | null>(initialCategory);
  //const [products, setProducts] = useState<ProductType[]>(initialProducts || []);
  const [products, setProducts] = useState<ProductoType[]>([]);

  const [loading, setLoading] = useState<boolean>(!initialProducts);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    if (!initialProducts && id) {
      const fetchProducts = async () => {
        try {
          setLoading(true);
          const productsCollection = collection(db, 'products');
          const productsQuery = query(productsCollection, where('category', '==', id));
          const productsSnapshot = await getDocs(productsQuery);
          //const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
          const productsList = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            nombre: doc.data().name,
            descripcion: doc.data().description,
            precio: doc.data().price,
            imagen: doc.data().image }));
          setProducts(productsList);
        } catch (err) {
          setError('Error al cargar productos');
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    }
  }, [id, initialProducts]);

  if (router.isFallback || loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!category) {
    return <div>Categoría no encontrada</div>;
  }

  return (
    <div>
      <h1>{category.nombre}</h1>
      <Catalogo productos={products} />

    </div>
  );
}

export async function getStaticPaths() {
    const categoriesCollection = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesCollection);
  
    // Verifica las rutas generadas
    const paths = categoriesSnapshot.docs.map(doc => {
      console.log('Generated Path:', doc.data().link); // Añade esto para depurar
      return {
        params: { id: doc.data().link } // Asegúrate de que coincida con la forma en que se llama la ruta
      };
    });
  
    return { paths, fallback: true };
  }
  

  export async function getStaticProps({ params }: { params: { id: string } }) {
    try {
      // Normaliza el ID antes de usarlo en Firestore
      const normalizedId = params.id; // Reemplaza los subrayados por espacios si así están almacenados en Firestore
      console.log('Normalized ID:', normalizedId); // Añade esto para depurar
      const categoryDoc = collection(db, 'categories');
      //const categoryQuery = query(categoryDoc, where('__name__', '==', normalizedId));
      const categoryQuery = query(categoryDoc, where('link', '==', normalizedId));

      const categorySnapshot = await getDocs(categoryQuery);
  
      if (categorySnapshot.empty) {
        return { notFound: true };
      }
  
      const category = { id: categorySnapshot.docs[0].id, ...categorySnapshot.docs[0].data() } as Category;
  
      const productsCollection = collection(db, 'products');
      const productsQuery = query(productsCollection, where('category', '==', normalizedId));
      const productsSnapshot = await getDocs(productsQuery);
      const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
  
      return {
        props: {
          initialCategory: category,
          initialProducts: products
        },
        revalidate: 60, // Revalida la página cada 60 segundos
      };
    } catch (error) {
      return {
        props: {
          initialCategory: null,
          initialProducts: []
        },
        revalidate: 60, // Revalida la página cada 60 segundos
      };
    }
  }
  
