// src/pages/producto/[id].tsx
"use client";

import { useRouter } from 'next/router';
import Image from 'next/image';
import { productos } from '../../../data/mockData';
import { useCart } from '../../context/CartContext';
import styles from './ProductoDetail.module.css';
import { useState } from 'react';

export default function ProductoDetail() {
  const router = useRouter();
  const { id } = router.query;
  const producto = productos.find((p) => p.id === Number(id));
  const { addToCart } = useCart();
  const [cantidad, setCantidad] = useState(1);

  if (!producto) {
    return (
      <div className={styles.producto}>
        <p>Producto no encontrado</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({ ...producto, cantidad });
  };

  const handleIncrease = () => {
    setCantidad(cantidad + 1);
  };

  const handleDecrease = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  return (
    <div className={styles.producto}>
      <h1>{producto.nombre}</h1>
      <Image src={producto.imagen} alt={producto.nombre} width={500} height={500} />
      <p>{producto.descripcion}</p>
      <p className={styles.precio}>${producto.precio}</p>
      <div className={styles.actions}>
        <button className={styles['counter-button']} onClick={handleDecrease}>-</button>
        <input type="number" value={cantidad} readOnly />
        <button className={styles['counter-button']} onClick={handleIncrease}>+</button>
        <button onClick={handleAddToCart} className={styles['add-to-cart-button']}>Agregar al Carrito</button>
      </div>
    </div>
  );
}
