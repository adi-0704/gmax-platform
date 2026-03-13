'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Dealer' | 'Admin' | 'SalesManager';
  token: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamically import Firebase helpers (client side only)
    import('@/firebase/auth').then(({ subscribeToAuthChanges }) => {
      import('@/firebase/firestore').then(({ getUserDocument }) => {
        const unsubscribe = subscribeToAuthChanges(async (firebaseUser: any) => {
          if (firebaseUser) {
            try {
              // Fetch extended info mapped from Firestore mapping (Role, Company)
              const fsUser = await getUserDocument(firebaseUser.uid);
              if (fsUser) {
                setUser({
                  _id: firebaseUser.uid,
                  name: fsUser.fullName || fsUser.name || 'User',
                  email: firebaseUser.email || '',
                  role: fsUser.role as any,
                  token: await firebaseUser.getIdToken(),
                });
              } else {
                // Fallback for raw accounts with no firestore object
                setUser({
                  _id: firebaseUser.uid,
                  name: 'User',
                  email: firebaseUser.email || '',
                  role: 'Dealer',
                  token: await firebaseUser.getIdToken(),
                });
              }
            } catch (error) {
              console.error("Failed to parse firestore user object", error);
              setUser(null);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });

        // Cleanup subscription
        return () => unsubscribe();
      });
    });
  }, []);

  // Shim placeholders for legacy components relying on context injections
  const login = (userData: User) => setUser(userData);
  
  const logout = async () => {
    const { logoutUser } = await import('@/firebase/auth');
    await logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
