// src/pages/catalogo.tsx
import MainLayout from '../layouts/MainLayout';
import { productos } from '../../data/mockData';
import Producto from '../components/Producto';

export default function Catalogo() {
  return (
    <MainLayout>
      <h1>Catálogo</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {productos.map((producto) => (
          <Producto key={producto.id} producto={producto} />
        ))}
      </div>
    </MainLayout>
  );
}
