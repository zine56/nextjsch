// src/pages/category/[id].tsx

import { GetStaticProps, GetStaticPaths } from 'next';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { ProductoType } from '@/interfaces/ProductoType';
import Catalogo from '../catalogo';

interface Category {
  id: string;
  nombre: string;
  link: string;
}

interface CategoryPageProps {
  category: Category;
  products: ProductoType[];
}

export default function CategoryPage({ category, products }: CategoryPageProps) {
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

export const getStaticPaths: GetStaticPaths = async () => {
  const categoriesCollection = collection(db, 'categories');
  const categoriesSnapshot = await getDocs(categoriesCollection);

  const paths = categoriesSnapshot.docs.map(doc => ({
    params: { id: doc.data().link }
  }));

  return { paths, fallback: 'blocking' };
};

export const getStaticProps: GetStaticProps<CategoryPageProps> = async ({ params }) => {
  try {
    const normalizedId = params?.id as string;
    const categoryDoc = collection(db, 'categories');
    const categoryQuery = query(categoryDoc, where('link', '==', normalizedId));
    const categorySnapshot = await getDocs(categoryQuery);

    if (categorySnapshot.empty) {
      return { notFound: true };
    }

    const category = { id: categorySnapshot.docs[0].id, ...categorySnapshot.docs[0].data() } as Category;

    const productsCollection = collection(db, 'products');
    const productsQuery = query(productsCollection, where('category', '==', normalizedId));
    const productsSnapshot = await getDocs(productsQuery);
    const products = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      nombre: doc.data().name,
      descripcion: doc.data().description,
      precio: doc.data().price,
      imagen: doc.data().image,
      category: doc.data().category
    }));

    return {
      props: {
        category,
        products
      },
      revalidate: 3600, // Revalidate every hour
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return { notFound: true };
  }
};
