// src/pages/producto.tsx
import MainLayout from '../layouts/MainLayout';
import { productos } from '../../data/mockData';
import Producto from '../components/Producto';

export default function ProductoPage() {
  return (
    <MainLayout>
      <h1>Producto</h1>
      {/* Puedes agregar más detalles del producto aquí */}
    </MainLayout>
  );
}
