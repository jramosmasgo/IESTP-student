"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar datos iniciales de localStorage si existen
  useEffect(() => {
    const savedData = localStorage.getItem('user_data');
    if (savedData) {
      try {
        setUserData(JSON.parse(savedData));
      } catch (e) {
        console.error("Error parsing user data from localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Si ya tenemos datos en el estado/localStorage, no volvemos a consultar a menos que sea necesario
        // Pero para estar seguros de que los datos son frescos, podemos consultar Firestore
        if (!userData && currentUser.email) {
          await fetchUserData(currentUser.email);
        }
      } else {
        setUserData(null);
        localStorage.removeItem('user_data');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []); // El efecto debe depender solo del mount, internamente manejamos los cambios

  const fetchUserData = async (email: string) => {
    try {
      const emailLower = email.toLowerCase().trim();
      
      // 1. Intentar buscar en 'student'
      const studentQuery = query(collection(db, "student"), where("email", "==", emailLower));
      const studentSnapshot = await getDocs(studentQuery);
      
      if (!studentSnapshot.empty) {
        const doc = studentSnapshot.docs[0];
        const data = doc.data();
        const fullData = { id: doc.id, ...data, type: 'student' };
        setUserData(fullData);
        localStorage.setItem('user_data', JSON.stringify(fullData));
        return;
      }

      // 2. Intentar buscar en 'staff'
      const staffQuery = query(collection(db, "staff"), where("email", "==", emailLower));
      const staffSnapshot = await getDocs(staffQuery);
      
      if (!staffSnapshot.empty) {
        const doc = staffSnapshot.docs[0];
        const data = doc.data();
        const fullData = { id: doc.id, ...data, type: 'staff' };
        setUserData(fullData);
        localStorage.setItem('user_data', JSON.stringify(fullData));
        return;
      }
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUserData(null);
      localStorage.removeItem('user_data');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
