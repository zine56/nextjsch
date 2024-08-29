// src/components/Producto.tsx
import Link from 'next/link';
import Image from 'next/image';
import styles from './Producto.module.css';
import { ProductoType } from '@/interfaces/ProductoType';



export default function Producto({producto}:{producto: ProductoType}) {
  console.log(producto);
  return (
    <div className={styles.producto}>
      <Link href={`/producto/${producto.id}`}>
        <Image src={`${producto.imagen}`} alt={producto.nombre} width={500} height={500} />
        <h2>{producto.nombre}</h2>
        <p>${producto.precio}</p>
      </Link>
    </div>
  );
}
