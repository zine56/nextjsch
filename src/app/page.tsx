// src/app/page.tsx
import { productos } from '../../data/mockData';
import Producto from '../components/Producto';

export default function Home() {
  return (
      <div>
        <h1>Bienvenido a Nuestra Tienda</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {productos.map((producto) => (
            <Producto key={producto.id} producto={producto} />
          ))}
        </div>
      </div>
  );
}
