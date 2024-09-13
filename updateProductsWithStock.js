// updateProductsWithStock.js
import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc } from 'firebase/firestore';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
config({ path: join(__dirname, '.env.local') });

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addStockFieldToProducts() {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);

  const updatePromises = snapshot.docs.map(async (doc) => {
    const productRef = doc.ref;
    // Añade el campo 'stock' con un valor predeterminado de 100
    // Puedes ajustar este valor según tus necesidades
    await updateDoc(productRef, {
      stock: 100
    });
    console.log(`Updated product ${doc.id} with stock field`);
  });

  await Promise.all(updatePromises);
  console.log('All products updated with stock field');
}

addStockFieldToProducts().catch(console.error);