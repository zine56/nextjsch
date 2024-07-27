// src/app/carrito/page.tsx
"use client";

import { useCart } from '../../context/CartContext';
import Image from 'next/image';
import styles from './Carrito.module.css';

export default function carrito() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  return (
    <div className={styles.carrito}>
      <h1>Carrito de Compras</h1>
      {cart.length === 0 ? (
        <p>El carrito está vacío.</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div key={item.id} className={styles.item}>
              <h2>{item.nombre}</h2>
              <Image src={item.imagen} alt={item.nombre} width={100} height={100} />
              <p>Precio: ${item.precio}</p>
              <input
                type="number"
                value={item.cantidad}
                min="1"
                onChange={(e) => updateQuantity(item.id, Number(e.target.value))}
              />
              <button onClick={() => removeFromCart(item.id)}>Eliminar</button>
            </div>
          ))}
          <div className={styles.actions}>
            <button onClick={clearCart}>Vaciar Carrito</button>
            <button>Proceder al Pago</button>
          </div>
        </div>
      )}
    </div>
  );
}
