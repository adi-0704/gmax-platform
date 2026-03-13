import { db } from './firebaseConfig';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from 'firebase/firestore';

const PRODUCTS_COLLECTION = 'products';

// Interface for type hinting
export interface Product {
  _id?: string; // used locally
  id?: string; // from firestore
  name: string;
  category: string;
  sku: string;
  price: number;
  stock: number;
  length?: string;
  diameter?: string;
  specifications?: string;
  brand?: string;
  description?: string;
  features?: string[];
  images: string[];
}

export const getProducts = async () => {
  const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
  return querySnapshot.docs.map(doc => ({
    _id: doc.id,
    id: doc.id,
    ...doc.data()
  })) as Product[];
};

export const getProductById = async (id: string) => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { _id: docSnap.id, id: docSnap.id, ...docSnap.data() } as Product;
  }
  return null;
};

export const createProduct = async (productData: Omit<Product, 'id' | '_id'>) => {
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productData);
  return { _id: docRef.id, id: docRef.id, ...productData };
};

export const updateProduct = async (id: string, productData: Partial<Product>) => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(docRef, productData);
  return { _id: id, id, ...productData };
};

export const deleteProduct = async (id: string) => {
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
  return true;
};
