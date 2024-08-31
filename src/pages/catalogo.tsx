// src/pages/catalogo.tsx
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Loader from '../components/Loader';
import { ProductoType } from '@/interfaces/ProductoType';

const Producto = dynamic(() => import('../components/Producto'), {
  suspense: true,
});

export default function Catalogo({ productos }: { productos: ProductoType[] }) {
  return (
    <Suspense fallback={<Loader />}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {productos.map((producto) => (
          <Producto key={producto.id} producto={producto} />
        ))}
      </div>
    </Suspense>
  );
}
