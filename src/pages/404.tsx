import React from 'react';
import MainLayout from '../layouts/MainLayout';

export default function Custom404() {
  return (
    <MainLayout>
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <h1>404 - Página no encontrada</h1>
        <p>Lo sentimos, la página que estás buscando no existe.</p>
      </div>
    </MainLayout>
  );
}