"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

// ---------- types ----------

export interface UserData {
  id: string;
  email?: string;
  type: 'student' | 'staff';
  // Staff & Student shared fields
  name?: string;
  surname?: string;
  dni?: string;
  // Staff-specific
  role?: string;
  code?: string;
  // Student-specific
  degree?: string;
  Semester?: string;
  semester?: string;
  shift?: string;
  active?: boolean;
  qr_data?: string;
  // Escape hatch for extra Firestore fields
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  loading: boolean;
  logout: () => Promise<void>;
}

// ---------- context ----------

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  setUserData: () => {},
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// ---------- provider ----------

/**
 * Reads user_data from localStorage once (lazy initializer).
 * Avoids a separate setState-inside-useEffect anti-pattern.
 */
function loadStoredUserData(): UserData | null {
  try {
    const raw = localStorage.getItem('user_data');
    return raw ? (JSON.parse(raw) as UserData) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(loadStoredUserData);
  const [loading, setLoading] = useState(true);

  // Declared BEFORE the effect so it is always in scope.
  const fetchUserData = useCallback(async (email: string) => {
    try {
      const emailLower = email.toLowerCase().trim();

      // 1. Buscar en 'student'
      const studentQuery = query(
        collection(db, 'student'),
        where('email', '==', emailLower),
      );
      const studentSnapshot = await getDocs(studentQuery);

      if (!studentSnapshot.empty) {
        const doc = studentSnapshot.docs[0];
        const fullData: UserData = { id: doc.id, ...(doc.data() as Omit<UserData, 'id'>), type: 'student' };
        setUserData(fullData);
        localStorage.setItem('user_data', JSON.stringify(fullData));
        return;
      }

      // 2. Buscar en 'staff'
      const staffQuery = query(
        collection(db, 'staff'),
        where('email', '==', emailLower),
      );
      const staffSnapshot = await getDocs(staffQuery);

      if (!staffSnapshot.empty) {
        const doc = staffSnapshot.docs[0];
        const fullData: UserData = { id: doc.id, ...(doc.data() as Omit<UserData, 'id'>), type: 'staff' };
        setUserData(fullData);
        localStorage.setItem('user_data', JSON.stringify(fullData));
        return;
      }
    } catch (error) {
      console.error('Error fetching user data', error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Solo consulta Firestore si aún no tenemos datos locales.
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
    // fetchUserData es estable (useCallback sin deps); userData se lee una
    // sola vez en el mount para decidir si hacer la petición inicial.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserData]);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUserData(null);
      localStorage.removeItem('user_data');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, setUserData, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
