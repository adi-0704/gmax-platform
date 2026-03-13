import { db } from './firebaseConfig';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';

const ORDERS_COLLECTION = 'orders';

export const createOrder = async (orderData: any) => {
  // Add server timestamp
  const dataToSave = {
    ...orderData,
    createdAt: new Date().toISOString(), // Using ISO string for easier sorting/parsing locally
    timestamp: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), dataToSave);
  return { _id: docRef.id, id: docRef.id, ...dataToSave };
};

export const getDealerOrders = async (dealerId: string) => {
  const q = query(
    collection(db, ORDERS_COLLECTION), 
    where('dealerId', '==', dealerId)
    // Add orderBy if needed, assuming simple query for now
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    _id: doc.id,
    id: doc.id,
    ...doc.data()
  }))
  .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // manual sort fallback
};

export const getAllOrders = async () => {
  const querySnapshot = await getDocs(collection(db, ORDERS_COLLECTION));
  return querySnapshot.docs.map(doc => ({
    _id: doc.id,
    id: doc.id,
    ...doc.data()
  })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const updateOrderStatus = async (orderId: string, updates: any) => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(docRef, updates);
  return { _id: orderId, id: orderId, ...updates };
};
