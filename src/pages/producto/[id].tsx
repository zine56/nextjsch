import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useCart } from '../../context/CartContext';
import styles from './ProductoDetail.module.css';
import { VariantType } from '@/interfaces/VariantType';
import { ProductoType } from '@/interfaces/ProductoType';
import Loader from '../../components/Loader';
import { db } from '../../../firebaseConfig';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { toast } from 'react-toastify';
import Head from 'next/head';
import { CartItem } from '@/interfaces/CartItem';

interface Props {
  producto: ProductoType | null;
  error?: string;
}

const ProductoDetail: React.FC<Props> = ({ producto, error }) => {
  const [selectedVariant, setSelectedVariant] = useState<VariantType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [currentStock, setCurrentStock] = useState(producto?.stock ?? 0);

  const handleVariantChange = (variant: VariantType) => {
    setSelectedVariant(variant);
  };

  const handleAddToCart = async () => {
    if (!producto || currentStock <= 0) {
      toast.error('Este producto está agotado');
      return;
    }

    const itemToAdd: CartItem = {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: quantity,
      imagen: producto.imagen,
      variant: selectedVariant ?? undefined
    };

    addToCart(itemToAdd);

    // Eliminar estas líneas:
    // const newStock = currentStock - quantity;
    // const productoRef = doc(db, 'products', producto.id);
    // await updateDoc(productoRef, { stock: newStock });
    // setCurrentStock(newStock);

    toast.success('Producto agregado al carrito');
  };

  if (!producto) {
    return <div>Producto no encontrado</div>;
  }

  return (
    <>
      <Head>
        <title>{producto.nombre} | Nuestra Tienda</title>
        <meta name="description" content={producto.descripcion} />
      </Head>
      <MainLayout>
        <div className={styles.producto}>
          <h1>{producto.nombre}</h1>
          <div style={{ position: 'relative', width: '100%', height: '400px' }}>
            <Image 
              src={producto.imagen} 
              alt={producto.nombre} 
              layout="fill"
              objectFit="contain"
              quality={85}
            />
          </div>
          <p dangerouslySetInnerHTML={{ __html: producto.descripcion }} />
          <p className={styles.precio}>${producto.precio}</p>
          
          {currentStock > 0 ? (
            <>
              <p className={styles.stock}>Stock disponible: {currentStock}</p>
              
              {producto.variants && producto.variants.length > 0 ? (
                <div className={styles.variantsContainer}>
                  <h3 className={styles.variantsTitle}>Selecciona una variante:</h3>
                  {producto.variants.map((variant) => (
                    <label key={variant.id} className={styles.variantLabel}>
                      <input
                        type="radio"
                        name="variant"
                        value={variant.id}
                        checked={selectedVariant?.id === variant.id}
                        onChange={() => handleVariantChange(variant)}
                        className={styles.variantRadio}
                      />
                      <span className={styles.variantText}>{variant.size} - {variant.color}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p>No hay variantes disponibles para este producto</p>
              )}

              <div className={styles.actions}>
                <div className={styles.quantity}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}>+</button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={styles['add-to-cart-button']}
                  disabled={!selectedVariant}
                >
                  {!selectedVariant ? 'Selecciona una variante' : 'Agregar al Carrito'}
                </button>
              </div>
            </>
          ) : (
            <p className={styles['out-of-stock']} style={{ color: 'red', fontWeight: 'bold' }}>
              Producto agotado
            </p>
          )}
        </div>
      </MainLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.params as { id: string };

  try {
    const productoDoc = doc(db, 'products', id);
    const productoSnap = await getDoc(productoDoc);

    if (!productoSnap.exists()) {
      return { props: { producto: null, error: 'Producto no encontrado' } };
    }

    const productoData = productoSnap.data();
    console.log('Producto data:', productoData);
    
    // Asegura que "variants" sea un array vacío si no existe
    const producto: ProductoType = {
      id: productoSnap.id,
      nombre: productoData.name,
      descripcion: productoData.description,
      precio: productoData.price,
      imagen: productoData.image,
      category: productoData.category,
      stock: productoData.stock,
      variants: productoData.variants || [],  // Valor por defecto como array vacío
    };

    return { props: { producto } };
  } catch (error) {
    console.error('Error fetching product:', error);
    return { props: { producto: null, error: 'Error al cargar el producto' } };
  }
};

export default ProductoDetail;


