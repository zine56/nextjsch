import React from 'react';
import MainLayout from '../layouts/MainLayout';
import Link from 'next/link';
import styles from './Error.module.css';

interface ErrorProps {
  statusCode?: number;
}

const Error: React.FC<ErrorProps> & { getInitialProps?: any } = ({ statusCode }) => {
  return (
    <MainLayout>
      <div className={styles.errorContainer}>
        <h1 className={styles.errorTitle}>Oops! Algo salió mal</h1>
        {statusCode ? (
          <p className={styles.errorMessage}>
            Error {statusCode}: Ha ocurrido un error en el servidor
          </p>
        ) : (
          <p className={styles.errorMessage}>
            Ha ocurrido un error en el cliente
          </p>
        )}
        <p className={styles.errorDescription}>
          Lo sentimos, ha ocurrido un error inesperado. Nuestro equipo ha sido notificado y estamos trabajando para solucionarlo.
        </p>
        <Link href="/" className={styles.homeLink}>
          Volver a la página principal
        </Link>
      </div>
    </MainLayout>
  );
};


Error.getInitialProps = ({ res, err }: { res?: { statusCode: number }, err?: { statusCode: number } }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

// Explicitly declare the type for getInitialProps
(Error as any).getInitialProps = Error.getInitialProps;

export default Error;
