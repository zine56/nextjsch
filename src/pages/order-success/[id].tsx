import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import MainLayout from '../../layouts/MainLayout';
import Head from 'next/head';

interface OrderItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface Order {
  id: string;
  name: string;
  email: string;
  address: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
}

export default function OrderSuccess() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (id) {
      const fetchOrder = async () => {
        const orderDoc = await getDoc(doc(db, 'orders', id as string));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() } as Order);
        }
      };
      fetchOrder();
    }
  }, [id]);

  if (!order) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Order Successful | Our Store</title>
        <meta name="description" content="Your order has been successfully placed." />
      </Head>
      <MainLayout>
        <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg my-10">
          <h1 className="text-3xl font-bold text-green-600 mb-6 text-center">Order Successful!</h1>
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-lg mb-2"><span className="font-semibold">Order ID:</span> {order.id}</p>
            <p className="text-lg mb-2"><span className="font-semibold">Name:</span> {order.name}</p>
            <p className="text-lg mb-2"><span className="font-semibold">Email:</span> {order.email}</p>
            <p className="text-lg mb-2"><span className="font-semibold">Address:</span> {order.address}</p>
          </div>
          <h2 className="text-2xl font-semibold mb-4">Order Items:</h2>
          <ul className="mb-6">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between items-center border-b py-2">
                <span>{item.nombre} x {item.cantidad}</span>
                <span className="font-semibold">${(item.precio * item.cantidad).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <p className="text-xl font-bold text-right mb-6">Total: ${order.total.toFixed(2)}</p>
          <div className="text-center">
            <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-110">
              Volver a la Tienda
            </Link>
          </div>
        </div>
      </MainLayout>
    </>
  );
}
