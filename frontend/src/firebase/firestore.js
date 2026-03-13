import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

// Store user information in Firestore "users" collection
export const createUserDocument = async (uid, userData) => {
  try {
    const userRef = doc(db, 'users', uid);
    
    await setDoc(userRef, {
      uid,
      role: userData.role || 'Dealer', // Default
      fullName: userData.name || '',
      companyName: userData.companyName || '',
      phoneNumber: userData.phone || '',
      email: userData.email,
      createdAt: new Date().toISOString()
    }, { merge: true }); // Merge ensures we don't accidentally completely overwrite someone
  } catch (error) {
    console.error("Error writing user to Firestore", error);
    throw error;
  }
};

// Fetch user data from Firestore
export const getUserDocument = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error reading user from Firestore", error);
    throw error;
  }
};
