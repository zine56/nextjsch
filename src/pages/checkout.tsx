import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { db } from '../../firebaseConfig';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import MainLayout from '../layouts/MainLayout';
import Head from 'next/head';

import { CartItem } from '@/interfaces/CartItem';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    address: '',
  });
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(userData.email)) {
      toast.error('Por favor, ingrese un correo electrónico válido.');
      return;
    }

    try {
      // Verificar el stock antes de procesar el pedido
      for (const item of cart) {
        const productRef = doc(db, 'products', item.id);
        const productSnap = await getDoc(productRef);
        const currentStock = productSnap.data()!.stock;
        if (currentStock < item.cantidad) {
          toast.error(`No hay suficiente stock para ${item.nombre}`);
          return;
        }
      }

      // Crear la orden en Firestore
      const orderRef = await addDoc(collection(db, 'orders'), {
        ...userData,
        items: cart,
        total: cart.reduce((sum: number, item: CartItem) => sum + (item.precio * item.cantidad), 0),
        createdAt: new Date().toISOString(),
      });

      // Actualizar el stock para cada producto en la orden
      for (const item of cart) {
        const productRef = doc(db, 'products', item.id);
        const productSnap = await getDoc(productRef);
        await updateDoc(productRef, {
          stock: productSnap.data()!.stock - item.cantidad,
        });
      }

      // Limpiar el carrito
      clearCart();

      // Mostrar notificación de éxito
      toast.success('¡Orden creada exitosamente!');

      // Redirigir a la página de éxito
      router.push(`/order-success/${orderRef.id}`);
    } catch (error) {
      console.error('Error creating order: ', error);
      toast.error('Hubo un error al crear la orden. Por favor, intenta nuevamente.');
    }
  };

  return (
    <>
      <Head>
        <title>Finalizar Compra | Nuestra Tienda</title>
        <meta name="description" content="Completa tu pedido y realiza el pago de tus productos." />
      </Head>
      <MainLayout>
        <div className="max-w-2xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>

          {/* Order summary */}
          <h2 className="text-2xl font-semibold mb-4">Resumen de la Orden</h2>
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            {cart.map((item) => (
              <div key={item.id} className="mb-2">
                <p>
                  {item.nombre} - Cantidad: {item.cantidad}, Precio: ${item.precio}
                </p>
              </div>
            ))}
            <p className="font-bold mt-4">Total: ${cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)}</p>
          </div>

          {/* User info form */}
          <h2 className="text-2xl font-semibold mb-4">Información del Usuario</h2>
          <form onSubmit={placeOrder} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Nombre"
              value={userData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={userData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              name="address"
              placeholder="Dirección"
              value={userData.address}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
            >
              Realizar Pedido
            </button>
          </form>
        </div>
      </MainLayout>
    </>
  );
}