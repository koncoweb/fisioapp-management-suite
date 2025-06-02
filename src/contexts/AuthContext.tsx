import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/components/ui/use-toast';
import { BiometricData, GeofenceSettings } from '@/types/biometric';

// Fungsi untuk menormalisasi role pengguna
const normalizeRole = (role: string): UserRole => {
  const roleMap: Record<string, UserRole> = {
    'admin': 'admin',
    'Admin': 'admin',
    'ADMIN': 'admin',
    'therapist': 'therapist',
    'Therapist': 'therapist',
    'terapis': 'therapist',
    'Terapis': 'therapist',
    'pasien': 'Pasien',
    'Pasien': 'Pasien',
    'patient': 'Pasien',
    'Patient': 'Pasien',
    'karyawan': 'karyawan',
    'Karyawan': 'karyawan',
  };
  
  return roleMap[role] || role as UserRole;
};

export type UserRole = 'admin' | 'therapist' | 'Pasien' | 'karyawan';

export interface AdditionalUserData {
  alamat?: string;
  jenisKelamin?: string;
  usia?: string;
  pekerjaan?: string;
  nomorBPJS?: string;
  nomorAsuransiLain?: string;
}

export interface UserData {
  uid: string;
  email: string;
  namaLengkap: string;
  role: UserRole;
  alamat?: string;
  jenisKelamin?: string;
  usia?: string | number;
  pekerjaan?: string;
  nomorBPJS?: string;
  nomorAsuransiLain?: string;
  biometricData?: BiometricData;
  geofenceSettings?: GeofenceSettings;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, namaLengkap: string, role: UserRole, additionalData?: AdditionalUserData) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as Omit<UserData, 'uid'>;
            console.log('User data from Firestore:', userData);
            
            // Normalisasi role pengguna
            const normalizedRole = normalizeRole(userData.role);
            console.log('Original role:', userData.role);
            console.log('Normalized role:', normalizedRole);
            console.log('Is admin?', normalizedRole === 'admin');
            
            setUserData({
              uid: user.uid,
              ...userData,
              role: normalizedRole // Gunakan role yang sudah dinormalisasi
            });
          } else {
            console.error("User document does not exist in Firestore for user ID:", user.uid);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast({
            title: "Error",
            description: "Failed to fetch user data. Please check Firestore permissions.",
            variant: "destructive",
          });
        }
      } else {
        setUserData(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error: any) {
      console.error(error);
      let message = "Failed to log in";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = "Email atau password tidak valid";
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (
    email: string, 
    password: string, 
    namaLengkap: string, 
    role: UserRole, 
    additionalData?: AdditionalUserData
  ) => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      const user = credential.user;
      
      // Create user profile in Firestore
      try {
        await setDoc(doc(db, 'users', user.uid), {
          email,
          namaLengkap,
          role,
          createdAt: new Date().toISOString(),
          ...additionalData
        });
        
        toast({
          title: "Sukses",
          description: "Akun berhasil dibuat",
        });
      } catch (firestoreError: any) {
        console.error("Firestore error:", firestoreError);
        toast({
          title: "Error",
          description: "Gagal menyimpan data profil. Silakan coba lagi.",
          variant: "destructive",
        });
        throw firestoreError;
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      let message = "Gagal membuat akun";
      if (error.code === 'auth/email-already-in-use') {
        message = "Email sudah terdaftar";
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Clear all caches before signing out
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Clear all local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear all indexedDB databases
      if (window.indexedDB) {
        const databases = await window.indexedDB.databases();
        databases.forEach(db => {
          if (db.name) {
            window.indexedDB.deleteDatabase(db.name);
          }
        });
      }
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      
      // Force reload to clear any remaining state
      window.location.href = '/login';
      
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    isLoading,
    login,
    register,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
