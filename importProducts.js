import { db } from './firebaseConfig.js';
import { collection, addDoc } from 'firebase/firestore';
import productsData from './data/products.json' assert { type: 'json' }; // Aserción de tipo JSON

async function importData() {
  const productsCollection = collection(db, 'products');

  try {
    for (const product of productsData.products) {
      await addDoc(productsCollection, product);
      console.log(`Product ${product.id} added successfully`);
    }
    console.log('All products imported successfully');
  } catch (error) {
    console.error('Error adding document: ', error);
  }
}

importData();
