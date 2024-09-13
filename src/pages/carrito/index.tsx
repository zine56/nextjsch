// src/pages/Carrito/index.tsx
"use client";

import { useCart } from '../../context/CartContext';
import Image from 'next/image';
import styles from './Carrito.module.css';
import Link from 'next/link';
import { toast } from 'react-toastify';
import MainLayout from '@/layouts/MainLayout';
import Head from 'next/head';

export default function Carrito() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  const totalPrice = cart.reduce((total, item) => total + item.precio * item.cantidad, 0);

  const handleRemoveFromCart = (id: string) => {
    removeFromCart(id);
    toast.info('Producto eliminado del carrito');
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    updateQuantity(id, quantity);
    toast.info('Cantidad actualizada');
  };

  const handleClearCart = () => {
    clearCart();
    toast.info('Carrito vaciado');
  };

  return (
    <>
      <Head>
        <title>Carrito de Compras | Nuestra Tienda</title>
        <meta name="description" content="Revisa y gestiona los productos en tu carrito de compras." />
      </Head>
      <MainLayout>
        <div className={styles.carrito}>
          <h1>Carrito de Compras</h1>
          {cart.length === 0 ? (
            <p>El carrito está vacío.</p>
          ) : (
            <div>
              {cart.map((item) => (
                <div key={item.id} className={styles.item}>
                  <h2>{item.nombre}</h2>
                  <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                    <Image 
                      src={item.imagen} 
                      alt={item.nombre} 
                      layout="fill"
                      objectFit="cover"
                      quality={75}
                    />
                  </div>
                  <p>Precio: ${item.precio}</p>
                  <input
                    type="number"
                    value={item.cantidad}
                    min="1"
                    onChange={(e) => handleUpdateQuantity(item.id, Number(e.target.value))}
                  />
                  <button onClick={() => handleRemoveFromCart(item.id)}>Eliminar</button>
                </div>
              ))}
              <div className={styles.total}>
                <h3>Total: ${totalPrice.toFixed(2)}</h3>
              </div>
              <div className={styles.actions}>
                <button onClick={handleClearCart}>Vaciar Carrito</button>
                <Link href="/checkout">
                  <button>Proceder al Pago</button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
}
