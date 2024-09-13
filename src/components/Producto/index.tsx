// src/components/Producto.tsx
import Link from 'next/link';
import Image from 'next/image';
import styles from './Producto.module.css';
import { ProductoType } from '@/interfaces/ProductoType';

export default function Producto({producto}:{producto: ProductoType}) {
  return (
    <div className={styles.producto}>
      <Link href={`/producto/${producto.id}`}>
        <div style={{ position: 'relative', width: '100%', height: '200px' }}>
          <Image 
            src={producto.imagen} 
            alt={producto.nombre} 
            layout="fill"
            objectFit="cover"
            quality={75}
          />
        </div>
        <h2>{producto.nombre}</h2>
        <p>${producto.precio}</p>
      </Link>
    </div>
  );
}
